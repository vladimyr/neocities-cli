'use strict';

const { promisify } = require('util');
const { wrap } = require('./utils');
const { ZipFile } = require('yazl');
const chalk = require('chalk');
const downloadsFolder = require('downloads-folder');
const fecha = require('fecha');
const path = require('path');
const pMap = require('p-map');
const pMapSeries = require('p-map-series');
const r2 = require('r2');
const rimraf = promisify(require('rimraf'));
const tempy = require('tempy');
const urlJoin = require('url-join');
const writeFile = require('write');

const dateFormat = 'YYYY-MM-DD_HH-mm-ss';
const flatten = arr => [].concat.apply([], arr);

const options = {
  dest: {
    alias: 'd',
    describe: 'download directory',
    type: 'string'
  }
};

module.exports = {
  command: 'download',
  desc: 'Download files from site',
  handler: wrap(handler),
  builder: options
};

async function handler({ client, credentials }, { dest }) {
  const timestamp = fecha.format(new Date(), dateFormat);
  const sitename = credentials.login;
  const files = await walk(client);
  const baseUrl = `https://${sitename}.neocities.org/`;
  const tmpdir = tempy.directory();
  try {
    const entries = await pMap(files, it => {
      return download(it.path, baseUrl, tmpdir);
    }, { concurrency: 16 });
    const archivePath = await createArchive(entries, timestamp, dest);
    await rimraf(tmpdir);
    console.log(chalk`\nSite downloaded to {bold.blue ${archivePath}}`);
  } catch (err) {
    console.error(chalk`\n{bgRed.white.bold Login error} ${err.message}`);
    process.exit(1);
  }
}

async function walk(client, path = '/') {
  const items = await client.list({ path });
  const tree = await pMapSeries(items, it => {
    return it.is_directory ? walk(client, it.path) : it;
  });
  const files = flatten(tree);
  return files;
}

async function download(filePath, baseUrl, dest) {
  const localPath = path.join(dest, filePath);
  const url = urlJoin(baseUrl, filePath);
  const buf = await r2(url).arrayBuffer;
  await writeFile.promise(localPath, Buffer.from(buf), { encoding: 'utf8' });
  return { realPath: localPath, metadataPath: filePath };
}

function createArchive(entries, timestamp, dest = downloadsFolder()) {
  const zip = new ZipFile();
  entries.forEach(it => zip.addFile(it.realPath, it.metadataPath));
  zip.end();
  return new Promise((resolve, reject) => {
    const archivePath = path.join(dest, `site-backup.${timestamp}.zip`);
    zip.outputStream.pipe(writeFile.stream(archivePath))
      .once('error', reject)
      .once('finish', () => resolve(archivePath));
  });
}
