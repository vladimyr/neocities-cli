'use strict';

const { prompt } = require('inquirer');
const chalk = require('chalk');
const Client = require('../client');
const netrc = require('../lib/netrc');

const isRemoteError = err => !!err.response;
const notEmpty = input => input && input.length > 0;
const subdomain = sitename => `${sitename}.neocities.org`;

const questions = [{
  type: 'input',
  name: 'sitename',
  message: 'Enter your sitename:',
  validate: notEmpty,
  transformer: subdomain
}, {
  type: 'password',
  name: 'password',
  message: 'Enter your password:',
  validate: notEmpty,
  mask: '*'
}];

module.exports = {
  command: 'login',
  desc: 'Log into neocities.org site',
  handler
};

async function handler() {
  const { sitename, password } = await prompt(questions);
  try {
    const apiKey = await Client.apiKey(sitename, password);
    const conf = await netrc.read();
    conf['neocities.org'] = { login: sitename, password: apiKey };
    netrc.write(conf);
    console.log(`\nSuccessfully logged to ${subdomain(sitename)}.`);
  } catch (err) {
    if (!isRemoteError(err)) throw err;
    const { message } = await err.response.json();
    console.error(chalk`\n{bgRed.white.bold Login error} ${message}`);
    process.exit(1);
  }
}
