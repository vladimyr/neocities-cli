#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const trim = str => str.replace(/^\n+|\n+$/g, '');

const alias = { h: 'help', v: 'version' };
const logo = trim(chalk`
 {yellow  /\\_/\\}
 {yellow ( o.o )}   {bold Neocities}
 {yellow  > ^ <}
`);

// eslint-disable-next-line no-unused-expressions
require('yargs')
  .strict()
  .alias(alias)
  .commandDir('commands')
  .demandCommand(1, 'You need at least one command before moving on')
  .recommendCommands()
  .usage(`\n${logo}`)
  .fail(onError)
  .help()
  .argv;

function onError(msg, err, yargs) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  yargs.showHelp();
  if (msg) console.error(chalk.bold(msg));
  process.exit(1);
}
