import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Publishes to npm using changesets.
 *
 * Two transformations are applied to package.json before publishing and
 * reverted afterwards:
 *
 * 1. Strip `@gxxc/*` from `dependencies`.
 *    Moon's `syncProjectWorkspaceDependencies` automatically injects workspace
 *    packages into `dependencies` for build-ordering purposes. The build
 *    bundles them into dist/index.js, so they must not appear as runtime
 *    dependencies of the published package.
 *
 * 2. Strip the `development` export condition.
 *    The `development` condition points at `./src/index.ts`, which is not
 *    included in the published tarball. Leaving it in would cause bundlers
 *    that honour the condition to attempt loading a non-existent file.
 */
export async function publish() {
  const dir = process.env.npm_package_publishConfig_directory;
  if (!dir) {
    throw new Error('a valid publishConfig.directory path must be set');
  }
  const packageJsonPath = path.resolve(dir, 'package.json');
  const packageJsonString = readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonString);

  // Strip bundled workspace packages from runtime dependencies.
  packageJson.dependencies = Object.entries(
    (packageJson.dependencies ?? {}) as Record<string, unknown>
  ).reduce(
    (obj: Record<string, unknown>, [name, version]) => {
      if (!name.startsWith('@gxxc')) obj[name] = version;
      return obj;
    },
    {}
  );

  // Strip the workspace-only `development` export before publishing.
  const rootExport = packageJson.exports['.'];
  packageJson.exports['.'] = {
    types: rootExport.types,
    import: rootExport.import
  };

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
