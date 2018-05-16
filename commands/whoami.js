'use strict';

const { getCredentials } = require('../lib/auth');
const chalk = require('chalk');

module.exports = {
  command: 'whoami',
  desc: chalk.whiteBright('Show to which site you are logged in'),
  handler
};

async function handler() {
  const auth = await getCredentials();
  if (!auth) {
    console.error('\nYou are not logged in!');
    return;
  }
  console.log(chalk`\nLogged to {green ${auth.siteUrl}}`);
}
