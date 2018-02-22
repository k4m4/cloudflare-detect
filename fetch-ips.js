'use strict';
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const urls = {
  ipv4: 'https://www.cloudflare.com/ips-v4',
  ipv6: 'https://www.cloudflare.com/ips-v6'
}

function write (path, text) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, text, (err) => err ? reject(err) : resolve());
  });
}

function fetchIPs (url) {
  return fetch(url)
    .then(res => res.text())
    .then(text => text.split('\n').filter(Boolean));
}

module.exports = {
    fetch: function() {
      Promise.all([fetchIPs(urls.ipv4), fetchIPs(urls.ipv6)])
        .then((ips) => { 
          const [ipv4, ipv6] = ips;
          if (ipv4.length === 0 || ipv6.length === 0) {
            throw new Error('a list was empty');
          }
          const outPath = path.join(__dirname, 'ips.json');
          const json = JSON.stringify([...ipv4, ...ipv6], null, '  ');
          return write(outPath, json);
        })
        .catch((err) => console.error(err.stack))
      }
}