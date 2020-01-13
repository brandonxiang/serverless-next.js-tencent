const fakeEvent = ({ uri }) => {
  return {
    headerParameters: {},
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      connection: 'keep-alive',
      host: 'service-8073mozs-1257949703.gz.apigw.tencentcs.com',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
      'x-anonymous-consumer': 'true',
      'x-api-requestid': '6d86d2a7cfc1d77c719cb407039c75b4',
      'x-b3-traceid': '6d86d2a7cfc1d77c719cb407039c75b4',
      'x-qualifier': '$LATEST'
    },
    httpMethod: 'GET',
    path: uri,
    pathParameters: {},
    queryString: { a: '1', b: '2' },
    queryStringParameters: {},
    requestContext: {
      httpMethod: 'ANY',
      identity: {},
      path: uri,
      serviceId: 'service-8073mozs',
      sourceIp: '119.123.40.188',
      stage: 'test'
    }
  };
};

module.exports = {
  fakeEvent
};
