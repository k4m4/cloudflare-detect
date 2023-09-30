import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const urls = {
  ipv4: 'https://www.cloudflare.com/ips-v4',
  ipv6: 'https://www.cloudflare.com/ips-v6'
}

function writeSync(filePath, text) {
  fs.writeFileSync(filePath, text);
}

async function fetchIPs(url) {
  const res = await fetch(url);
  const text = await res.text();
  return text.split('\n').filter(Boolean);
}

const ipJSONPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'ips.json');

export function loadIPs() {
  return JSON.parse(fs.readFileSync(ipJSONPath, 'utf-8'));
}

export default async function updateIpFiles() {
  const [ipv4, ipv6] = await Promise.all([fetchIPs(urls.ipv4), fetchIPs(urls.ipv6)]);

  if (ipv4.length === 0 || ipv6.length === 0) {
    throw new Error('cloudflare-detect: an IP list was empty');
  }

  const json = JSON.stringify([...ipv4, ...ipv6], null, '  ');
  writeSync(ipJSONPath, json);
}
