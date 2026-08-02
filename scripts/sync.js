// 원장 시트 → products/*.txt 생성 (v1.5)
// 시트가 유일한 진실. 이 스크립트는 상태=활성 행만 제품별 파일로 재생성한다.
//
// env:
//   SHEET_ID                    스프레드시트 ID
//   GOOGLE_SERVICE_ACCOUNT_KEY  서비스 계정 키 JSON 전문
//
// 개인정보 규칙: 로그에는 건수만 출력한다. 이름 외 컬럼(주문번호·입금자명 등)은 어떤 출력에도 쓰지 않는다.
'use strict';
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const LEDGER_RANGE = "'원장'!A2:G";
// 헤더: 등록일(A) | 제품(B) | 채널(C) | 주문번호·입금자명(D) | VRChat 이름(E) | 상태(F) | 메모(G)
const COL = { PRODUCT: 1, NAME: 4, STATUS: 5 };
const ACTIVE_STATUS = '활성';
const PRODUCTS_DIR = path.join(__dirname, '..', 'products');

async function main() {
  const sheetId = process.env.SHEET_ID;
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!sheetId || !keyJson) {
    console.error('missing env: SHEET_ID and/or GOOGLE_SERVICE_ACCOUNT_KEY');
    process.exit(1);
  }
  const key = JSON.parse(keyJson);
  const auth = new google.auth.JWT(key.client_email, null, key.private_key, [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ]);
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: LEDGER_RANGE });
  const rows = res.data.values || [];

  const products = new Map(); // code -> names[] (등록 순서 유지, 중복 제거)
  let skipped = 0;
  for (const row of rows) {
    const product = String(row[COL.PRODUCT] || '').trim();
    const name = String(row[COL.NAME] || '').trim();
    const status = String(row[COL.STATUS] || '').trim();
    if (!product || !name || status !== ACTIVE_STATUS) { skipped++; continue; }
    if (!/^[a-z0-9_]+$/.test(product)) {
      console.error('invalid product code found — row skipped (check the sheet)');
      skipped++; continue;
    }
    if (!products.has(product)) products.set(product, []);
    const list = products.get(product);
    if (!list.some((n) => n.toLowerCase() === name.toLowerCase())) list.push(name);
  }

  // 기존 파일 중 활성 행이 하나도 없어진 제품은 빈 파일로 만든다 (stale 방지)
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  for (const file of fs.readdirSync(PRODUCTS_DIR)) {
    if (file.endsWith('.txt') && !products.has(file.slice(0, -4))) products.set(file.slice(0, -4), []);
  }

  for (const [product, names] of products) {
    const content = names.length ? names.join('\n') + '\n' : '';
    fs.writeFileSync(path.join(PRODUCTS_DIR, product + '.txt'), content);
    console.log(`${product}: ${names.length} entries`);
  }
  console.log(`done — rows=${rows.length}, skipped(inactive/invalid)=${skipped}`);
}

main().catch((e) => {
  console.error('sync failed:', e.message);
  process.exit(1);
});
