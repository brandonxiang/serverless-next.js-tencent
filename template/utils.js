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
    isBase64Encoded: true,
    bodyEncoding: 'base64',
    statusCode: 200,
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
      return response.statusCode;
    },
    set(statusCode) {
      response.statusCode = statusCode;
    }
  });

  res.headers = {};
  res.writeHead = (status, headers) => {
    response.statusCode = status;
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
      response.headers = res.headers;

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
