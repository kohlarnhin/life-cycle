import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Eye, EyeOff, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface EmailSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromAddr: string;
  toAddr: string;
}

const API_BASE_URL = '/api';

export function Settings() {
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '587',
    user: '',
    pass: '',
    fromAddr: '',
    toAddr: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 从后端加载邮件配置
  useEffect(() => {
    const fetchEmailConfig = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/email-config`);
        const result: ApiResponse<EmailSettings> = await res.json();
        
        if (result.code === 0 && result.data) {
          const data = result.data;
          setSmtpConfig({
            host: data.host || '',
            port: String(data.port || 587),
            user: data.user || '',
            pass: data.pass || '',
            fromAddr: data.fromAddr || '',
            toAddr: data.toAddr || '',
          });
        }
      } catch (err) {
        console.error('加载邮件配置失败', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmailConfig();
  }, []);

  // 保存配置到后端
  const handleSave = async () => {
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.fromAddr || !smtpConfig.toAddr) {
      toast.error('请填写完整的配置信息');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/email-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpConfig.host,
          port: parseInt(smtpConfig.port, 10),
          secure: parseInt(smtpConfig.port, 10) === 465,
          user: smtpConfig.user,
          pass: smtpConfig.pass,
          fromAddr: smtpConfig.fromAddr,
          toAddr: smtpConfig.toAddr,
        }),
      });

      const result: ApiResponse<EmailSettings> = await res.json();
      
      if (result.code === 0) {
        toast.success('配置保存成功');
      } else {
        toast.error(result.message || '保存失败');
      }
    } catch (err) {
      console.error('保存邮件配置失败', err);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 发送测试邮件
  const handleTestEmail = async () => {
    setIsTesting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/email-test`, {
        method: 'POST',
      });

      const result: ApiResponse<{ count: number }> = await res.json();
      
      if (result.code === 0) {
        toast.success(result.message || '测试邮件已发送');
      } else {
        toast.error(result.message || '发送失败');
      }
    } catch (err) {
      console.error('发送测试邮件失败', err);
      toast.error('发送失败');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

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
              value={smtpConfig.host}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
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
            <p className="text-xs text-gray-400 mt-1">常用端口: 587 (TLS) / 465 (SSL) / 25</p>
          </div>

          <div>
            <Label htmlFor="smtpUser" className="text-gray-700">SMTP 用户名</Label>
            <Input
              id="smtpUser"
              type="text"
              placeholder="your-email@example.com"
              value={smtpConfig.user}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
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
                value={smtpConfig.pass}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
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
              value={smtpConfig.fromAddr}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, fromAddr: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200 focus:border-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="toEmail" className="text-gray-700">收件人邮箱</Label>
            <Input
              id="toEmail"
              type="email"
              placeholder="receiver@example.com"
              value={smtpConfig.toAddr}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, toAddr: e.target.value })}
              className="mt-2 h-12 rounded-xl border-gray-200 focus:border-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存配置'
              )}
            </Button>
          </motion.div>
          
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleTestEmail}
              disabled={isTesting}
              variant="outline"
              className="h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50"
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </motion.div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-blue-800 font-medium">💡 提示</p>
          <p className="text-blue-600 mt-1 text-sm">
            配置完成后，系统将在每天 00:10 发送已过期提醒，23:50 发送即将过期提醒（≤3天）。
            点击发送按钮可测试当前配置是否正确。
          </p>
        </div>
      </motion.div>
    </div>
  );
}
