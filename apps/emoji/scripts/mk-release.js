import os from 'os';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import shell from 'shelljs';
import { Octokit } from '@octokit/core';

const REPO = 'wonderbeyond/wondertools';

const configFilePath = path.join(os.homedir(), '.config/wondertools.yaml')
const config = YAML.parse(fs.readFileSync(configFilePath, 'utf-8'))

const octokit = new Octokit({
  auth: config['github-access-token']
});

function getRandomString(len=8) {
  var res = [];
  const c1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const c2 = c1.toLowerCase();
  const choices = c1 + c2 + '0123456789';
  for (var i = 0; i < len; i++) {
      res.push(choices.charAt(Math.floor(Math.random() * choices.length)));
  }
  return res.join('');
}

async function getReleaseTag () {
  let res = shell.exec('echo $(git describe --tags 2> /dev/null || git rev-parse HEAD)', {
    silent: true
  });
  if (res.code == 0) {
    return res.stdout.trim();
  } else {
    throw new Error(res.stderr);
  }
}

async function getDistData () {
  let dest = path.join(shell.tempdir(), `WT_${getRandomString(8)}.zip`)
  let res = shell.exec(`set -ex; cd dist; zip -r ${dest} *`)

  if (res.code == 0) {
    let distData = fs.readFileSync(dest);
    shell.rm(dest);
    return distData;
  } else {
    throw new Error(res.stderr);
  }
}

async function main () {
  const tagName = await getReleaseTag();
  let makeReleaseResp;
  let releaseId;

  let distData = await getDistData();

  try {
    makeReleaseResp = await octokit.request(`POST /repos/${REPO}/releases`, {
      'tag_name': tagName
    });
    releaseId = makeReleaseResp.data.id;
    console.log(`Release created, with tag="${tagName}", ID=${releaseId}.`);
  } catch (e) {
    if (e.name === 'HttpError' && e.message) {
      console.error(e.message);
      process.exit(1);
    }
  }

  const uploadAssetResp = await octokit.request('POST ' + makeReleaseResp.data.upload_url, {
    name: `${tagName}.zip`,
    label: `App package`,
    headers: {
      'Content-Type': 'application/zip',
    },
    data: distData,
  })

  console.log(`Published: ${uploadAssetResp.data.browser_download_url}`);
}

main();
