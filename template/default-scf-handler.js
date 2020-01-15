const defaultPath = 'nextjs';
const manifest = require('./manifest.json');
const converter = require('./utils');
const fs = require('fs');
const path = require('path');

const router = manifest => {
  const {
    pages: { ssr, html }
  } = manifest;

  const allDynamicRoutes = { ...ssr.dynamic, ...html.dynamic };

  return path => {
    if (ssr.nonDynamic[path]) {
      return ssr.nonDynamic[path];
    }

    for (route in allDynamicRoutes) {
      const { file, regex } = allDynamicRoutes[route];

      const re = new RegExp(regex, 'i');
      const pathMatchesRoute = re.test(path);

      if (pathMatchesRoute) {
        return file;
      }
    }

    return 'pages/_error.js';
  };
};

const normaliseUri = uri => {
  const re = new RegExp(`/${defaultPath}`, 'i');
  const url = uri.replace(re, '');
  return url === '/' ? '/index' : url;
};

exports.main_handler = async event => {
  const uri = normaliseUri(event.path);
  const { pages } = manifest;

  const staticPagePath = pages.html.nonDynamic[uri];
  console.log(staticPagePath);
  if (staticPagePath) {
    const html = fs.readFileSync(path.resolve(__dirname, staticPagePath), {
      encoding: 'utf-8'
    });
    return {
      isBase64Encoded: false,
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }

  const pagePath = router(manifest)(uri);
  const page = require(`./${pagePath}`);

  const { req, res, responsePromise } = converter(event);
  page.render(req, res);
  return responsePromise;
};
