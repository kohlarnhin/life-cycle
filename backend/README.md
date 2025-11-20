# 生活效期 - 后端服务

基于 Express 和 SQLite 的轻量级后端 API 服务。

## 🚀 快速开始

### 安装依赖

```bash
cd backend
npm install
```

### 启动服务

```bash
npm start
# 或
node server.js
```

服务将运行在 `http://0.0.0.0:3000`

## 📁 项目结构

```
backend/
├── server.js         # Express 服务器主文件
├── db.js            # 数据库访问层
├── data.sqlite      # SQLite 数据库文件（自动生成）
└── package.json     # 依赖配置
```

## 📦 依赖包

- `express` - Web 框架
- `cors` - 跨域支持
- `better-sqlite3` - SQLite 数据库
- `nodemailer` - 邮件发送
- `node-cron` - 定时任务

## 🗄️ 数据库设计

### 表结构

#### categories（分组表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| name | TEXT | 分组名称 |

#### habits（物品表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| title | TEXT | 物品名称 |
| duration | INTEGER | 效期天数 |
| start_date | TEXT | 开始日期 (yyyy-MM-dd) |
| expire_date | TEXT | 过期日期 (yyyy-MM-dd) |
| category_id | INTEGER | 所属分组 ID（外键） |

#### email_settings（邮件配置表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键（固定为1） |
| host | TEXT | SMTP 服务器 |
| port | INTEGER | SMTP 端口 |
| secure | INTEGER | 是否使用 SSL（0/1） |
| user | TEXT | SMTP 用户名 |
| pass | TEXT | SMTP 密码/授权码 |
| from_addr | TEXT | 发件人邮箱 |
| to_addr | TEXT | 收件人邮箱 |

## 🔌 API 接口

### 分组管理

#### 获取所有分组
```
GET /api/categories
```

响应示例：
```json
[
  {
    "id": 1,
    "name": "衣物",
    "habitCount": 5
  }
]
```

#### 创建分组
```
POST /api/categories
Content-Type: application/json

{
  "name": "分组名称"
}
```

#### 删除分组
```
DELETE /api/categories/:id
```

### 物品管理

#### 获取物品列表（分页）
```
GET /api/habits?page=1&pageSize=10&categoryId=1
```

查询参数：
- `page` - 页码（默认 1）
- `pageSize` - 每页数量（默认 10，最大 100）
- `categoryId` - 分组 ID（可选）

响应示例：
```json
[
  {
    "id": 1,
    "title": "晒被子",
    "duration": 14,
    "startDate": "2024-11-10",
    "categoryId": 1
  }
]
```

#### 创建物品
```
POST /api/habits
Content-Type: application/json

{
  "title": "晒被子",
  "duration": 14,
  "categoryId": 1
}
```

#### 重置物品效期
```
POST /api/habits/:id/reset
```

将物品的起始时间重置为当前时间，自动计算新的过期日期。

#### 删除物品
```
DELETE /api/habits/:id
```

### 邮件配置

#### 获取邮件配置
```
GET /api/email-config
```

#### 保存邮件配置
```
POST /api/email-config
Content-Type: application/json

{
  "host": "smtp.qq.com",
  "port": 587,
  "secure": false,
  "user": "user@qq.com",
  "pass": "authorization_code",
  "fromAddr": "sender@qq.com",
  "toAddr": "receiver@qq.com"
}
```

#### 发送测试邮件
```
POST /api/email-test
```

发送当前所有已过期物品的提醒邮件（用于测试配置）。

#### 获取发送规则
```
GET /api/email-rules
```

返回定时发送规则列表。

## ⏰ 定时任务

系统启动后会自动启用两个定时任务：

### 1. 过期内容提醒
- **执行时间**：每天 00:10
- **发送内容**：所有已过期的物品
- **邮件主题**：生活效期 - 过期提醒

### 2. 即将过期提醒
- **执行时间**：每天 23:50
- **发送内容**：剩余时间 ≤ 3天的物品
- **邮件主题**：生活效期 - 即将过期提醒

## 📧 邮件配置指南

### QQ 邮箱（推荐）

1. 登录 QQ 邮箱网页版
2. 进入"设置" → "账户"
3. 开启"POP3/SMTP服务"或"IMAP/SMTP服务"
4. 获取授权码（16位字符串）
5. 配置：
   - SMTP 服务器：`smtp.qq.com`
   - 端口：`587`
   - 密码：使用授权码（不是 QQ 密码）

### 163 邮箱

1. 开启 SMTP 服务并获取授权码
2. 配置：
   - SMTP 服务器：`smtp.163.com`
   - 端口：`465`
   - 密码：使用授权码

## 🔍 数据访问函数

主要的数据访问函数（在 `db.js` 中）：

- `getAllCategories()` - 获取所有分组
- `createCategory(name)` - 创建分组
- `deleteCategory(id)` - 删除分组
- `getHabitsPaged({ categoryId, page, pageSize })` - 分页获取物品
- `getExpiredHabits()` - 获取已过期物品
- `getExpiringSoonHabits(daysThreshold)` - 获取即将过期物品
- `createHabit({ title, duration, categoryId })` - 创建物品
- `resetHabitStartDate(id)` - 重置物品起始时间
- `deleteHabit(id)` - 删除物品
- `getEmailSettings()` - 获取邮件配置
- `saveEmailSettings(config)` - 保存邮件配置

## 🐛 调试

启动服务后，可以通过以下方式查看日志：

- 定时任务执行日志
- SMTP 连接日志
- API 请求日志

## 📝 注意事项

1. 首次启动会自动创建数据库和表结构
2. 会插入种子数据（仅首次）
3. 邮件配置保存在数据库中
4. 定时任务使用 Asia/Shanghai 时区

## 🔒 安全建议

- 生产环境建议使用环境变量管理敏感信息
- 定期备份 `data.sqlite` 数据库文件
- 建议配置防火墙规则限制访问

## 📄 许可证

MIT License

