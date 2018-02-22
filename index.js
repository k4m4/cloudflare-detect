'use strict'
const fs          = require('fs')
const path        = require('path')
const dns         = require('dns');
const fetch       = require('node-fetch');
const routerIPs   = require('router-ips');
const arrify      = require('arrify');
const pAny        = require('p-any');
const net         = require('net');
const pify        = require('pify');
const pTimeout    = require('p-timeout');
const isIp        = require('is-ip');
const humanizeUrl = require('humanize-url');
const Address4    = require('ip-address').Address4;
const Address6    = require('ip-address').Address6;

const fetchIPs    = require('./fetch-ips')
fetchIPs.fetch();

const listPath = path.join(__dirname, 'ips.json')
const ips = JSON.parse(fs.readFileSync(listPath, 'utf8')).map(intoAddress)

function intoAddress (str) {
  str = str.trim();
  let ip = new Address6(str);
  if (ip.v4 && !ip.valid) {
    ip = new Address4(str);
  }
  if (!ip.valid) return
  return ip;
}

// github.com/sindresorhus/is-reachable/blob/master/index.js
function getAddress (hostname) {
  if (net.isIP(hostname)) {
    return Promise.resolve(hostname);
  }
  return pify(dns.lookup)(hostname);
}

function isCloudflare (target) {
  return getAddress(target).then(address => {
    if (!address || routerIPs.has(address)) {
      return false;
    }
    const target = intoAddress(address);
    if (!target) {
      return false
    }
    return ips.some((cf) => target.isInSubnet(cf));
  }).catch(() => false);
}

module.exports = (dests, opts) => {
  opts = opts || {};
  opts.timeout = typeof opts.timeout === 'number' ? opts.timeout : 5000;

  const p = pAny(arrify(humanizeUrl(dests)).map(isCloudflare));
  return pTimeout(p, opts.timeout).catch(() => false);
};