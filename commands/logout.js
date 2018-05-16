'use strict';

const { removeCredentials } = require('../lib/auth');
const chalk = require('chalk');

module.exports = {
  command: 'logout',
  desc: chalk.whiteBright('Log out from neocities.org site'),
  handler
};

async function handler() {
  const auth = await removeCredentials();
  if (!auth) {
    console.error('\nYou are not logged in!');
    return;
  }
  console.log(chalk`\nLogged out from {green ${auth.siteUrl}}`);
}
