'use strict';

const chalk = require('chalk');
const Client = require('../client');
const netrc = require('../lib/netrc');

const isRemoteError = err => !!err.response;

module.exports = { wrap };

function wrap(handler) {
  return async function (...args) {
    const conf = await netrc.read();
    const credentials = conf['neocities.org'];
    if (!credentials) {
      console.error('\nYou are not logged in!');
      return;
    }
    const client = new Client(credentials.password);
    try {
      await handler.call(this, { client, credentials }, ...args);
    } catch (err) {
      if (!isRemoteError(err)) throw err;
      const { message } = await err.response.json();
      console.error(chalk`\n{bgRed.white.bold Error} ${message}`);
      process.exit(1);
    }
  };
}
