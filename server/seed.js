import bcrypt from 'bcrypt';
import prisma from './lib/prisma.js';

const testUsers = [
  {
    email: 'admin@ipclaw.com',
    password: 'admin123456',
    name: '系统管理员',
    phone: '13800000001',
    role: 'admin',
    userType: 'personal',
    subscription: 'enterprise',
    balance: 10000,
    verified: true,
  },
  {
    email: 'user@ipclaw.com',
    password: 'user123456',
    name: '张三',
    phone: '13800000002',
    role: 'user',
    userType: 'personal',
    subscription: 'free',
    balance: 200,
    verified: true,
    idCard: '110101199001011234',
  },
  {
    email: 'pro@ipclaw.com',
    password: 'pro123456',
    name: '李四（Pro）',
    phone: '13800000003',
    role: 'user',
    userType: 'personal',
    subscription: 'pro',
    balance: 5000,
    verified: true,
    idCard: '110101199002022345',
  },
  {
    email: 'enterprise@ipclaw.com',
    password: 'ent123456',
    name: '王五（企业版）',
    phone: '13800000004',
    role: 'user',
    userType: 'enterprise',
    subscription: 'enterprise',
    balance: 50000,
    verified: true,
    companyName: '示例知识产权有限公司',
    companyId: '91110000MA00ABCD12',
  },
];

async function seed() {
  console.log('🌱 开始创建测试账号...\n');

  for (const userData of testUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      console.log(`⏭️  已存在: ${userData.email} (${userData.name})`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        avatar: userData.name.charAt(0),
        phone: userData.phone,
        role: userData.role,
        userType: userData.userType,
        subscription: userData.subscription,
        balance: userData.balance,
        verified: userData.verified,
        idCard: userData.idCard || null,
        companyName: userData.companyName || null,
        companyId: userData.companyId || null,
      },
      select: { id: true, email: true, name: true },
    });

    if (userData.balance > 0) {
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          type: 'earn',
          amount: userData.balance,
          balanceAfter: userData.balance,
          description: '测试账号初始积分',
          category: 'test_bonus',
        },
      });
    }

    console.log(`✅ 已创建: ${userData.email} (${userData.name})`);
  }

  console.log('\n🎉 测试账号创建完成！\n');
  console.log('📋 测试账号列表：');
  console.log('═══════════════════════════════════════════');
  console.log('  👑 管理员账号');
  console.log('     邮箱: admin@ipclaw.com');
  console.log('     密码: admin123456');
  console.log('     角色: admin | 订阅: Enterprise | 积分: 10,000');
  console.log('');
  console.log('  👤 普通用户（免费版）');
  console.log('     邮箱: user@ipclaw.com');
  console.log('     密码: user123456');
  console.log('     角色: user | 订阅: Free | 积分: 200');
  console.log('');
  console.log('  💎 Pro 用户');
  console.log('     邮箱: pro@ipclaw.com');
  console.log('     密码: pro123456');
  console.log('     角色: user | 订阅: Pro | 积分: 5,000');
  console.log('');
  console.log('  🏢 企业用户');
  console.log('     邮箱: enterprise@ipclaw.com');
  console.log('     密码: ent123456');
  console.log('     角色: user | 订阅: Enterprise | 积分: 50,000');
  console.log('═══════════════════════════════════════════');
}

seed()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
