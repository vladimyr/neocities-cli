'use strict';

const chalk = require('chalk');
const netrc = require('../lib/netrc.js');

module.exports = {
  command: 'whoami',
  desc: 'Show to which site you are logged in',
  handler
};

async function handler() {
  const conf = await netrc.read();
  const credentials = conf['neocities.org'];
  if (!credentials) {
    console.error('\nYou are not logged in!');
    return;
  }
  const location = `https://${credentials.login}.neocities.org`;
  console.log(chalk`\nLogged to {green ${location}}`);
}
