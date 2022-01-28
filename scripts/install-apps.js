import os, { release } from 'os';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import shell from 'shelljs';
import superagent from 'superagent';

const apps = YAML.parse(fs.readFileSync('apps.yaml', 'utf-8'))
const cacheDir = path.join(os.homedir(), '.cache/wondertools/apps')

shell.mkdir('-p', cacheDir);

function buildDownloadUrl (release) {
  return `https://github.com/wonderbeyond/wondertools/releases/download/${release}/${release}.zip`
}

for (const app of apps) {
  const downloadUrl = buildDownloadUrl(app.release);
  const downloadPath = path.join(cacheDir, `${app.release}.zip`);
  const installTarget = `dist/apps/${app.name}`;

  if (fs.existsSync(downloadPath)) {
    console.log(`Use existing ${downloadPath}`);
  } else {
    console.log(`Fetching ${downloadUrl}`);
    const resp = await superagent.get(downloadUrl).responseType('blob');
    fs.writeFileSync(downloadPath, resp.body);
    console.log(`Written to ${downloadPath}`);
  }

  let res = shell.exec(`mkdir -p ${installTarget} && unzip -f ${downloadPath} -d ${installTarget}`);
  if (res.code !== 0) {
    throw new Error(res.stderr);
  } else {
    console.log(`Installed ${app.name} to ${installTarget}`);
  }
}
