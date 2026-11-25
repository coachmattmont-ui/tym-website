import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { handlePreviewUnlock } from '../api/preview-unlock.js';

const NOW = Date.parse('2026-11-25T12:00:00Z');
const PREVIEW_ENV = { CF_PAGES: '1', CF_PAGES_BRANCH: 'cursor/layout-save-payment-c599' };

function call(url, env) {
  return handlePreviewUnlock(new Request(url, { method: 'POST' }), env, { now: NOW });
}

test('preview branch on a pages.dev preview host opens a local test session', async () => {
  const res = await call('https://cursor-layout-save-payment-c.tym-website.pages.dev/api/preview-unlock', PREVIEW_ENV);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.mode, 'local');
  assert.equal(body.testMode, true);
  assert.equal(body.preview, true);
  assert.equal(body.source, 'preview_unlock');
  assert.equal(body.editUntil, new Date(NOW + 30 * 24 * 60 * 60 * 1000).toISOString());
});

test('production never honors preview unlock', async () => {
  const cases = [
    ['https://tym-website.pages.dev/api/preview-unlock', { CF_PAGES: '1', CF_PAGES_BRANCH: 'main' }],
    ['https://cursor-layout-save-payment-c.tym-website.pages.dev/api/preview-unlock', { CF_PAGES: '1', CF_PAGES_BRANCH: 'main' }],
    ['https://tym-website.pages.dev/api/preview-unlock', PREVIEW_ENV],
    ['https://tymhomes.com/api/preview-unlock', PREVIEW_ENV],
    ['https://www.tymhomes.com/api/preview-unlock', PREVIEW_ENV],
    ['https://new.tymhomes.com/api/preview-unlock', PREVIEW_ENV],
    ['https://cursor-layout-save-payment-c.tym-website.pages.dev/api/preview-unlock', { CF_PAGES_BRANCH: 'cursor/layout-save-payment-c599' }],
    ['https://cursor-layout-save-payment-c.tym-website.pages.dev/api/preview-unlock', { CF_PAGES: '1', CF_PAGES_BRANCH: '' }],
    ['https://localhost/api/preview-unlock', PREVIEW_ENV]
  ];
  for (const [url, env] of cases) {
    const res = await call(url, env);
    assert.equal(res.status, 404, url);
  }
});

test('the page only unlocks after the server agrees', () => {
  const html = fs.readFileSync(new URL('../../layout-beta/index.html', import.meta.url), 'utf8');
  assert.match(html, /\/api\/preview-unlock/);
  assert.match(html, /preview_unlock/);
  assert.match(html, /source!=='preview_unlock'/);
});
