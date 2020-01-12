const { Component } = require("@serverless/core");
const fse = require("fs-extra");
const path = require('path');

const isHtmlPage = p => p.endsWith(".html");

class NextjsComponent extends Component {
  async default(inputs = {}) {
    await this.build(inputs);

    return this.deploy(inputs);
  }

  async readPagesManifest (nextConfigPath) {
    const pagePath = join(nextConfigPath, ".next/serverless/pages-manifest.json");
    const hasServerlessPageManifest = await fse.exists(pagePath);

    if(hasServerlessPageManifest) {
      return Promise.reject(
        "pages-manifest not found. Check if `next.config.js` target is set to 'serverless'"
      );
    }

    const pagesManifest = await fse.readJSON(pagePath);

    return pagesManifest;
  }

  prepareBuildManifests(nextConfigPath) {
    const nextConfigPath = inputs.nextConfigDir
      ? path.resolve(inputs.nextConfigDir)
      : process.cwd();

      const pagesManifest = this.readPagesManifest(nextConfigPath);

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

      Object.entries(pagesManifest).forEach(route => {
        const pageFile = pagesManifest[route];
        if (isHtmlPage(pageFile)) {
          htmlPages.nonDynamic[route] = pageFile;
        } else {
          ssrPages.nonDynamic[route] = pageFile;
        }
      })

      return defaultBuildManifest;
  }
  
  async build(inputs) {
    const defaultBuildManifest = await this.prepareBuildManifests(inputs);

    console.log(defaultBuildManifest);

  }

  deploy(inputs) {
    inputs.exclude = ['.git/**', '.gitignore', '.serverless', '.DS_Store']
    inputs.runtime = 'Nodejs8.9'
    inputs.name = inputs.functionName || 'ExpressComponent_' + result
    inputs.codeUri = inputs.code || process.cwd()
    // if (!(await utils.fileExists(appFile))) {
    //   throw new Error(`app.js not found in ${inputs.codeUri}`)
    // }

    const tencentCloudFunction = await this.load('@serverless/tencent-scf');
    const tencentApiGateway = await this.load('@serverless/tencent-apigateway');
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
    }
    
    const tencentApiGatewayOutputs = await tencentApiGateway(apigwParam);
    const outputs = {
      region: inputs.region || 'ap-guangzhou',
      functionName: inputs.name,
      apiGatewayServiceId: tencentApiGatewayOutputs.serviceId,
      url: `${this.getDefaultProtocol(tencentApiGatewayOutputs.protocols)}://${
        tencentApiGatewayOutputs.subDomain
      }/${tencentApiGatewayOutputs.environment}/`
    }

    return outputs

  }
}

(new NextjsComponent()).build({name: 'mySSr', code: './example/.next/serverless', handler: 'index.main_handler'})

// (new NextjsComponent()).deploy({name: 'mySSr', code: './example/.next/serverless', handler: 'index.main_handler'})