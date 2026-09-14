const { execSync } = require('child_process');

console.log('=== 1. TypeScript Strict Check ===');
try {
  const out = execSync('npx.cmd tsc --noEmit --strict --noImplicitAny --strictNullChecks', { cwd: __dirname, encoding: 'utf8' });
  console.log('TS Strict Output:', out || '0 errors');
} catch (err) {
  const errLines = (err.stdout || err.message).split('\n').filter(l => l.includes('error TS'));
  console.log(`TS Strict Errors (${errLines.length}):\n`, errLines.join('\n'));
}

console.log('\n=== 2. ESLint Check ===');
try {
  const out = execSync('npx.cmd eslint "src/**/*.{ts,tsx}"', { cwd: __dirname, encoding: 'utf8' });
  console.log('ESLint Output:', out || '0 warnings/errors');
} catch (err) {
  console.log('ESLint Output:\n', err.stdout || err.message);
}

