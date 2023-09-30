import test from 'ava';
import m from './index.js';

test('hostname', async t => {
	t.true(await m('cloudflare.com'));
});

test('non-cf hostname', async t => {
	t.false(await m('google.com'));
});

test('unreachable hostname', async t => {
	t.false(await m('343645335341233123125235623452344123.com'));
});

test('unreachable pathname', async t => {
	t.false(await m('https://google.com/notfound.js'));
});

test('with timeout', async t => {
	t.true(await m('http://cloudflare.com', {timeout: 3000}));
});

test('with impossible timeout', async t => {
	t.false(await m('https://google.com', {timeout: 1}));
});