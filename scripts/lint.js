// products/*.txt 형식 검사 — 수기 편집 실수(중복·공백·빈 줄·BOM·CRLF)를 커밋 직후 잡는다.
// 사용: node scripts/lint.js  (문제 발견 시 exit 1)
'use strict';
const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '..', 'products');
const MAX_NAME_LENGTH = 64;

let errorCount = 0;
function report(file, line, message) {
  errorCount++;
  console.error(`${file}${line ? ':' + line : ''} — ${message}`);
}

const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith('.txt'));
if (files.length === 0) {
  console.log('no product files found — nothing to lint');
  process.exit(0);
}

for (const file of files) {
  if (!/^[a-z0-9_]+\.txt$/.test(file)) {
    report(file, 0, '파일명은 소문자+언더스코어 제품 코드여야 함');
  }
  const raw = fs.readFileSync(path.join(PRODUCTS_DIR, file));
  const text = raw.toString('utf8');

  if (text.charCodeAt(0) === 0xfeff) report(file, 1, 'BOM 있음 — Udon 이름 대조가 깨짐');
  if (text.includes('\r')) report(file, 0, 'CRLF 있음 — LF만 허용 (.gitattributes 확인)');
  if (text.length > 0 && !text.endsWith('\n')) report(file, 0, '마지막 줄에 개행 없음');

  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop(); // trailing newline

  const seen = new Map(); // lowercase -> first line no
  lines.forEach((line, i) => {
    const no = i + 1;
    if (line === '') return report(file, no, '빈 줄');
    if (line !== line.trim()) return report(file, no, '앞뒤 공백');
    if (/[\t]/.test(line)) return report(file, no, '탭 문자');
    if (line.length > MAX_NAME_LENGTH) return report(file, no, `이름이 ${MAX_NAME_LENGTH}자 초과`);
    const key = line.toLowerCase();
    if (seen.has(key)) return report(file, no, `중복 (${seen.get(key)}번 줄과 동일)`);
    seen.set(key, no);
  });

  console.log(`${file}: ${seen.size} entries OK${errorCount ? ' (with errors above)' : ''}`);
}

if (errorCount > 0) {
  console.error(`\nlint failed: ${errorCount} problem(s)`);
  process.exit(1);
}
console.log('lint passed');
