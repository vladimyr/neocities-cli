'use strict';

const { wrap } = require('./utils');
const chalk = require('chalk');
const humanize = require('humanize-string');

const each = (obj, cb) => Object.keys(obj).forEach(key => cb(obj[key], key));

module.exports = {
  command: 'info [sitename]',
  desc: 'Show site information',
  handler: wrap(handler)
};

async function handler({ client, credentials }, { sitename }) {
  sitename = sitename || credentials.login;
  sitename = sitename.replace(/\.neocities\.org$/, '').toLowerCase();
  const info = await client.info({ sitename });
  printInfo(info);
}

function printInfo(info) {
  const url = `https://${info.sitename}.neocities.org`;
  console.log(chalk`\n{bold.green ${url}} info:\n`);
  each(info, (value, key) => {
    console.log(chalk`{blue ${humanize(key)}:}`, value || '');
  });
}
