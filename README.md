# 生活效期管理系统

一个优雅的物品效期管理应用，帮助你追踪和管理日常物品的有效期，通过邮件提醒及时处理过期或即将过期的物品。

## 📸 项目预览

- 📱 移动端优先设计
- 🎨 现代化 UI/UX
- ⚡ 实时数据同步
- 📧 智能邮件提醒

## 🚀 快速开始

### 环境要求

- Node.js >= 14.x
- npm >= 6.x

### 一键启动

```bash
# 克隆项目
git clone https://github.com/kohlarnhin/life-cycle.git
cd life-cycle

# 安装所有依赖
npm run install:all

# 同时启动前后端（方式1：使用 concurrently）
npm run dev

# 或使用 Shell 脚本（方式2：备选方案）
npm run dev:sh
# 或直接运行
./start.sh
```

### 访问应用

- 应用地址：http://localhost:5173
- 局域网访问：http://[你的IP]:5173

**注意**：前端已配置代理，所有 `/api` 请求会自动转发到后端服务，无需暴露后端端口。

### 分别启动（可选）

如需分别启动前后端：

```bash
# 启动后端
npm run dev:backend

# 启动前端（新开终端）
npm run dev:frontend
```

### 故障排除

**问题：`concurrently: not found`**

解决方案：
1. 在根目录运行 `npm install` 安装 concurrently
2. 或使用备选启动方式：`npm run dev:sh` 或 `./start.sh`

## 📁 项目结构

```
life-cycle/
├── backend/          # 后端服务
│   ├── server.js     # Express 服务器
│   ├── db.js         # 数据库访问层
│   ├── data.sqlite   # SQLite 数据库
│   └── README.md     # 后端文档
├── frontend/         # 前端应用
│   ├── src/          # 源代码
│   ├── vite.config.ts
│   └── README.md     # 前端文档
└── README.md         # 项目总览
```

## ✨ 核心功能

### 1. 物品效期管理
- ✅ 添加物品及效期天数
- ✅ 分组管理（衣物、清洁、厨房、健康等）
- ✅ 自动计算剩余天数
- ✅ 过期状态实时显示
- ✅ 一键重置效期

### 2. 智能提醒系统
- ✅ 邮件配置管理（支持 QQ 邮箱、163 邮箱等）
- ✅ 定时自动发送：
  - 每天 00:10 发送已过期内容提醒
  - 每天 23:50 发送即将过期内容提醒（≤3天）
- ✅ 可查看发送规则

### 3. 用户体验
- ✅ 响应式设计，移动端优先
- ✅ 流畅的动画效果
- ✅ 直观的操作反馈
- ✅ 12种常用天数快捷选择（1-365天）

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Motion (Framer Motion)
- Radix UI

### 后端
- Node.js
- Express
- SQLite (better-sqlite3)
- Nodemailer
- node-cron

## 📖 详细文档

- [前端文档](./frontend/README.md) - 前端开发指南
- [后端文档](./backend/README.md) - 后端 API 文档

## 🔧 配置说明

### 邮件提醒配置

1. 访问前端应用的"邮件设置"页面
2. 填写 SMTP 配置信息：
   - **QQ 邮箱**（推荐）：
     - SMTP 服务器：`smtp.qq.com`
     - 端口：`587`
     - 需要在 QQ 邮箱设置中开启 SMTP 服务并获取授权码
   - **163 邮箱**：
     - SMTP 服务器：`smtp.163.com`
     - 端口：`465`
3. 保存配置后，系统将自动定时发送邮件提醒

## 📝 常用操作

### 添加物品
1. 点击底部"+"按钮
2. 输入物品名称和效期天数
3. 选择分类
4. 点击"✓"确认

### 管理分组
1. 点击顶部分组标签
2. 点击分组右上角"×"删除分组
3. 点击"+ 新分组"添加分组

### 重置效期
点击物品卡片底部的"重置"按钮，将起始时间重置为当前时间

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

kohlarnhin

---

⭐ 如果这个项目对你有帮助，请给个 Star！

