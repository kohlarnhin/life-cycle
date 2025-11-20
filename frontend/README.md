# 生活效期 - 前端应用

基于 React + TypeScript + Vite 构建的现代化移动端应用。

## 🚀 快速开始

### 安装依赖

```bash
cd frontend
npm install
```

### 开发环境

```bash
npm run dev
```

应用将运行在 `http://localhost:5173`

支持局域网访问：`http://[你的IP]:5173`

### 生产构建

```bash
npm run build
```

构建产物将输出到 `build/` 目录。

## 📁 项目结构

```
frontend/
├── src/
│   ├── App.tsx                 # 主应用组件
│   ├── main.tsx               # 应用入口
│   ├── index.css              # 全局样式
│   ├── components/
│   │   ├── HabitCard.tsx      # 物品卡片组件
│   │   ├── Settings.tsx       # 邮件设置组件
│   │   └── ui/                # UI 组件库（Radix UI）
│   └── styles/
│       └── globals.css        # 基础样式
├── index.html                 # HTML 模板
├── vite.config.ts            # Vite 配置
└── package.json              # 依赖配置
```

## 🎨 技术栈

### 核心框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具

### UI/样式
- **Tailwind CSS v4** - 原子化 CSS
- **Motion (Framer Motion)** - 动画库
- **Radix UI** - 无障碍组件库
- **Lucide React** - 图标库

### 其他依赖
- `class-variance-authority` - 样式变体管理
- `clsx` / `tailwind-merge` - 样式合并工具

## 🏗️ 核心组件

### App.tsx
主应用组件，包含：
- 视图切换（列表/设置）
- 分组管理
- 物品列表展示
- 添加物品表单
- 分页加载

### HabitCard.tsx
物品卡片组件，功能：
- 进度环显示（百分比）
- 剩余天数计算
- 过期状态识别
- 状态颜色标识（绿色→灰色→橙色→红色）
- 重置和删除操作

### Settings.tsx
邮件设置组件，功能：
- SMTP 配置管理
- 配置保存到后端
- 发送规则查看（气泡弹窗）
- 密码显示/隐藏切换

## 🎯 状态管理

应用使用 React Hooks 进行状态管理：

```typescript
// 视图状态
const [currentView, setCurrentView] = useState<'list' | 'settings'>('list');

// 分组数据
const [categories, setCategories] = useState<Category[]>([]);
const [activeCategory, setActiveCategory] = useState<string>('all');

// 物品数据
const [habits, setHabits] = useState<Habit[]>([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [isLoading, setIsLoading] = useState(false);
```

## 🔄 数据流

### 1. 数据加载
```typescript
// 加载分类
fetchCategories() -> GET /api/categories

// 加载物品（支持分页和筛选）
fetchHabits(categoryId, page) -> GET /api/habits?categoryId=1&page=1&pageSize=10
```

### 2. 数据创建
```typescript
// 创建物品
handleAddHabit() -> POST /api/habits
// 创建分组
handleAddCategory() -> POST /api/categories
```

### 3. 数据更新/删除
```typescript
// 重置效期
handleReset(id) -> POST /api/habits/:id/reset
// 删除物品
handleDelete(id) -> DELETE /api/habits/:id
// 删除分组
handleDeleteCategory(id) -> DELETE /api/categories/:id
```

## 🎨 样式系统

### Tailwind CSS v4
使用最新的 Tailwind CSS v4，支持：
- CSS 变量主题
- 响应式设计
- 深色模式（预留）
- 自定义颜色系统

### 颜色方案
- 主色调：灰色系（Gray 50-900）
- 状态色：
  - 绿色：健康状态（剩余 >70%）
  - 橙色：警告状态（剩余 10-30%）
  - 红色：危险/过期状态（剩余 <10% 或已过期）

### 动画效果
使用 Motion (Framer Motion) 实现：
- 页面切换动画
- 列表项入场动画
- 按钮交互反馈
- 进度环动画

## 📱 响应式设计

### 布局策略
- 移动端优先设计
- 固定高度布局（`h-screen flex flex-col`）
- 头部固定，内容可滚动
- 底部操作栏固定

### 卡片网格
- 双列网格布局（`grid-cols-2`）
- 自适应间距
- 最大宽度限制（`max-w-2xl`）

## 🔧 配置说明

### Vite 配置
```typescript
{
  server: {
    port: 5173,
    host: '0.0.0.0',  // 支持局域网访问
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'build'
  }
}
```

### API 配置
后端 API 地址自动根据当前主机名配置：
```typescript
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
```

## 📊 性能优化

- ✅ 组件懒加载
- ✅ 列表虚拟化准备
- ✅ 滚动加载（无限滚动）
- ✅ 图片懒加载支持
- ✅ 生产构建优化

## 🐛 开发调试

### 查看控制台日志
```javascript
// 网络请求错误
console.error('加载内容失败', error);

// API 响应错误
console.error('创建内容失败');
```

### 常见问题

**Q: 无法连接后端？**
A: 检查后端是否运行在 3000 端口，查看 API_BASE_URL 配置。

**Q: 样式不生效？**
A: 清除浏览器缓存，重启开发服务器。

**Q: 数据不更新？**
A: 检查网络请求是否成功，查看浏览器控制台。

## 🎯 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 组件使用函数式编程
- Hooks 遵循 React 最佳实践

### 命名规范
- 组件：PascalCase（如 `HabitCard`）
- 函数：camelCase（如 `fetchHabits`）
- 接口：PascalCase（如 `Habit`, `Category`）

## 📄 许可证

MIT License
  