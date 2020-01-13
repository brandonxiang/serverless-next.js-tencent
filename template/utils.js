const Stream = require('stream');

const specialNodeHeaders = [
  'age',
  'authorization',
  'content-length',
  'content-type',
  'etag',
  'expires',
  'from',
  'host',
  'if-modified-since',
  'if-unmodified-since',
  'last-modified',
  'location',
  'max-forwards',
  'proxy-authorization',
  'referer',
  'retry-after',
  'user-agent'
];

const readOnlyCloudFrontHeaders = {
  'accept-encoding': true,
  'content-length': true,
  'if-modified-since': true,
  'if-none-match': true,
  'if-range': true,
  'if-unmodified-since': true,
  'transfer-encoding': true,
  via: true
};

const toCloudFrontHeaders = headers => {
  const result = {};

  Object.keys(headers).forEach(headerName => {
    if (!readOnlyCloudFrontHeaders[headerName.toLowerCase()]) {
      result[headerName] = [
        {
          key: headerName,
          value: headers[headerName].toString()
        }
      ];
    }
  });

  return result;
};

function titleCase(str) {
  return str.toLowerCase().replace(/(-| |^)[a-z]/g, L => L.toUpperCase());
}

const handler = event => {
  const response = {
    body: Buffer.from(''),
    bodyEncoding: 'base64',
    status: 200,
    statusDescription: 'OK',
    headers: {}
  };

  const req = new Stream.Readable();
  req.url = event.path;
  req.method = event.httpMethod;
  req.rawHeaders = [];
  req.headers = {};
  req.connection = {};

  if (event.querystring) {
    req.url = req.url + `?` + event.querystring;
  }

  const headers = event.headers || {};

  for (const lowercaseKey of Object.keys(headers)) {
    const headerValue = headers[lowercaseKey];

    req.rawHeaders.push(titleCase(lowercaseKey));
    req.rawHeaders.push(headerValue);
  }

  req.getHeader = name => {
    return req.headers[name.toLowerCase()];
  };

  req.getHeaders = () => {
    return req.headers;
  };

  if (event.body && event.body.data) {
    req.push(event.body.data, event.body.encoding ? 'base64' : undefined);
  }

  req.push(null);

  const res = new Stream();
  res.finished = false;

  Object.defineProperty(res, 'statusCode', {
    get() {
      return response.status;
    },
    set(statusCode) {
      response.status = statusCode;
    }
  });

  res.headers = {};
  res.writeHead = (status, headers) => {
    response.status = status;
    if (headers) {
      res.headers = Object.assign(res.headers, headers);
    }
  };
  res.write = chunk => {
    response.body = Buffer.concat([
      response.body,
      Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    ]);
  };

  const responsePromise = new Promise(resolve => {
    res.end = text => {
      if (text) res.write(text);
      res.finished = true;
      response.body = Buffer.from(response.body).toString('base64');
      response.headers = toCloudFrontHeaders(res.headers);

      resolve(response);
    };
  });

  res.setHeader = (name, value) => {
    res.headers[name] = value;
  };
  res.removeHeader = name => {
    delete res.headers[name];
  };
  res.getHeader = name => {
    return res.headers[name.toLowerCase()];
  };
  res.getHeaders = () => {
    return res.headers;
  };

  return {
    req,
    res,
    responsePromise
  };
};

handler.SPECIAL_NODE_HEADERS = specialNodeHeaders;

module.exports = handler;
// handler({
//   "headerParameters": {},

//   "headers": {
//     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",

//     "accept-encoding": "gzip, deflate, br",

//     "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",

//     "connection": "keep-alive",

//     "host": "service-8073mozs-1257949703.gz.apigw.tencentcs.com",

//     "sec-fetch-mode": "navigate",

//     "sec-fetch-site": "none",

//     "sec-fetch-user": "?1",

//     "upgrade-insecure-requests": "1",

//     "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",

//     "x-anonymous-consumer": "true",

//     "x-api-requestid": "6d86d2a7cfc1d77c719cb407039c75b4",

//     "x-b3-traceid": "6d86d2a7cfc1d77c719cb407039c75b4",

//     "x-qualifier": "$LATEST"
//   },

//   "httpMethod": "GET",

//   "path": "/nextjs",

//   "pathParameters": {},

//   "queryString": { "a": "1", "b": "2" },

//   "queryStringParameters": {},

//   "requestContext": {
//     "httpMethod": "ANY",

//     "identity": {},

//     "path": "/nextjs",

//     "serviceId": "service-8073mozs",

//     "sourceIp": "119.123.40.188",

//     "stage": "test"
//   }
// }
// )
