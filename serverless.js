const { Component } = require('@serverless/core');
const fse = require('fs-extra');
const path = require('path');
const execa = require('execa');

const { join } = path;

const isHtmlPage = p => p.endsWith('.html');

const randomName = () => {
  const len = 6;
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = chars.length;
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
};

class NextjsComponent extends Component {
  async default(inputs = {}) {
    await this.build(inputs);

    return this.deploy(inputs);
  }

  async readPagesManifest(nextConfigPath) {
    const pagePath = join(
      nextConfigPath,
      '.next/serverless/pages-manifest.json'
    );
    console.log(pagePath);
    const hasServerlessPageManifest = await fse.exists(pagePath);

    if (!hasServerlessPageManifest) {
      return Promise.reject(
        "pages-manifest not found. Check if `next.config.js` target is set to 'serverless'"
      );
    }

    const pagesManifest = await fse.readJSON(pagePath);

    return pagesManifest;
  }

  async prepareBuildManifests(inputs) {
    const nextConfigPath = inputs.nextConfigDir
      ? path.resolve(inputs.nextConfigDir)
      : process.cwd();

    const pagesManifest = await this.readPagesManifest(nextConfigPath);

    const defaultBuildManifest = {
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
      if (isHtmlPage(pageFile)) {
        htmlPages.nonDynamic[route] = pageFile;
      } else {
        ssrPages.nonDynamic[route] = pageFile;
      }
    });

    await this.buildHandler(nextConfigPath, defaultBuildManifest);

    return defaultBuildManifest;
  }

  async buildHandler(nextConfigPath, defaultBuildManifest) {
    const manifestJson = join(nextConfigPath, '.next/serverless/manifest.json');
    const entryHandler = join(nextConfigPath, '.next/serverless/index.js');
    const utilHandler = join(nextConfigPath, '.next/serverless/utils.js');
    return await Promise.all([
      fse.writeJson(manifestJson, defaultBuildManifest),
      fse.copy('template/default-scf-handler.js', entryHandler),
      fse.copy('template/utils.js', utilHandler)
    ]);
  }

  async build(inputs) {
    // await execa('node_modules/.bin/next', ['build']);

    const defaultBuildManifest = await this.prepareBuildManifests(inputs);

    console.log(JSON.stringify(defaultBuildManifest));
  }

  async deploy(inputs) {
    inputs.exclude = ['.git/**', '.gitignore', '.serverless', '.DS_Store'];
    inputs.runtime = 'Nodejs8.9';
    inputs.name = inputs.name || 'SsrComponent_' + randomName();
    inputs.codeUri =
      inputs.code ||
      join(process.cwd(), inputs.nextConfigDir, '.next/serverless');

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

    console.log(3333333333333);

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
}

new NextjsComponent().build({
  name: 'mySsr',
  handler: 'index.main_handler',
  nextConfigDir: 'example'
});

// new NextjsComponent().deploy({
//   name: 'mySsr',
//   handler: 'index.main_handler',
//   runtime: 'Nodejs8.9',
//   codeUri: './code',
//   nextConfigDir: 'example',
//   region: 'ap-shanghai'
// });

module.exports = NextjsComponent;
