#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd /opt/IPClaw/server

mkdir -p data

npx prisma generate
npx prisma migrate dev --name init

cat > /tmp/seed.js << 'EOF'
import bcrypt from 'bcrypt';
import prisma from './lib/prisma.js';

async function main() {
  const users = [
    {
      email: 'admin@ipclaw.com',
      password: 'admin123456',
      name: '管理员',
      role: 'admin',
      balance: 10000,
      subscription: 'Enterprise',
      verified: true,
      userType: 'enterprise',
      companyName: 'IPClaw科技有限公司',
    },
    {
      email: 'user@ipclaw.com',
      password: 'user123456',
      name: '张三',
      role: 'user',
      balance: 200,
      subscription: 'Free',
      verified: true,
      userType: 'personal',
    },
    {
      email: 'pro@ipclaw.com',
      password: 'pro123456',
      name: '李四',
      role: 'user',
      balance: 5000,
      subscription: 'Pro',
      verified: true,
      userType: 'personal',
    },
    {
      email: 'enterprise@ipclaw.com',
      password: 'ent123456',
      name: '王五',
      role: 'user',
      balance: 50000,
      subscription: 'Enterprise',
      verified: true,
      userType: 'enterprise',
      companyName: '知识产权代理公司',
    },
    {
      phone: '13810200597',
      password: '123456',
      name: '手机用户',
      role: 'user',
      balance: 100,
      subscription: 'Free',
      verified: false,
      userType: 'personal',
      email: '13810200597@temp.com',
    },
  ];

  for (const userData of users) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          avatar: userData.name.charAt(0).toUpperCase(),
          status: 'active',
        },
      });
      console.log(`Created user: ${userData.email}`);
    } else {
      console.log(`User exists: ${userData.email}`);
    }
  }

  console.log('Seed completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

cp /tmp/seed.js /opt/IPClaw/server/seed.js
cd /opt/IPClaw/server && node seed.js