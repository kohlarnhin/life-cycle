// 数据库初始化与数据访问层
// 使用 better-sqlite3 做同步访问，便于在小型项目中使用

const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'data.sqlite');
const db = new Database(dbPath);

// 开启外键约束
db.pragma('foreign_keys = ON');

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    expire_date TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS email_settings (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    host TEXT,
    port INTEGER,
    secure INTEGER NOT NULL DEFAULT 0,
    user TEXT,
    pass TEXT,
    from_addr TEXT,
    to_addr TEXT
  );
`);

// 工具函数：格式化日期为 yyyy-MM-dd 字符串
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 工具函数：从 yyyy-MM-dd 或 ISO 字符串解析出日期（忽略时分秒）
function parseDateString(dateString) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// 工具函数：在给定日期字符串上增加 N 天，返回 yyyy-MM-dd
function addDays(dateString, days) {
  const date = parseDateString(dateString);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// 工具函数：返回 N 天前的日期字符串（yyyy-MM-dd）
function daysAgoDate(days) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const date = new Date(Date.now() - days * msPerDay);
  return formatDate(date);
}

// 初始化种子数据（仅在表为空时插入一次）
function seedInitialData() {
  const categoryCountRow = db
    .prepare('SELECT COUNT(*) AS count FROM categories')
    .get();

  if (categoryCountRow.count > 0) {
    return;
  }

  const categories = [
    { key: 'clothing', name: '衣物' },
    { key: 'cleaning', name: '清洁' }
  ];

  const habits = [
    {
      title: '晒被子',
      duration: 14,
      daysAgo: 3,
      categoryKey: 'clothing'
    },
    {
      title: '洗鞋子',
      duration: 30,
      daysAgo: 20,
      categoryKey: 'clothing'
    },
    {
      title: '洗毯子',
      duration: 60,
      daysAgo: 61,
      categoryKey: 'clothing'
    },
    {
      title: '消杀',
      duration: 7,
      daysAgo: 6,
      categoryKey: 'cleaning'
    },
    {
      title: '扫地拖地',
      duration: 3,
      daysAgo: 2,
      categoryKey: 'cleaning'
    },
    {
      title: '清洁空调滤网',
      duration: 90,
      daysAgo: 92,
      categoryKey: 'cleaning'
    }
  ];

  const insertCategory = db.prepare(
    'INSERT INTO categories (name) VALUES (?)' 
  );
  const insertHabit = db.prepare(
    'INSERT INTO habits (title, duration, start_date, expire_date, category_id) VALUES (?, ?, ?, ?, ?)' 
  );

  const seedTransaction = db.transaction(() => {
    const categoryIdByKey = {};

    for (const category of categories) {
      const info = insertCategory.run(category.name);
      categoryIdByKey[category.key] = info.lastInsertRowid;
    }

    for (const habit of habits) {
      const categoryId = categoryIdByKey[habit.categoryKey];
      const startDate = daysAgoDate(habit.daysAgo);
      const expireDate = addDays(startDate, habit.duration);
      insertHabit.run(
        habit.title,
        habit.duration,
        startDate,
        expireDate,
        categoryId
      );
    }
  });

  seedTransaction();
}

seedInitialData();

// 数据访问函数封装

// 分组相关
function getAllCategories() {
  return db
    .prepare(
      `SELECT c.id, c.name, COUNT(h.id) AS habitCount
       FROM categories c
       LEFT JOIN habits h ON h.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY c.id`
    )
    .all();
}

function createCategory(name) {
  const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
  return { id: info.lastInsertRowid, name };
}

function deleteCategory(id) {
  const info = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return info.changes > 0;
}

// 事项（习惯）相关
function getAllHabits() {
  const rows = db
    .prepare(
      `SELECT id, title, duration, start_date AS startDate, category_id AS categoryId
       FROM habits
       ORDER BY
         CASE WHEN expire_date < date('now') THEN 0 ELSE 1 END,
         CASE
           WHEN expire_date < date('now') THEN julianday(expire_date)
           ELSE (julianday(expire_date) - julianday(date('now'))) / duration
         END,
         id DESC`
    )
    .all();
  return rows;
}

function getHabitsByCategory(categoryId) {
  const rows = db
    .prepare(
      `SELECT id, title, duration, start_date AS startDate, category_id AS categoryId
       FROM habits
       WHERE category_id = ?
       ORDER BY
         CASE WHEN expire_date < date('now') THEN 0 ELSE 1 END,
         CASE
           WHEN expire_date < date('now') THEN julianday(expire_date)
           ELSE (julianday(expire_date) - julianday(date('now'))) / duration
         END,
         id DESC`
    )
    .all(categoryId);
  return rows;
}

function getHabitsPaged({ categoryId, page, pageSize }) {
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  if (categoryId) {
    return db
      .prepare(
        `SELECT id, title, duration, start_date AS startDate, category_id AS categoryId
         FROM habits
         WHERE category_id = ?
         ORDER BY
           CASE WHEN expire_date < date('now') THEN 0 ELSE 1 END,
           CASE
             WHEN expire_date < date('now') THEN julianday(expire_date)
             ELSE (julianday(expire_date) - julianday(date('now'))) / duration
           END,
           id DESC
         LIMIT ? OFFSET ?`
      )
      .all(categoryId, limit, offset);
  }

  return db
    .prepare(
      `SELECT id, title, duration, start_date AS startDate, category_id AS categoryId
       FROM habits
       ORDER BY
         CASE WHEN expire_date < date('now') THEN 0 ELSE 1 END,
         CASE
           WHEN expire_date < date('now') THEN julianday(expire_date)
           ELSE (julianday(expire_date) - julianday(date('now'))) / duration
         END,
         id DESC
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset);
}

// 获取已过期的事项列表（用于发送邮件）
function getExpiredHabits() {
  return db
    .prepare(
      `SELECT id, title, duration, start_date AS startDate, expire_date AS expireDate, category_id AS categoryId
       FROM habits
       WHERE expire_date < date('now')
       ORDER BY expire_date ASC, id DESC`
    )
    .all();
}

// 获取即将过期的事项列表（剩余天数 <= daysThreshold）
function getExpiringSoonHabits(daysThreshold = 3) {
  return db
    .prepare(
      `SELECT id, title, duration, start_date AS startDate, expire_date AS expireDate, category_id AS categoryId
       FROM habits
       WHERE expire_date >= date('now')
         AND expire_date <= date('now', '+' || ? || ' days')
       ORDER BY expire_date ASC, id DESC`
    )
    .all(daysThreshold);
}

function createHabit({ title, duration, categoryId }) {
  const startDate = formatDate(new Date());
  const expireDate = addDays(startDate, duration);
  const info = db
    .prepare(
      'INSERT INTO habits (title, duration, start_date, expire_date, category_id) VALUES (?, ?, ?, ?, ?)'
    )
    .run(title, duration, startDate, expireDate, categoryId);

  return { id: info.lastInsertRowid, title, duration, startDate, categoryId };
}

function resetHabitStartDate(id) {
  const existing = db
    .prepare('SELECT duration FROM habits WHERE id = ?')
    .get(id);

  if (!existing) {
    return null;
  }

  const newStartDate = formatDate(new Date());
  const newExpireDate = addDays(newStartDate, existing.duration);

  const info = db
    .prepare('UPDATE habits SET start_date = ?, expire_date = ? WHERE id = ?')
    .run(newStartDate, newExpireDate, id);

  if (info.changes === 0) {
    return null;
  }

  const habit = db
    .prepare(
      'SELECT id, title, duration, start_date AS startDate, category_id AS categoryId FROM habits WHERE id = ?'
    )
    .get(id);

  return habit;
}

function deleteHabit(id) {
  const info = db.prepare('DELETE FROM habits WHERE id = ?').run(id);
  return info.changes > 0;
}

function updateHabit(id, { title, duration, categoryId }) {
  const existing = db
    .prepare('SELECT start_date FROM habits WHERE id = ?')
    .get(id);

  if (!existing) {
    return null;
  }

  const newExpireDate = addDays(existing.start_date, duration);

  const info = db
    .prepare(
      'UPDATE habits SET title = ?, duration = ?, expire_date = ?, category_id = ? WHERE id = ?'
    )
    .run(title, duration, newExpireDate, categoryId, id);

  if (info.changes === 0) {
    return null;
  }

  const habit = db
    .prepare(
      'SELECT id, title, duration, start_date AS startDate, category_id AS categoryId FROM habits WHERE id = ?'
    )
    .get(id);

  return habit;
}

// 邮件配置
function getEmailSettings() {
  const row = db
    .prepare(
      `SELECT host, port, secure, user, pass, from_addr AS fromAddr, to_addr AS toAddr
       FROM email_settings WHERE id = 1`
    )
    .get();
  if (!row) {
    return null;
  }
  return {
    host: row.host || '',
    port: row.port || 0,
    secure: !!row.secure,
    user: row.user || '',
    pass: row.pass || '',
    fromAddr: row.fromAddr || '',
    toAddr: row.toAddr || ''
  };
}

function saveEmailSettings({ host, port, secure, user, pass, fromAddr, toAddr }) {
  db.exec('DELETE FROM email_settings');
  db.prepare(
    `INSERT INTO email_settings (id, host, port, secure, user, pass, from_addr, to_addr)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?)`
  ).run(host, port, secure ? 1 : 0, user, pass, fromAddr, toAddr);

  return getEmailSettings();
}

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  getAllHabits,
  getHabitsByCategory,
  getExpiredHabits,
  getExpiringSoonHabits,
  getHabitsPaged,
  createHabit,
  resetHabitStartDate,
  deleteHabit,
  updateHabit,
  getEmailSettings,
  saveEmailSettings
};
