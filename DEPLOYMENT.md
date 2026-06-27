# IPClaw 后端部署指南 - Railway

## 概述

本指南详细介绍如何将 IPClaw 后端服务部署到 **Railway** 平台。Railway 是一个现代化的应用托管平台，支持自动构建、HTTPS、自动缩放等功能，且提供免费额度。

## 前置条件

- 已注册 GitHub 账号
- IPClaw 项目已推送到 GitHub：https://github.com/luckyted1982/IPClaw
- 拥有 DeepSeek API Key（用于 AI 对话功能）

---

## 步骤 1：创建 Railway 账号

1. 打开 Railway 官网：https://railway.app
2. 点击 **Start for free**
3. 使用 GitHub 账号登录（推荐）
4. 完成邮箱验证

---

## 步骤 2：创建新项目

1. 登录后，点击页面上的 **New Project** 按钮
2. 在弹出的菜单中选择 **Deploy from GitHub repo**

![New Project](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Railway%20platform%20new%20project%20button%20interface%20UI%20design&image_size=landscape_16_9)

3. 在搜索框中输入 `luckyted1982/IPClaw`
4. 点击仓库名称进行选择
5. 点击 **Install & Deploy**

---

## 步骤 3：配置 Dockerfile

Railway 会自动检测项目中的 Dockerfile。当前项目的 `server/Dockerfile` 如下：

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 3002

CMD ["node", "index.js"]
```

**注意**：Railway 默认从项目根目录查找 Dockerfile。我们需要修改配置，让它从 `server/` 目录构建。

### 修改构建配置

1. 部署完成后，点击项目名称进入项目详情页
2. 点击左侧菜单中的 **Settings**
3. 在 **Build Settings** 部分：
   - 设置 **Root Directory** 为 `server`
   - 设置 **Dockerfile Path** 为 `Dockerfile`

---

## 步骤 4：配置环境变量

1. 在项目详情页，点击左侧菜单中的 **Variables**
2. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| DEEPSEEK_API_KEY | `sk-xxxxxxxxxxxx` | DeepSeek API 密钥 |
| DEEPSEEK_BASE_URL | `https://api.deepseek.com/v1` | DeepSeek API 地址 |
| DEEPSEEK_MODEL | `deepseek-chat` | 使用的模型名称 |
| PATSEEK_API_KEY | `ps-xxxxxxxxxxxx` | PatSeek API 密钥（可选） |
| PORT | `3002` | 服务端口 |
| NODE_ENV | `production` | 运行环境 |
| JWT_SECRET | `任意随机字符串` | JWT 签名密钥 |
| JWT_EXPIRES_IN | `7d` | JWT 有效期 |
| BCRYPT_ROUNDS | `10` | 密码加密强度 |

3. **数据库配置**（关键）：

   Railway 提供了免费的 PostgreSQL 数据库。点击左侧菜单中的 **Add Plugin**，选择 **PostgreSQL**，然后在环境变量中会自动添加 `DATABASE_URL`。

   将 `DATABASE_URL` 修改为：
   ```
   postgresql://用户名:密码@主机:端口/数据库名
   ```

---

## 步骤 5：配置域名

1. 在项目详情页，点击左侧菜单中的 **Settings**
2. 在 **Domains** 部分，点击 **Generate Domain**
3. Railway 会生成一个随机域名，如 `ipclaw-server.up.railway.app`
4. 你也可以添加自定义域名

---

## 步骤 6：更新前端 API 地址

部署完成后，获得后端 API 地址（如 `https://ipclaw-server.up.railway.app`）。

1. 打开 `.env.production` 文件：

```bash
# 修改为你的 Railway 地址
VITE_API_BASE_URL=https://ipclaw-server.up.railway.app
```

2. 重新构建前端：

```bash
npm run build
```

3. 提交并推送：

```bash
git add dist/ .env.production
git commit -m "Update API endpoint for production"
git push origin main
```

---

## 步骤 7：启用 GitHub Pages

1. 访问 https://github.com/luckyted1982/IPClaw/settings/pages
2. 在 **Source** 部分：
   - 选择 **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
3. 点击 **Save**
4. 等待 1-2 分钟，访问 https://luckyted1982.github.io/IPClaw/

---

## 常见问题

### Q1: 部署后服务无法启动

检查日志：
1. 在 Railway 项目详情页，点击左侧菜单中的 **Deployments**
2. 点击最新的部署记录
3. 查看 **Build Logs** 和 **Run Logs**

常见原因：
- 环境变量缺失（特别是 `DATABASE_URL`）
- Node.js 版本不兼容
- Prisma 迁移失败

### Q2: 前端无法连接后端

检查：
1. 后端服务是否正常运行
2. `VITE_API_BASE_URL` 是否正确配置
3. CORS 是否正确配置（后端已配置）

### Q3: 数据库连接失败

确保：
1. PostgreSQL 插件已添加
2. `DATABASE_URL` 环境变量正确
3. 数据库已完成初始化

---

## 完整架构

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Pages                            │
│  https://luckyted1982.github.io/IPClaw/                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  React Frontend                      │   │
│  │  (Vite + Tailwind CSS + Radix UI)                   │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                       │
│                     ▼                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Railway API                         │   │
│  │  https://ipclaw-server.up.railway.app               │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │        Node.js + Express Server              │   │   │
│  │  │  - Authentication (JWT)                      │   │   │
│  │  │  - REST API Routes                          │   │   │
│  │  │  - WebSocket Support                        │   │   │
│  │  └──────────────────┬──────────────────────────┘   │   │
│  │                     │                               │   │
│  │                     ▼                               │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │          PostgreSQL Database                 │   │   │
│  │  │  (Railway PostgreSQL Plugin)                │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │
         │ DeepSeek API
         ▼
┌─────────────────────────────────────────────────────────────┐
│              DeepSeek AI Service                            │
│         https://api.deepseek.com/v1                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 部署检查清单

- [ ] Railway 项目已创建
- [ ] Dockerfile 路径正确配置
- [ ] 所有环境变量已添加
- [ ] PostgreSQL 数据库已配置
- [ ] 域名已生成
- [ ] 前端 `VITE_API_BASE_URL` 已更新
- [ ] 前端已重新构建并推送
- [ ] GitHub Pages 已启用
- [ ] 服务可正常访问

---

## 参考链接

- Railway 文档：https://docs.railway.app/
- Prisma 文档：https://www.prisma.io/docs/
- DeepSeek API：https://platform.deepseek.com/

---

*文档版本：v1.0*
*更新时间：2026年6月*