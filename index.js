const http = require('http');
const page = require('./.next/serverless/pages/_error');

const server = http.createServer((req, res) => {
  page.render(req, res)
}).listen(3000);