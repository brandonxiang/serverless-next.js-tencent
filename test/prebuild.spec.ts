import NextjsComponent from '../src/serverless';

test('prebuild', () => {
  new NextjsComponent().prepareBuildManifests({
    name: 'webh5',
    nextConfigDir: 'test/fixtures/app-with-custom-domain'
  });
});
