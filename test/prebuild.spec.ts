import NextjsComponent from '../src/serverless';
import fs from 'fs';

test('prebuild', () => {
  // console.log(NextjsComponent);
  const nextjsComponent = new NextjsComponent();
  nextjsComponent.prepareBuildManifests({
    name: 'webh5',
    nextConfigDir: 'test/fixtures/prebuild'
  });

  const existIndex = fs.existsSync(
    './fixtures/prebuild/.next/serverless/index.js'
  );
  expect(existIndex).toBe(true);
});
