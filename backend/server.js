// 简单的 Express 后端服务
// 提供给前端使用的 REST API，数据存储在 SQLite 中

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// 将过期列表转成邮件内容
function buildExpiredEmailContent(expiredList) {
  const lines = expiredList.map((item) => {
    const expireDate = item.expire_date || item.expireDate || item.expiredate || item.expiredate;
    return `- ${item.title}（到期日：${expireDate}，持续天数：${item.duration}）`;
  });
  return `以下内容已过期：\n\n${lines.join('\n')}`;
}

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 分组相关接口

// 获取全部分组
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('获取分组失败', error);
    res.status(500).json({ message: '获取分组失败' });
  }
});

// 新增分组
app.post('/api/categories', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: '分组名称不能为空' });
    }

    const category = db.createCategory(name.trim());
    res.status(201).json(category);
  } catch (error) {
    console.error('创建分组失败', error);
    res.status(500).json({ message: '创建分组失败' });
  }
});

// 删除分组（会级联删除该分组下的所有事项）
app.delete('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ message: '分组不存在' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('删除分组失败', error);
    res.status(500).json({ message: '删除分组失败' });
  }
});

// 事项（习惯）相关接口

// 获取事项列表，可按分组过滤
app.get('/api/habits', (req, res) => {
  try {
    const { categoryId } = req.query;

    let page = Number(req.query.page || 1);
    let pageSize = Number(req.query.pageSize || DEFAULT_PAGE_SIZE);

    if (!Number.isFinite(page) || page < 1) {
      page = 1;
    }

    if (!Number.isFinite(pageSize) || pageSize < 1) {
      pageSize = DEFAULT_PAGE_SIZE;
    } else if (pageSize > MAX_PAGE_SIZE) {
      pageSize = MAX_PAGE_SIZE;
    }

    const habits = db.getHabitsPaged({
      categoryId:
        categoryId && typeof categoryId === 'string' ? categoryId : undefined,
      page,
      pageSize,
    });

    res.json(habits);
  } catch (error) {
    console.error('获取事项列表失败', error);
    res.status(500).json({ message: '获取事项列表失败' });
  }
});

// 邮件配置获取
app.get('/api/email-config', (req, res) => {
  try {
    const settings = db.getEmailSettings();
    res.json(settings || {});
  } catch (error) {
    console.error('获取邮件配置失败', error);
    res.status(500).json({ message: '获取邮件配置失败' });
  }
});

// 邮件配置保存
app.post('/api/email-config', (req, res) => {
  try {
    const { host, port, secure, user, pass, fromAddr, toAddr } = req.body || {};

    if (!host || !port || !fromAddr || !toAddr) {
      return res.status(400).json({ message: 'host、port、发件人、收件人不能为空' });
    }

    const saved = db.saveEmailSettings({
      host,
      port: Number(port),
      secure: !!secure,
      user: user || '',
      pass: pass || '',
      fromAddr,
      toAddr,
    });

    res.json(saved);
  } catch (error) {
    console.error('保存邮件配置失败', error);
    res.status(500).json({ message: '保存邮件配置失败' });
  }
});

// 发送过期内容测试邮件
app.post('/api/email-test', async (req, res) => {
  try {
    const settings = db.getEmailSettings();
    if (!settings) {
      return res.status(400).json({ message: '请先配置邮件发送信息' });
    }

    const { host, port, secure, user, pass, fromAddr, toAddr } = settings;
    if (!host || !port || !fromAddr || !toAddr) {
      return res.status(400).json({ message: '邮件配置不完整，请检查 host/port/from/to' });
    }

    const expiredList = db.getExpiredHabits();
    if (!expiredList || expiredList.length === 0) {
      return res.status(200).json({ message: '当前没有已过期的内容' });
    }

    // 配置日志输出以便调试
    const portNum = Number(port);
    console.log('邮件配置:', { 
      host, 
      port: portNum, 
      secure: portNum === 465, 
      hasUser: !!user,
      hasPass: !!pass,
      fromAddr,
      toAddr
    });

    // 根据不同的邮件服务器和端口使用不同的配置
    const transportConfig = {
      host,
      port: portNum,
      secure: portNum === 465, // 465 使用 SSL
      auth: user && pass ? { 
        user: user.trim(), 
        pass: pass.trim()
      } : undefined,
    };

    // 针对不同端口的特殊配置
    if (portNum === 587) {
      // STARTTLS 配置 - Gmail 专用
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    } else if (portNum === 465) {
      // SSL/TLS 配置
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    } else {
      // 其他端口
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    // 添加超时和调试配置
    transportConfig.connectionTimeout = 15000;
    transportConfig.greetingTimeout = 15000;
    transportConfig.socketTimeout = 15000;
    transportConfig.debug = true;
    transportConfig.logger = true;

    console.log('Transport 配置:', JSON.stringify(transportConfig, null, 2));

    const transporter = nodemailer.createTransport(transportConfig);

    // 先验证连接
    console.log('正在验证 SMTP 连接...');
    try {
      await transporter.verify();
      console.log('SMTP 连接验证成功');
    } catch (verifyError) {
      console.error('SMTP 连接验证失败:', verifyError);
      return res.status(500).json({ 
        message: 'SMTP 连接失败，请检查服务器地址、端口和认证信息', 
        error: verifyError.message 
      });
    }

    const mailOptions = {
      from: fromAddr,
      to: toAddr,
      subject: '生活效期 - 过期提醒（测试）',
      text: buildExpiredEmailContent(expiredList),
    };

    console.log('正在发送邮件...');
    const info = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功:', info.messageId);

    res.json({ message: '测试邮件已发送', count: expiredList.length });
  } catch (error) {
    console.error('发送测试邮件失败', error);
    res.status(500).json({ message: '发送测试邮件失败', error: error.message || String(error) });
  }
});

// 新增事项
app.post('/api/habits', (req, res) => {
  try {
    const { title, duration, categoryId } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: '内容名称不能为空' });
    }

    const durationNumber = Number(duration);
    if (!durationNumber || !Number.isFinite(durationNumber) || durationNumber <= 0) {
      return res.status(400).json({ message: '效期天数必须为大于 0 的数字' });
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return res.status(400).json({ message: '分组不能为空' });
    }

    const habit = db.createHabit({
      title: title.trim(),
      duration: durationNumber,
      categoryId
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error('创建事项失败', error);
    res.status(500).json({ message: '创建事项失败' });
  }
});

// 重置事项起始日期为当前时间
app.post('/api/habits/:id/reset', (req, res) => {
  try {
    const { id } = req.params;
    const habit = db.resetHabitStartDate(id);
    if (!habit) {
      return res.status(404).json({ message: '事项不存在' });
    }
    res.json(habit);
  } catch (error) {
    console.error('重置事项失败', error);
    res.status(500).json({ message: '重置事项失败' });
  }
});

// 删除事项
app.delete('/api/habits/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteHabit(id);
    if (!deleted) {
      return res.status(404).json({ message: '事项不存在' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('删除事项失败', error);
    res.status(500).json({ message: '删除事项失败' });
  }
});

// 获取发送规则列表
app.get('/api/email-rules', (req, res) => {
  try {
    const rules = [
      {
        name: '过期内容提醒',
        description: '发送所有已过期的内容提醒邮件',
        schedule: '每天 00:10',
        type: 'expired'
      },
      {
        name: '即将过期提醒',
        description: '发送剩余时间≤3天的内容提醒邮件',
        schedule: '每天 23:50',
        type: 'expiring_soon'
      }
    ];
    res.json({ rules });
  } catch (error) {
    console.error('获取发送规则失败', error);
    res.status(500).json({ message: '获取发送规则失败' });
  }
});

// 通用邮件发送函数
async function sendEmailNotification(habitsList, subject) {
  try {
    const settings = db.getEmailSettings();
    if (!settings || !settings.host || !settings.fromAddr || !settings.toAddr) {
      console.log('邮件配置不完整，跳过发送');
      return false;
    }

    if (!habitsList || habitsList.length === 0) {
      console.log('没有需要发送的内容，跳过');
      return false;
    }

    const { host, port, user, pass, fromAddr, toAddr } = settings;
    const portNum = Number(port);

    const transportConfig = {
      host,
      port: portNum,
      secure: portNum === 465,
      auth: user && pass ? { 
        user: user.trim(), 
        pass: pass.trim()
      } : undefined,
    };

    if (portNum === 587) {
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    } else if (portNum === 465) {
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    transportConfig.connectionTimeout = 15000;
    transportConfig.greetingTimeout = 15000;
    transportConfig.socketTimeout = 15000;

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: fromAddr,
      to: toAddr,
      subject: subject,
      text: buildExpiredEmailContent(habitsList),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`邮件发送成功: ${info.messageId}, 发送了 ${habitsList.length} 个提醒`);
    return true;
  } catch (error) {
    console.error('发送邮件失败:', error.message);
    return false;
  }
}

// 定时任务1：每天 00:10 发送已过期内容
cron.schedule('10 0 * * *', async () => {
  console.log('[定时任务] 开始检查过期内容 - 00:10');
  const expiredList = db.getExpiredHabits();
  await sendEmailNotification(expiredList, '生活效期 - 过期提醒');
}, {
  timezone: 'Asia/Shanghai'
});

// 定时任务2：每天 23:50 发送即将过期内容（剩余≤3天）
cron.schedule('50 23 * * *', async () => {
  console.log('[定时任务] 开始检查即将过期内容 - 23:50');
  const expiringSoonList = db.getExpiringSoonHabits(3); // 3天内即将过期
  await sendEmailNotification(expiringSoonList, '生活效期 - 即将过期提醒');
}, {
  timezone: 'Asia/Shanghai'
});

console.log('✓ 定时任务已启动');
console.log('  - 每天 00:10 发送已过期内容提醒');
console.log('  - 每天 23:50 发送即将过期内容提醒（≤3天）');

// 启动服务（此处只定义代码，不在当前环境中执行启动命令）
// 显式监听 0.0.0.0，便于通过任意 IP 访问
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lifecycle backend listening on http://0.0.0.0:${PORT}`);
});
