'use strict';

const { wrap } = require('./utils');
const chalk = require('chalk');
const prettyBytes = require('pretty-bytes');

module.exports = {
  command: 'list [path]',
  desc: 'List files from site',
  handler: wrap(handler)
};

async function handler({ client, credentials }, { path = '/' }) {
  const sitename = credentials.login;
  const items = await client.list({ path });
  const url = `https://${sitename}.neocities.org`;
  console.log(chalk`\nContents of {bold.green ${path}} at {bold.green ${url}}:`);
  printItems(items);
}

function printItems(items) {
  console.log();
  items.forEach(item => {
    if (item.is_directory) {
      console.log(chalk`{blue.bold ${item.path}}`);
      return;
    }
    console.log(chalk`{white ${item.path}}\t${prettyBytes(item.size)}`);
  });
}
