'use strict';

const { URL } = require('url');
const urlJoin = require('url-join');
const r = require('fetchival');
r.fetch = require('isomorphic-unfetch');

const BASE_URL = 'https://neocities.org/api';

const reduce = (obj, cb) => {
  return Object.keys(obj)
    .reduce((acc, key) => cb(acc, obj[key], key), {});
};
const clean = obj => reduce(obj, (acc, value, key) => {
  if (value) acc[key] = value;
  return acc;
});

class Client {
  static async apiKey(username, password, baseUrl = BASE_URL) {
    let url = new URL(baseUrl);
    url.username = username;
    url.password = password;
    url = urlJoin(url.href, '/key');
    const resp = await r(url).get();
    return resp.api_key;
  }

  constructor(apiKey, { baseUrl = BASE_URL } = {}) {
    this._apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  request(path, options = {}) {
    const url = urlJoin(this.baseUrl, path);
    const headers = { Authorization: `Bearer ${this._apiKey}` };
    return r(url, { headers, ...options }); 
  }

  async list({ path } = {}) {
    const query = clean({ path }); 
    const resp = await this.request('/list').get(query);
    return resp.files;
  }

  async info({ sitename } = {}) {
    const query = clean({ sitename });
    const resp = await this.request('/info').get(query);
    return resp.info;
  }
}

module.exports = Client;
