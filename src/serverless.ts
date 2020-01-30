import { Component } from '@serverless/core';
import fse from 'fs-extra';
import path from 'path';
import execa from 'execa';
import {
  isDynamicRoute,
  expressifyDynamicRoute,
  pathToRegexStr,
  isHtmlPage,
  randomName
} from './helpers';

const { join } = path;

export interface InputOptionType {
  exclude: string[];
  runtime: string;
  name: string;
  codeUri: string;
  code: string;
  timeout: number;
  memorySize: number;
  environment: string;
  vpcConfig: string;
  functionConf: {
    timeout: number;
    memorySize: number;
    environment: string;
    vpcConfig: string;
  };
  serviceName: string;
  serviceId: string;
  region: string;
  apigatewayConf?: {
    protocols: string;
    environment: string;
  };
}

export interface InputType extends Partial<InputOptionType> {
  nextConfigDir: string;
}

export interface InputDefaultType extends Partial<InputOptionType> {
  nextConfigDir?: string;
}

export interface Manifest {
  pages: {
    ssr: {
      dynamic: { [key: string]: { file: string; regex: string } };
      nonDynamic: { [key: string]: string };
    };
    html: {
      dynamic: { [key: string]: { file: string; regex: string } };
      nonDynamic: { [key: string]: string };
    };
  };
  publicFiles: any;
  cloudFrontOrigins: any;
}

const DefaultOption = {
  nextConfigDir: './'
};

class NextjsComponent extends Component {
  async default(inputs: InputDefaultType = {}) {
    const _inputs = { ...DefaultOption, ...inputs };
    await this.build(_inputs);
    return this.deploy(_inputs);
  }

  async readPagesManifest(nextConfigPath: string) {
    console.log(nextConfigPath);
    const pagePath = join(
      nextConfigPath,
      '.next/serverless/pages-manifest.json'
    );
    const hasServerlessPageManifest = fse.existsSync(pagePath);

    if (!hasServerlessPageManifest) {
      return Promise.reject(
        "pages-manifest not found. Check if `next.config.js` target is set to 'serverless'"
      );
    }

    const pagesManifest = await fse.readJSON(pagePath);

    return pagesManifest;
  }

  async prepareBuildManifests(inputs: InputType) {
    console.log(inputs);
    const nextConfigPath = inputs.nextConfigDir
      ? path.resolve(inputs.nextConfigDir)
      : process.cwd();

    const pagesManifest = await this.readPagesManifest(nextConfigPath);

    const defaultBuildManifest: Manifest = {
      pages: {
        ssr: {
          dynamic: {},
          nonDynamic: {}
        },
        html: {
          dynamic: {},
          nonDynamic: {}
        }
      },
      publicFiles: {},
      cloudFrontOrigins: {}
    };

    const ssrPages = defaultBuildManifest.pages.ssr;
    const htmlPages = defaultBuildManifest.pages.html;

    Object.keys(pagesManifest).forEach(route => {
      const pageFile = pagesManifest[route];

      const dynamicRoute = isDynamicRoute(route);
      const expressRoute = dynamicRoute ? expressifyDynamicRoute(route) : '';

      if (isHtmlPage(pageFile)) {
        if (dynamicRoute) {
          htmlPages.dynamic[expressRoute] = {
            file: pageFile,
            regex: pathToRegexStr(expressRoute)
          };
        } else {
          htmlPages.nonDynamic[route] = pageFile;
        }
      } else {
        if (dynamicRoute) {
          ssrPages.dynamic[expressRoute] = {
            file: pageFile,
            regex: pathToRegexStr(expressRoute)
          };
        } else {
          ssrPages.nonDynamic[route] = pageFile;
        }
      }
    });

    await this.buildHandler(nextConfigPath, defaultBuildManifest);

    return defaultBuildManifest;
  }

  async buildHandler(nextConfigPath: string, defaultBuildManifest: Manifest) {
    const manifestJson = join(nextConfigPath, '.next/serverless/manifest.json');
    const entryHandler = join(nextConfigPath, '.next/serverless/index.js');
    const utilHandler = join(nextConfigPath, '.next/serverless/utils.js');
    return await Promise.all([
      fse.writeJson(manifestJson, defaultBuildManifest),
      fse.copy('template/default-scf-handler.js', entryHandler),
      fse.copy('template/utils.js', utilHandler)
    ]);
  }

  async build(inputs: InputType) {
    await execa('node_modules/.bin/next', ['build']);

    const defaultBuildManifest = await this.prepareBuildManifests(inputs);

    console.log(JSON.stringify(defaultBuildManifest));
  }

  async deploy(inputs: InputType) {
    inputs.exclude = ['.git/**', '.gitignore', '.serverless', '.DS_Store'];
    inputs.runtime = 'Nodejs8.9';
    inputs.name = inputs.name || 'SsrComponent_' + randomName();
    inputs.codeUri = join(
      process.cwd(),
      inputs.nextConfigDir,
      '.next/serverless'
    );

    const tencentCloudFunction = await this.load('@serverless/tencent-scf');
    const tencentApiGateway = await this.load('@serverless/tencent-apigateway');

    if (inputs.functionConf) {
      inputs.timeout = inputs.functionConf.timeout
        ? inputs.functionConf.timeout
        : 3;
      inputs.memorySize = inputs.functionConf.memorySize
        ? inputs.functionConf.memorySize
        : 128;
      if (inputs.functionConf.environment) {
        inputs.environment = inputs.functionConf.environment;
      }
      if (inputs.functionConf.vpcConfig) {
        inputs.vpcConfig = inputs.functionConf.vpcConfig;
      }
    }

    console.log(inputs);

    const tencentCloudFunctionOutputs = await tencentCloudFunction(inputs);

    const apigwParam = {
      serviceName: inputs.serviceName,
      description: 'Serverless Framework tencent-express Component',
      serviceId: inputs.serviceId,
      region: inputs.region,
      protocols:
        inputs.apigatewayConf && inputs.apigatewayConf.protocols
          ? inputs.apigatewayConf.protocols
          : ['http'],
      environment:
        inputs.apigatewayConf && inputs.apigatewayConf.environment
          ? inputs.apigatewayConf.environment
          : 'release',
      endpoints: [
        {
          path: '/',
          method: 'ANY',
          function: {
            isIntegratedResponse: true,
            functionName: tencentCloudFunctionOutputs.Name
          }
        }
      ]
    };

    const tencentApiGatewayOutputs = await tencentApiGateway(apigwParam);
    const outputs = {
      region: inputs.region || 'ap-guangzhou',
      functionName: inputs.name,
      apiGatewayServiceId: tencentApiGatewayOutputs.serviceId,
      url: `${this.getDefaultProtocol(tencentApiGatewayOutputs.protocols)}://${
        tencentApiGatewayOutputs.subDomain
      }/${tencentApiGatewayOutputs.environment}/`
    };

    return outputs;
  }

  getDefaultProtocol(protocols: string) {
    return protocols;
  }
}

// new NextjsComponent().build({
//   name: 'webh5',
//   handler: 'index.main_handler',
//   nextConfigDir: 'test/fixtures/app-with-custom-domain'
// });

// new NextjsComponent().deploy({
//   name: 'mySsr',
//   handler: 'index.main_handler',
//   runtime: 'Nodejs8.9',
//   codeUri: './code',
//   nextConfigDir: 'example',
//   region: 'ap-shanghai'
// });

export default NextjsComponent;
