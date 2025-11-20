import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Eye, EyeOff, Mail, Clock } from 'lucide-react';

interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  toEmail: string;
}

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;

export function Settings() {
  const [smtpConfig, setSmtpConfig] = useState({
    server: 'smtp.qq.com',
    port: '587',
    username: '',
    password: '',
    fromEmail: '',
    toEmail: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // 从后端加载配置
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/email-config`);
      if (res.ok) {
        const data = await res.json();
        if (data.host) {
          setSmtpConfig({
            server: data.host || '',
            port: String(data.port || '587'),
            username: data.user || '',
            password: data.pass || '',
            fromEmail: data.fromAddr || '',
            toEmail: data.toAddr || '',
          });
        }
      }
    } catch (error) {
      console.error('加载邮件配置失败', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/email-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: smtpConfig.server,
          port: parseInt(smtpConfig.port, 10),
          secure: parseInt(smtpConfig.port, 10) === 465,
          user: smtpConfig.username,
          pass: smtpConfig.password,
          fromAddr: smtpConfig.fromEmail,
          toAddr: smtpConfig.toEmail,
        }),
      });

      if (res.ok) {
        setSaveMessage({ type: 'success', text: '配置保存成功！' });
        setTimeout(() => setSaveMessage(null), 2000);
      } else {
        const error = await res.json();
        setSaveMessage({ type: 'error', text: error.message || '保存失败' });
      }
    } catch (error) {
      console.error('保存配置失败', error);
      setSaveMessage({ type: 'error', text: '保存失败，请检查网络连接' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewRules = async () => {
    if (showRules) {
      setShowRules(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/email-rules`);
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
        setShowRules(true);
      }
    } catch (error) {
      console.error('获取发送规则失败', error);
    }
  };

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="smtpHost" className="text-gray-700">SMTP 服务器</Label>
            <Input
              id="smtpHost"
              type="text"
              placeholder="smtp.qq.com"
              value={smtpConfig.server}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, server: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="smtpPort" className="text-gray-700">SMTP 端口</Label>
            <Input
              id="smtpPort"
              type="text"
              placeholder="587"
              value={smtpConfig.port}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="smtpUser" className="text-gray-700">SMTP 用户名</Label>
            <Input
              id="smtpUser"
              type="text"
              placeholder="your-email@qq.com"
              value={smtpConfig.username}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="smtpPassword" className="text-gray-700">SMTP 授权码</Label>
            <div className="relative mt-2">
              <Input
                id="smtpPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="16位授权码"
                value={smtpConfig.password}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                className="h-12 rounded-xl border-gray-200 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="fromEmail" className="text-gray-700">发件人邮箱</Label>
            <Input
              id="fromEmail"
              type="email"
              placeholder="sender@qq.com"
              value={smtpConfig.fromEmail}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="toEmail" className="text-gray-700">收件人邮箱</Label>
            <Input
              id="toEmail"
              type="email"
              placeholder="receiver@qq.com"
              value={smtpConfig.toEmail}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, toEmail: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200"
            />
          </div>
        </div>

        {/* 保存结果消息 */}
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 border ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border-green-100'
                : 'bg-red-50 border-red-100'
            }`}
          >
            <p className={`font-medium ${
              saveMessage.type === 'success'
                ? 'text-green-800'
                : 'text-red-800'
            }`}>
              {saveMessage.type === 'success' ? '✓ ' : '✗ '}
              {saveMessage.text}
            </p>
          </motion.div>
        )}

        {/* 按钮组 */}
        <div className="pt-4 flex gap-3 relative">
          <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
          <Button
            onClick={handleSave}
              disabled={isSaving}
              className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-400"
            >
              {isSaving ? '保存中...' : '保存配置'}
            </Button>
          </motion.div>

          <div className="relative">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleViewRules}
                variant="outline"
                className="h-12 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                发送规则
          </Button>
        </motion.div>

            {/* 规则气泡弹窗 */}
            <AnimatePresence>
              {showRules && (
                <>
                  {/* 遮罩层 */}
                  <div
                    onClick={() => setShowRules(false)}
                    className="fixed inset-0 z-40"
                  />
                  
                  {/* 气泡内容 - 在按钮上方 */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
                    style={{ width: '280px', bottom: 'calc(100% + 12px)' }}
                  >
                    {/* 小三角 - 指向按钮 */}
                    <div className="absolute left-auto right-6 w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45" style={{ bottom: '-1.5px' }}></div>
                    
                    <div className="p-4">
                      {rules.map((rule, index) => (
                        <div
                          key={index}
                          className={`${index !== 0 ? 'mt-3 pt-3 border-t border-gray-100' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-800 font-medium text-sm">{rule.name}</span>
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <Clock className="w-3 h-3" />
                              <span>{rule.schedule}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs">{rule.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-4">
          <p className="text-blue-800">💡 提示</p>
          <p className="text-blue-600 mt-1">
            配置完成后，系统将在物品即将过期时自动发送邮件提醒。
          </p>
        </div>
      </motion.div>
    </div>
  );
}