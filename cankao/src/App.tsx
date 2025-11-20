import { useState } from 'react';
import { Plus, X, Check, List, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HabitCard } from './components/HabitCard';
import { Settings } from './components/Settings';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

interface Habit {
  id: string;
  title: string;
  duration: number;
  startDate: Date;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'list' | 'settings'>('list');
  
  const [categories, setCategories] = useState<Category[]>([
    { id: 'clothing', name: '衣物' },
    { id: 'cleaning', name: '清洁' },
    { id: 'kitchen', name: '厨房' },
    { id: 'health', name: '健康' },
  ]);
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      title: '晒被子',
      duration: 14,
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      categoryId: 'clothing',
    },
    {
      id: '2',
      title: '洗鞋子',
      duration: 30,
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      categoryId: 'clothing',
    },
    {
      id: '3',
      title: '洗毯子',
      duration: 60,
      startDate: new Date(Date.now() - 61 * 24 * 60 * 60 * 1000),
      categoryId: 'clothing',
    },
    {
      id: '4',
      title: '洗窗帘',
      duration: 90,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      categoryId: 'clothing',
    },
    {
      id: '5',
      title: '消杀',
      duration: 7,
      startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      categoryId: 'cleaning',
    },
    {
      id: '6',
      title: '扫地拖地',
      duration: 3,
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      categoryId: 'cleaning',
    },
    {
      id: '7',
      title: '清洁空调滤网',
      duration: 90,
      startDate: new Date(Date.now() - 92 * 24 * 60 * 60 * 1000),
      categoryId: 'cleaning',
    },
    {
      id: '8',
      title: '清洁油烟机',
      duration: 30,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      categoryId: 'kitchen',
    },
    {
      id: '9',
      title: '清洁冰箱',
      duration: 14,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      categoryId: 'kitchen',
    },
    {
      id: '10',
      title: '更换洗碗布',
      duration: 7,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      categoryId: 'kitchen',
    },
    {
      id: '11',
      title: '体检',
      duration: 365,
      startDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      categoryId: 'health',
    },
    {
      id: '12',
      title: '更换牙刷',
      duration: 90,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      categoryId: 'health',
    },
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitDuration, setNewHabitDuration] = useState('21');
  const [newHabitCategory, setNewHabitCategory] = useState<string>(categories[0]?.id || '');

  const handleAddHabit = () => {
    if (newHabitTitle.trim() && newHabitDuration && newHabitCategory) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        title: newHabitTitle.trim(),
        duration: parseInt(newHabitDuration),
        startDate: new Date(),
        categoryId: newHabitCategory,
      };
      setHabits([...habits, newHabit]);
      setNewHabitTitle('');
      setNewHabitDuration('21');
      setNewHabitCategory(categories[0]?.id || '');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewHabitTitle('');
    setNewHabitDuration('21');
    setNewHabitCategory(categories[0]?.id || '');
    setIsAdding(false);
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const handleReset = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id 
        ? { ...habit, startDate: new Date() }
        : habit
    ));
  };

  const handleDelete = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    setHabits(habits.filter(habit => habit.categoryId !== categoryId));
    if (activeCategory === categoryId) {
      setActiveCategory('all');
    }
  };

  const getFilteredHabits = () => {
    if (activeCategory === 'all') {
      return habits;
    }
    return habits.filter(habit => habit.categoryId === activeCategory);
  };

  const filteredHabits = getFilteredHabits();

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none bg-white/80 backdrop-blur-lg z-10 border-b border-gray-100"
      >
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            {currentView === 'settings' ? (
              <>
                <h1 className="text-gray-800">邮件提醒设置</h1>
                <p className="text-gray-500 mt-1">配置邮件服务器和提醒规则</p>
              </>
            ) : (
              <>
                <h1 className="text-gray-800">生活效期</h1>
                <p className="text-gray-500 mt-1">管理物品效期，养成好习惯</p>
              </>
            )}
          </div>
          
          {/* 右侧切换按钮 */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('list')}
              className={`p-2 rounded-lg transition-all ${
                currentView === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('settings')}
              className={`p-2 rounded-lg transition-all ${
                currentView === 'settings'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Mail className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {/* 分组标签页 - 仅在列表视图显示 */}
        {currentView === 'list' && (
          <div className="px-4 py-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max pt-1 pb-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部 ({habits.length})
              </motion.button>
              
              {categories.map((category) => (
                <div key={category.id} className="relative group pt-1 pr-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                      activeCategory === category.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({habits.filter(h => h.categoryId === category.id).length})
                  </motion.button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定删除分组"${category.name}"及其所有内容吗？`)) {
                        handleDeleteCategory(category.id);
                      }
                    }}
                    className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingCategory(true)}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all whitespace-nowrap"
              >
                + 新分组
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Content - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentView === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-24"
            >
              <Settings />
            </motion.div>
          ) : !isAdding && !isAddingCategory ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-4 pt-6 pb-24"
            >
              {filteredHabits.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {filteredHabits.map((habit, index) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onReset={handleReset}
                      onDelete={handleDelete}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-gray-400">暂无内容</p>
                  <p className="text-gray-300 mt-2">点击下方按钮添加</p>
                </div>
              )}
            </motion.div>
          ) : isAddingCategory ? (
            <motion.div
              key="add-category"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="px-6 pt-12 pb-28 max-w-md mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-gray-700 mb-2">分组名称</label>
                <Input
                  type="text"
                  placeholder="例如：衣物、清洁"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full h-12 rounded-2xl border-gray-200 focus:border-gray-400 transition-colors"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="px-6 pt-12 pb-28 max-w-md mx-auto"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-gray-700 mb-2">内容名称</label>
                  <Input
                    type="text"
                    placeholder="例如：晒被子"
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    className="w-full h-12 rounded-2xl border-gray-200 focus:border-gray-400 transition-colors"
                    autoFocus
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-gray-700 mb-2">效期天数</label>
                  <Input
                    type="number"
                    placeholder="21"
                    value={newHabitDuration}
                    onChange={(e) => setNewHabitDuration(e.target.value)}
                    className="w-full h-12 rounded-2xl border-gray-200 focus:border-gray-400 transition-colors"
                    min="1"
                  />
                  
                  <div className="flex gap-2 mt-3">
                    {[7, 30, 60, 90].map((days) => (
                      <motion.button
                        key={days}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNewHabitDuration(days.toString())}
                        className={`flex-1 py-2 rounded-xl border-2 transition-all ${
                          newHabitDuration === days.toString()
                            ? 'border-gray-800 bg-gray-800 text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {days}天
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-gray-700 mb-2">选择分组</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <motion.button
                        key={category.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNewHabitCategory(category.id)}
                        className={`py-3 rounded-xl border-2 transition-all ${
                          newHabitCategory === category.id
                            ? 'border-gray-800 bg-gray-800 text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {category.name}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                >
                  <p className="text-gray-600 text-center">
                    每 <span className="text-gray-800">{newHabitDuration || 0}</span> 天效期
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Buttons */}
      {currentView === 'list' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 py-4 px-6 z-20">
          <div className="flex justify-center items-center gap-4">
            <AnimatePresence mode="wait">
              {!isAdding && !isAddingCategory ? (
                <motion.div
                  key="add-button"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Button
                    onClick={() => setIsAdding(true)}
                    className="h-14 w-14 rounded-full bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </motion.div>
              ) : isAddingCategory ? (
                <motion.div
                  key="category-buttons"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex gap-3"
                >
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="h-14 w-14 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 shadow-lg flex items-center justify-center p-0"
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </Button>
                  <Button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="h-14 w-14 rounded-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 shadow-lg flex items-center justify-center p-0"
                  >
                    <Check className="h-6 w-6" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="action-buttons"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex gap-3"
                >
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="h-14 w-14 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 shadow-lg flex items-center justify-center p-0"
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </Button>
                  <Button
                    onClick={handleAddHabit}
                    disabled={!newHabitTitle.trim() || !newHabitDuration || !newHabitCategory}
                    className="h-14 w-14 rounded-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 shadow-lg flex items-center justify-center p-0"
                  >
                    <Check className="h-6 w-6" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}