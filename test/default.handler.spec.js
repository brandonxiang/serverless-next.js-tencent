const { fakeEvent } = require('./libs/tcfEvent');

jest.mock(
  '../template/manifest.json',
  () => require('./fixtures/default-manifest.json'),
  {
    virtual: true
  }
);

const mockPageRequire = mockPagePath => {
  jest.mock(
    `../template/${mockPagePath}`,
    () => require(`./fixtures/built-artifact/${mockPagePath}`),
    {
      virtual: true
    }
  );
};

test('SSR Pages routing render pages', async () => {
  mockPageRequire('pages/customers/index.js');
  const { main_handler } = require('../template/default-scf-handler.js');

  const event = fakeEvent({ uri: '/nextjs/customers' });

  const response = await main_handler(event);

  const decodedBody = new Buffer(response.body, 'base64').toString('utf8');

  expect(decodedBody).toEqual('pages/customers/index.js');
});
