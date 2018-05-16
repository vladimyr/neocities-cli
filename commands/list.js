'use strict';

const { join, relative } = require('path');
const { wrap } = require('./utils');
const chalk = require('chalk');
const prettyBytes = require('pretty-bytes');

module.exports = {
  command: 'list [path]',
  desc: chalk.whiteBright('List files from site'),
  handler: wrap(handler)
};

async function handler({ client, auth }, { path = '/' }) {
  path = join('/', path);
  const url = auth.siteUrl;
  const items = await client.list({ path });
  console.log(chalk`\nContents of {bold.green ${path}} at {bold.green ${url}}:`);
  printItems(items, path);
}

function printItems(items, dir) {
  console.log();
  items.forEach(item => {
    if (item.is_directory) {
      console.log(chalk`{blue.bold ${item.path}}`);
      return;
    }
    const path = relative(dir, join('/', item.path));
    console.log(chalk`{white ${path}}\t${prettyBytes(item.size)}`);
  });
}
