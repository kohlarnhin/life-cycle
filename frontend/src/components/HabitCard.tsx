import { useState } from 'react';
import { RotateCcw, Trash2, AlertTriangle, AlertCircle, Clock, X, Check, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

interface Habit {
  id: number;
  title: string;
  duration: number;
  startDate: Date;
}

interface HabitCardProps {
  habit: Habit;
  onReset: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  index: number;
}

export function HabitCard({ habit, onReset, onDelete, onEdit, index }: HabitCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 计算进度与剩余/过期天数（以天为单位）
  const now = new Date();
  const elapsedDays = Math.floor(
    (now.getTime() - habit.startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const remainingRaw = habit.duration - elapsedDays;
  const isExpired = remainingRaw < 0;
  const expiredDays = isExpired ? -remainingRaw : 0;
  const daysRemaining = Math.max(0, remainingRaw);

  // 剩余百分比（用于进度环）；已过期视为 0%
  const progress = habit.duration > 0
    ? Math.max(0, Math.min(100, (daysRemaining / habit.duration) * 100))
    : 0;

  // 获取状态信息
  const getStatusInfo = () => {
    if (progress === 0) {
      return {
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        numColor: 'text-red-600',
        icon: AlertCircle,
        showIcon: true,
        showDaysRemaining: true
      };
    } else if (progress < 10) {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        numColor: 'text-red-600',
        icon: AlertCircle,
        showIcon: true,
        showDaysRemaining: true
      };
    } else if (progress < 30) {
      return {
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        numColor: 'text-orange-600',
        icon: AlertTriangle,
        showIcon: true,
        showDaysRemaining: true
      };
    } else if (progress < 70) {
      return {
        color: 'text-gray-400',
        bgColor: '',
        textColor: 'text-gray-600',
        numColor: 'text-gray-700',
        icon: Clock,
        showIcon: false,
        showDaysRemaining: daysRemaining <= 5
      };
    } else {
      return {
        color: 'text-green-500',
        bgColor: '',
        textColor: 'text-green-600',
        numColor: 'text-green-600',
        icon: Clock,
        showIcon: false,
        showDaysRemaining: daysRemaining <= 5
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-[160px]">
        {/* Progress Ring - 固定位置 */}
        <div className="absolute top-3 right-3 w-12 h-12">
          <svg className="transform -rotate-90 w-12 h-12">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-100"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className={statusInfo.color}
              strokeDasharray={`${2 * Math.PI * 20}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progress / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span 
              key={Math.round(progress)}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`${statusInfo.numColor} text-[10px] font-medium`}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
        </div>

        {/* Content - 优化布局 */}
        <div className="pr-14 flex flex-col justify-between flex-1">
          <div>
            {/* 标题 - 固定高度区域，最多两行 */}
            <h3 className="text-gray-800 mb-1.5 line-clamp-2 text-[15px] leading-snug min-h-[2.5rem]">{habit.title}</h3>
            
            {/* 效期信息 - 单行显示，不换行 */}
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <motion.span 
                key={isExpired ? `expired-${expiredDays}` : `remain-${daysRemaining}`}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`${statusInfo.numColor} text-[15px]`}
              >
                {isExpired
                  ? expiredDays
                  : statusInfo.showDaysRemaining
                    ? daysRemaining
                    : habit.duration}
              </motion.span>
              <span className="text-gray-500 text-[13px]">
                {isExpired
                  ? '天已过期'
                  : statusInfo.showDaysRemaining
                    ? '天剩余'
                    : '天效期'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons - 固定在底部，根据状态切换显示 */}
        <div className="pt-2.5 border-t border-gray-100">
          <AnimatePresence mode="wait">
            {!showDeleteConfirm ? (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2"
              >
                <Button
                  onClick={() => onEdit(habit.id)}
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 rounded-xl hover:bg-gray-50 text-gray-600 flex items-center justify-center"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => onReset(habit.id)}
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 rounded-xl hover:bg-gray-50 text-gray-600 flex items-center justify-center"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2"
              >
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 rounded-xl hover:bg-gray-50 text-gray-600 flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => {
                    onDelete(habit.id);
                    setShowDeleteConfirm(false);
                  }}
                  size="sm"
                  className="flex-1 h-8 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}