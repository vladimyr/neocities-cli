'use strict';

const { promisify } = require('util');
const { wrap } = require('./utils');
const { ZipFile } = require('yazl');
const chalk = require('chalk');
const path = require('path');
const r2 = require('r2');
const rimraf = promisify(require('rimraf'));
const tempy = require('tempy');
const urlJoin = require('url-join');
const writeFile = require('write');

module.exports = {
  command: 'download',
  desc: 'Download files from site',
  handler: wrap(handler)
};

async function handler({ client, credentials }) {
  const sitename = credentials.login;
  const items = await client.list({ sitename });
  const files = items.filter(it => !it.is_directory);
  const baseUrl = `https://${sitename}.neocities.org/`;
  const dest = tempy.directory();
  try {
    const entries = await Promise.all(
      files.map(it => download(it.path, baseUrl, dest))
    );
    const archivePath = await createArchive(entries);
    await rimraf(dest);
    console.log(chalk`\nSite downloaded to {bold.blue ${archivePath}}`);
  } catch (err) {
    console.error(chalk`\n{bgRed.white.bold Login error} ${err.message}`);
    process.exit(1);
  }
}

async function download(filePath, baseUrl, dest) {
  const localPath = path.join(dest, filePath);
  const url = urlJoin(baseUrl, filePath);
  const buf = await r2(url).arrayBuffer;
  await writeFile.promise(localPath, Buffer.from(buf), { encoding: 'utf8' });
  return { realPath: localPath, metadataPath: filePath };
}

function createArchive(entries, dest = process.cwd()) {
  const zip = new ZipFile();
  entries.forEach(it => zip.addFile(it.realPath, it.metadataPath));
  zip.end();
  return new Promise((resolve, reject) => {
    const archivePath = path.join(dest, 'site.zip');
    zip.outputStream.pipe(writeFile.stream(archivePath))
      .once('error', reject)
      .once('finish', () => resolve(archivePath));
  });
}
