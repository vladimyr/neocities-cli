'use strict';

const { getCredentials } = require('../lib/auth');
const chalk = require('chalk');
const Client = require('../client');

const isRemoteError = err => !!err.response;

module.exports = { wrap };

function wrap(handler) {
  return async function (...args) {
    const auth = await getCredentials();
    if (!auth) {
      console.error('\nYou are not logged in!');
      return;
    }
    const client = new Client(auth.apiKey);
    try {
      await handler.call(this, { client, auth }, ...args);
    } catch (err) {
      if (!isRemoteError(err)) throw err;
      const { message } = await err.response.json();
      console.error(chalk`\n{bgRed.white.bold Error} ${message}`);
      process.exit(1);
    }
  };
}
