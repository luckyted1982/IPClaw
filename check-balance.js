import('./lib/prisma.js')
  .then(m => {
    return m.default.creditAccount.findUnique({
      where: {userId: 'cmqwgilnn0000axi78imvzqe9'}
    });
  })
  .then(r => {
    console.log('Current Balance:', JSON.stringify(r, null, 2));
  })
  .catch(e => console.error('Error:', e.message));
