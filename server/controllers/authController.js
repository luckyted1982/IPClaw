import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const WELCOME_BONUS_POINTS = 100;

export async function register(req, res) {
  try {
    const { email, password, name, phone, userType = 'personal', companyName, companyId, idCard } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatar: name.charAt(0).toUpperCase(),
          phone: phone || null,
          userType,
          companyName: companyName || null,
          companyId: companyId || null,
          idCard: idCard || null,
          balance: WELCOME_BONUS_POINTS,
          verified: false,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          balance: true,
          trustScore: true,
          phone: true,
          userType: true,
          verified: true,
          subscription: true,
          createdAt: true,
        },
      });

      await tx.pointTransaction.create({
        data: {
          userId: user.id,
          type: 'earn',
          amount: WELCOME_BONUS_POINTS,
          balanceAfter: user.balance,
          description: '新用户注册欢迎奖励',
          category: 'welcome_bonus',
        },
      });

      return user;
    });

    const token = jwt.sign({ userId: result.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({ user: result, token, welcomeBonus: WELCOME_BONUS_POINTS });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      balance: user.balance,
      trustScore: user.trustScore,
      phone: user.phone,
      userType: user.userType,
      verified: user.verified,
      subscription: user.subscription,
    };

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function loginWithPhone(req, res) {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Missing phone or code' });
    }

    if (code !== '123456') {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    let user = await prisma.user.findFirst({ where: { phone } });

    if (!user) {
      const randomName = `用户${phone.slice(-6)}`;
      user = await prisma.user.create({
        data: {
          email: `${phone}@temp.com`,
          password: await bcrypt.hash(phone, 10),
          name: randomName,
          avatar: randomName.charAt(0).toUpperCase(),
          phone,
          userType: 'personal',
          balance: WELCOME_BONUS_POINTS,
          verified: false,
        },
      });

      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          type: 'earn',
          amount: WELCOME_BONUS_POINTS,
          balanceAfter: user.balance,
          description: '新用户注册欢迎奖励',
          category: 'welcome_bonus',
        },
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      balance: user.balance,
      trustScore: user.trustScore,
      phone: user.phone,
      userType: user.userType,
      verified: user.verified,
      subscription: user.subscription,
    };

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Phone login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function sendVerificationCode(req, res) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    console.log(`Verification code sent to ${phone}: 123456 (demo mode)`);

    res.json({ message: 'Verification code sent', demo: true, code: '123456' });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        balance: true,
        trustScore: true,
        phone: true,
        userType: true,
        verified: true,
        companyName: true,
        subscription: true,
        subscriptionExpiresAt: true,
        checkInStreak: true,
        totalCheckIns: true,
        lastCheckIn: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, avatar, phone, companyName } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(phone && { phone }),
        ...(companyName && { companyName }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        balance: true,
        trustScore: true,
        phone: true,
        userType: true,
        verified: true,
        subscription: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
