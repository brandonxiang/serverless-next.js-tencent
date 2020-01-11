const { Component } = require("@serverless/core");
const 
const fse = require("fs-extra");
const path = require('path');

const isHtmlPage = p => p.endsWith(".html");

class NextjsComponent extends Component {
  async default(inputs = {}) {
    await this.build(inputs);

    return this.deploy(inputs);
  }

  readPagesManifest (nextConfigPath) {
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

  }
  
  build(inputs) {
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
  }

  deploy() {
    
  }
}