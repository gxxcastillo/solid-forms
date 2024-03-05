import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Publishes to npm using changesets.
 *
 * Also, handles updating package.json prior to publishing and then switching things back
 */
export async function publish() {
  const dir = process.env.npm_package_publishConfig_directory;
  if (!dir) {
    throw new Error('a valid publishConfig.directory path must be set');
  }
  const packageJsonPath = path.resolve(dir, 'package.json');
  const packageJsonString = readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonString);

  // We need to depend on local packages during development,
  // however, we don't want them in our published package.
  packageJson.dependencies = Object.entries(packageJson.dependencies || {}).reduce(
    (obj: Record<string, unknown>, [name, version]) => {
      if (name.startsWith('@gxxc')) {
        return obj;
      }

      obj[name] = version;
      return obj;
    },
    {}
  );

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  const pub = spawn('npx', ['changeset', 'publish'], { stdio: 'inherit' });

  pub.on('exit', function (code) {
    const originalPackageJson = JSON.parse(packageJsonString);
    writeFileSync(packageJsonPath, JSON.stringify(originalPackageJson, null, 2));

    if (code !== 0) {
      console.log('Publish was unsuccessful, exited with code ' + code?.toString());
    }
  });
}

await publish();
