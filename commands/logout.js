'use strict';

const chalk = require('chalk');
const netrc = require('../lib/netrc.js');

module.exports = {
  command: 'logout',
  desc: 'Log out from neocities.org site',
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
  delete conf['neocities.org'];
  await netrc.write(conf);
  console.log(chalk`\nLogged out from {green ${location}}`);
}
