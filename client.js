'use strict';

const { URL } = require('url');
const urlJoin = require('url-join');
const qs = require('querystring');
const r2 = require('r2');

const BASE_URL = 'https://neocities.org/api';

const isEmpty = obj => Object.keys(obj).length === 0;
const isSuccessful = resp => resp.status >= 200 && resp.status < 300;

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

  async request(path, options = {}) {
    const query = !isEmpty(options.query) && `?${qs.stringify(options.query)}`;
    const url = urlJoin(this.baseUrl, path, query || '');
    const headers = { Authorization: `Bearer ${this._apiKey}` };
    const resp = await r2(url, { headers, ...options }).response;
    if (isSuccessful(resp)) return resp.json();
    const err = new Error(resp.statusText);
    err.response = resp;
    throw err;
  }

  async list({ path } = {}) {
    const query = { path };
    const resp = await this.request('/list', { query });
    return resp.files;
  }

  async info({ sitename } = {}) {
    const query = { sitename };
    const resp = await this.request('/info', { query });
    return resp.info;
  }
}

module.exports = Client;
