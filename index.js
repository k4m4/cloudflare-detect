import routerIPs from 'router-ips';
import net from 'net';
import {promises as dns} from 'dns';
import humanizeUrl from 'humanize-url';
import { Address4, Address6, AddressError } from 'ip-address';
import { loadIPs } from './ip-helpers.js';

const ips = loadIPs().map(intoAddress);

function intoAddress(str) {
    str = str.trim();
    let ip;

    try {
      ip = new Address6(str);
    } catch (e) {
      if (!(e instanceof AddressError)) {
        throw e
      }
    }

    if (!ip) {
      try {
        ip = new Address4(str);
      } catch (e) {
        if (!(e instanceof AddressError)) {
          throw e
        }
      }
    }

    return ip;
}

// pulled from:
// https://github.com/sindresorhus/is-reachable/blob/master/index.js
const getAddress = async hostname => net.isIP(hostname) ? hostname : (await dns.lookup(hostname)).address;

async function isCloudflare(target) {
    try {
      const address = await getAddress(target);
        if (!address || routerIPs.has(address)) {
            return false;
        }
        const resolvedTarget = intoAddress(address);
        if (!resolvedTarget) {
            return false;
        }
        return ips.some((cf) => resolvedTarget.isInSubnet(cf));
    } catch (error) {
        return false;
    }
}

export default async (dests, opts = {}) => {
    opts.timeout = typeof opts.timeout === 'number' ? opts.timeout : 5000;

    if (!Array.isArray(dests)) {
        dests = [dests];
    }

    dests = dests.map(url => humanizeUrl(url));

    const promises = dests.map(isCloudflare);

    // create a timeout promise to race the cloudflare resolution against
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), opts.timeout);
    });

    try {
        return await Promise.race([timeoutPromise, ...promises]);
    } catch (error) {
        return false;
    }
};