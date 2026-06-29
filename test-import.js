// Test importing prisma and checking creditAccount
console.log('Testing prisma...');
import('./lib/prisma.js')
  .then(m => {
    console.log('Prisma loaded');
    console.log('Has creditAccount:', typeof m.default.creditAccount);
    console.log('Has creditTransaction:', typeof m.default.creditTransaction);
    console.log('Has consumptionRule:', typeof m.default.consumptionRule);
    if (typeof m.default.creditAccount?.findUnique === 'function') {
      return m.default.creditAccount.findUnique({ where: { userId: 'test' } });
    } else {
      console.log('creditAccount.findUnique not available');
      return null;
    }
  })
  .then(r => console.log('Result:', r))
  .catch(e => console.error('Error:', e.message));
