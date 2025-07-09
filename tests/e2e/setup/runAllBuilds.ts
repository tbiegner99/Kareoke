#! node
import path from 'path';
import fs from 'fs/promises';
import process from 'child_process';

const RELATIVE_APPS_DIRECTORY = '../../../ui/apps/';

async function exec(cmd, options) {
  return new Promise((resolve) => {
    process.exec(cmd, options, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      resolve(null);
    });
  });
}

async function buildDirectoryExists(filename) {
  try {
    const buildDir = path.resolve(__dirname, RELATIVE_APPS_DIRECTORY, filename, 'build');
    await fs.stat(buildDir);
    return true;
  } catch (err) {
    return false;
  }
}

async function isApp(app) {
  let isValidApp = false;
  try {
    const filePath = path.resolve(__dirname, RELATIVE_APPS_DIRECTORY, app, 'package.json');
    await fs.readFile(filePath);

    isValidApp = true;
  } catch (err) {}
  return {
    appName: app,
    isApp: isValidApp
  };
}

async function loadApps() {
  const files = await fs.readdir(path.resolve(__dirname, RELATIVE_APPS_DIRECTORY));
  console.log(files);
  const appInfo = await Promise.all(files.map((app) => isApp(app)));
  const validApps = appInfo.filter((app) => app.isApp);
  console.log(validApps);
  return validApps.map((app) => app.appName);
}

async function runBuild(filename, options) {
  const { force = false } = options;
  const buildExists = await buildDirectoryExists(filename);
  const shouldBuild = !buildExists;
  if (shouldBuild || force) {
    const cwd = path.resolve(__dirname, RELATIVE_APPS_DIRECTORY, filename);
    const cmd = `npm run build`;
    console.log(`executing '${cmd}' in '${cwd}`);
    await exec(cmd, { cwd });
  }
}

async function getArtifact(app): Promise<any> {
  const packageJson = await fs.readFile(
    path.resolve(__dirname, RELATIVE_APPS_DIRECTORY, app, 'package.json'),
    'utf-8'
  );
  const packageInfo = JSON.parse(packageJson);
  const artifact = path.basename(packageInfo.main);
  console.log(artifact);
  const artifactPath = `/local/apps/${app}/${artifact}`;
  return {
    app,
    moduleName: packageInfo.name,
    artifactPath
  };
}

export async function runAllBuilds(options: any = {}): Promise<any[]> {
  const apps = await loadApps();
  await Promise.all(apps.map((file) => runBuild(file, options)));
  return Promise.all(apps.map((app) => getArtifact(app)));
}
