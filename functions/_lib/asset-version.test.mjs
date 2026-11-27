import assert from 'node:assert/strict';
import test from 'node:test';
import { stampAssetVersion } from './asset-version.js';

test('asset query strings follow the deploy commit', () => {
  const html = '<link href="/assets/home.css?v=228c347"><script src="/assets/hp.js"></script><img src="/assets/smarthome-brothers-logo.svg">';
  const stamped = stampAssetVersion(html, '843bb96deadbeef');
  assert.match(stamped, /\/assets\/home\.css\?v=843bb96/);
  assert.match(stamped, /\/assets\/hp\.js\?v=843bb96/);
  assert.match(stamped, /\/assets\/smarthome-brothers-logo\.svg"/);
  assert.equal(stampAssetVersion(html, ''), html);
  assert.equal(stampAssetVersion(stamped, 'd32365e'), stamped.replaceAll('843bb96', 'd32365e'));
});
