import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Eye, EyeOff, Mail } from 'lucide-react';

interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  toEmail: string;
}

export function Settings() {
  const [smtpConfig, setSmtpConfig] = useState({
    server: '',
    port: '587',
    username: '',
    password: '',
    fromEmail: '',
    toEmail: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('smtpConfig');
    if (saved) {
      setSmtpConfig(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('smtpConfig', JSON.stringify(smtpConfig));
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
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
              placeholder="例如：smtp.gmail.com"
              value={smtpConfig.server}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, server: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200 focus:border-gray-400"
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
              className="mt-2 h-12 rounded-xl border-gray-200 focus:border-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="smtpUser" className="text-gray-700">SMTP 用户名</Label>
            <Input
              id="smtpUser"
              type="text"
              placeholder="your-email@example.com"
              value={smtpConfig.username}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200 focus:border-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="smtpPassword" className="text-gray-700">SMTP 密码</Label>
            <div className="relative mt-2">
              <Input
                id="smtpPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={smtpConfig.password}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                className="h-12 rounded-xl border-gray-200 focus:border-gray-400 pr-12"
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
              placeholder="sender@example.com"
              value={smtpConfig.fromEmail}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200 focus:border-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="toEmail" className="text-gray-700">收件人邮箱</Label>
            <Input
              id="toEmail"
              type="email"
              placeholder="receiver@example.com"
              value={smtpConfig.toEmail}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, toEmail: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200 focus:border-gray-400"
            />
          </div>
        </div>

        <motion.div
          whileTap={{ scale: 0.98 }}
          className="pt-4"
        >
          <Button
            onClick={handleSave}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isSaving ? '保存中...' : '保存配置'}
          </Button>
        </motion.div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-blue-800">💡 提示</p>
          <p className="text-blue-600 mt-1">
            配置完成后，系统将在物品即将过期时自动发送邮件提醒。
          </p>
        </div>
      </motion.div>
    </div>
  );
}