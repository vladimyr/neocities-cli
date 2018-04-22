'use strict';

const { URL } = require('url');
const urlJoin = require('url-join');
const qs = require('querystring');
const r2 = require('r2');

const BASE_URL = 'https://neocities.org/api';

const isEmpty = obj => Object.keys(obj).length === 0;
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
    const resp = await r2(url).json;
    return resp.api_key;
  }

  constructor(apiKey, { baseUrl = BASE_URL } = {}) {
    this._apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  request(path, options = {}) {
    const query = !isEmpty(options.query) && `?${qs.stringify(options.query)}`;
    const url = urlJoin(this.baseUrl, path, query || '');
    const headers = { Authorization: `Bearer ${this._apiKey}` };
    return r2(url, { headers, ...options });
  }

  async list({ path } = {}) {
    const query = clean({ path });
    const resp = await this.request('/list', { query }).json;
    return resp.files;
  }

  async info({ sitename } = {}) {
    const query = clean({ sitename });
    const resp = await this.request('/info', { query }).json;
    return resp.info;
  }
}

module.exports = Client;
