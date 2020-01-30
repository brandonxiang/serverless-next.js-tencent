import NextjsComponent from '../src/serverless';
import fs from 'fs';
import path from 'path';

const existFile = (pathstr: string) => fs.existsSync(path.resolve(pathstr));

test('prebuild', () => {
  const nextjsComponent = new NextjsComponent();
  nextjsComponent.prepareBuildManifests({
    name: 'webh5',
    nextConfigDir: 'test/fixtures/prebuild'
  });

  console.log(
    path.resolve('./test/fixtures/prebuild/.next/serverless/index.js')
  );

  const existIndex = existFile(
    './test/fixtures/prebuild/.next/serverless/index.js'
  );
  const existUtils = existFile(
    './test/fixtures/prebuild/.next/serverless/utils.js'
  );
  const existManifest = existFile(
    './test/fixtures/prebuild/.next/serverless/manifest.json'
  );

  expect(existIndex).toBe(true);
  expect(existUtils).toBe(true);
  expect(existManifest).toBe(true);
});
