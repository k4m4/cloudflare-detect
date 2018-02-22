# is-reachable [![Build Status](https://travis-ci.org/k4m4/cloudflare-detect.svg?branch=master)](https://travis-ci.org/k4m4/cloudflare-detect)

> Detect whether a site is running behind Cloudflare.

## Install

```
$ npm install --save cloudflare-detect
```


## Usage

```js
const cloudflareDetect = require('cloudflare-detect');

cloudflareDetect('nikolaskama.me').then(cf => {
	console.log(cf);
	//=> true
});

cloudflareDetect('google.com').then(cf => {
	console.log(cf);
	//=> false
});
```


## API

### cloudflareDetect(targets, [options])

Returns a `Promise` for a `boolean` which is `true` if any of the `targets` are reachable.

#### targets

Type: `string` `Array`

One or more targets to check. Can either be a full [URL](https://nodejs.org/api/url.html) like `https://hostname` or just `hostname`. When the protocol is missing from a target `http` is assumed.

#### options

##### timeout

Type: `number`

Timeout in milliseconds after which a request is considered failed. Default: `5000`.

## Credits

- [cloudflare-ip](https://github.com/danneu/cloudflare-ip) - a lot of the code for verifying that the host's IP address is within Cloudflare's range has been adapted from this repo (which doesn't seem to be maintained anymore) by [danneu](https://github.com/danneu).
- [is-reachable](https://github.com/sindresorhus/is-reachable) - some of the IP verification & DNS lookup code, as well as the format of the readme file, has been adapted from this repo by [sindresorhus](https://github.com/sindresorhus).

## License

MIT © [Nikolaos Kamarinakis](https://nikolaskama.me/)