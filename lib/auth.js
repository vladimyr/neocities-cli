'use strict';

const netrc = require('./netrc');
const machine = 'neocities.org';

module.exports = {
  getCredentials,
  removeCredentials,
  storeCredentials
};

async function getCredentials() {
  const conf = await netrc.read();
  return new Credentials(conf[machine]);
}

async function storeCredentials(sitename, apiKey) {
  const conf = await netrc.read();
  conf[machine] = { login: sitename, password: apiKey };
  await netrc.write(conf);
  return new Credentials(conf[machine]);
}

async function removeCredentials() {
  const conf = await netrc.read();
  const auth = conf[machine];
  if (!auth) return;
  delete conf[machine];
  await netrc.write(conf);
  return new Credentials(auth);
}

function Credentials({ login, password } = {}) {
  Object.assign(this, {
    get sitename() {
      return login;
    },
    get siteUrl() {
      return `https://${login}.neocities.org`;
    },
    get apiKey() {
      return password;
    }
  });
}
