import { useState, useEffect } from 'react';
import { Plus, X, Check, List, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { HabitCard } from './components/HabitCard';
import { Settings } from './components/Settings';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

// API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface Habit {
  id: number;
  title: string;
  duration: number;
  startDate: Date;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  habitCount?: number;
}

interface HabitDTO {
  id: number;
  title: string;
  duration: number;
  startDate: string;
  categoryId: number;
}

const API_BASE_URL = '/api';
const PAGE_SIZE = 10;

export default function App() {
  const [currentView, setCurrentView] = useState<'list' | 'settings'>('list');
  
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [longPressingCategory, setLongPressingCategory] = useState<string | null>(null);
  const [showFirstTimeTip, setShowFirstTimeTip] = useState(() => {
    return !localStorage.getItem('categoryTipShown');
  });
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const dismissTip = () => {
    setShowFirstTimeTip(false);
    localStorage.setItem('categoryTipShown', 'true');
  };
  
  // 监听点击事件，点击分组区域外时取消删除状态
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (longPressingCategory) {
        const target = e.target as HTMLElement;
        const clickedCategory = target.closest(`[data-category-id="${longPressingCategory}"]`);
        if (!clickedCategory) {
          setLongPressingCategory(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [longPressingCategory]);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitDuration, setNewHabitDuration] = useState('21');
  const [newHabitCategory, setNewHabitCategory] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);

  // 加载分类数据
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const result: ApiResponse<Category[]> = await res.json();
      
      if (result.code !== 0) {
        toast.error(result.message || '加载分组失败');
        return;
      }
      
      const categoriesData = result.data;
      setCategories(categoriesData);

      if (!newHabitCategory && categoriesData.length > 0) {
        setNewHabitCategory(String(categoriesData[0].id));
      }
    } catch (err) {
      console.error('加载分组失败', err);
      toast.error('加载分组失败');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 加载习惯数据
  const fetchHabits = async (
    categoryId: string,
    pageToLoad: number,
    replace = false,
  ) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      params.set('page', String(pageToLoad));
      params.set('pageSize', String(PAGE_SIZE));
      if (categoryId !== 'all') {
        params.set('categoryId', categoryId);
      }

      const res = await fetch(`${API_BASE_URL}/habits?${params.toString()}`);
      const result: ApiResponse<HabitDTO[]> = await res.json();
      
      if (result.code !== 0) {
        toast.error(result.message || '加载内容失败');
        return;
      }

      const habitsData = result.data;
      const mapped = habitsData.map((h) => ({
        ...h,
        startDate: new Date(`${h.startDate}T00:00:00`),
      }));

      setHabits((prev) => (replace ? mapped : [...prev, ...mapped]));
      setHasMore(habitsData.length === PAGE_SIZE);
      setPage(pageToLoad);
    } catch (err) {
      console.error('加载内容失败', err);
      toast.error('加载内容失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setHabits([]);
    setPage(1);
    setHasMore(true);
    fetchHabits(activeCategory, 1, true);
  }, [activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      const scrollTop = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (docHeight - (scrollTop + windowHeight) < 200) {
        fetchHabits(activeCategory, page + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, page, activeCategory]);

  const handleAddHabit = async () => {
    if (newHabitTitle.trim() && newHabitDuration && newHabitCategory) {
      try {
        if (isEditing && editingHabitId) {
          // 编辑模式：更新现有习惯
          const res = await fetch(`${API_BASE_URL}/habits/${editingHabitId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newHabitTitle.trim(),
              duration: parseInt(newHabitDuration, 10),
              categoryId: Number(newHabitCategory),
            }),
          });

          const result: ApiResponse<HabitDTO> = await res.json();
          
          if (result.code !== 0) {
            toast.error(result.message || '更新内容失败');
            return;
          }

          const updated = result.data;
          setHabits(habits.map(habit => 
            habit.id === editingHabitId
              ? { ...updated, startDate: new Date(`${updated.startDate}T00:00:00`) }
              : habit
          ));

          fetchCategories();
          toast.success('更新成功');
          setIsEditing(false);
          setEditingHabitId(null);
        } else {
          // 添加模式
          const res = await fetch(`${API_BASE_URL}/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newHabitTitle.trim(),
              duration: parseInt(newHabitDuration, 10),
              categoryId: Number(newHabitCategory),
            }),
          });

          const result: ApiResponse<HabitDTO> = await res.json();
          
          if (result.code !== 0) {
            toast.error(result.message || '创建内容失败');
            return;
          }

          const created = result.data;
          setHabits([...habits, { ...created, startDate: new Date(`${created.startDate}T00:00:00`) }]);
          fetchCategories();
          toast.success('创建成功');
        }

        setNewHabitTitle('');
        setNewHabitDuration('21');
        if (categories.length > 0) {
          setNewHabitCategory(String(categories[0].id));
        }
        setIsAdding(false);
      } catch (err) {
        console.error('操作失败', err);
        toast.error('操作失败');
      }
    }
  };

  const handleCancel = () => {
    setNewHabitTitle('');
    setNewHabitDuration('21');
    if (categories.length > 0) {
      setNewHabitCategory(String(categories[0].id));
    } else {
      setNewHabitCategory('');
    }
    setIsAdding(false);
    setIsAddingCategory(false);
    setNewCategoryName('');
    setIsEditing(false);
    setEditingHabitId(null);
  };

  const handleEdit = (id: number) => {
    const habitToEdit = habits.find(h => h.id === id);
    if (habitToEdit) {
      setNewHabitTitle(habitToEdit.title);
      setNewHabitDuration(habitToEdit.duration.toString());
      setNewHabitCategory(String(habitToEdit.categoryId));
      setEditingHabitId(id);
      setIsEditing(true);
      setIsAdding(true);
    }
  };

  const handleReset = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/habits/${id}/reset`, { method: 'POST' });
      const result: ApiResponse<HabitDTO> = await res.json();
      
      if (result.code !== 0) {
        toast.error(result.message || '重置内容失败');
        return;
      }

      const updated = result.data;
      setHabits(habits.map((habit) =>
        habit.id === id ? { ...updated, startDate: new Date(`${updated.startDate}T00:00:00`) } : habit
      ));
      toast.success('重置成功');
    } catch (err) {
      console.error('重置内容失败', err);
      toast.error('重置内容失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/habits/${id}`, { method: 'DELETE' });
      const result: ApiResponse<null> = await res.json();
      
      if (result.code !== 0) {
        toast.error(result.message || '删除内容失败');
        return;
      }

      setHabits(habits.filter((habit) => habit.id !== id));
      fetchCategories();
      toast.success('删除成功');
    } catch (err) {
      console.error('删除内容失败', err);
      toast.error('删除内容失败');
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCategoryName.trim() }),
        });

        const result: ApiResponse<Category> = await res.json();
        
        if (result.code !== 0) {
          toast.error(result.message || '创建分组失败');
          return;
        }

        const created = result.data;
        setCategories([...categories, created]);
        setNewCategoryName('');
        setIsAddingCategory(false);
        toast.success('创建分组成功');

        if (!newHabitCategory) {
          setNewHabitCategory(String(created.id));
        }
      } catch (err) {
        console.error('创建分组失败', err);
        toast.error('创建分组失败');
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`, { method: 'DELETE' });
      const result: ApiResponse<null> = await res.json();
      
      if (result.code !== 0) {
        toast.error(result.message || '删除分组失败');
        return;
      }

      const catIdNum = Number(categoryId);
      const newCategories = categories.filter((cat) => cat.id !== catIdNum);
      setCategories(newCategories);
      setHabits(habits.filter((habit) => habit.categoryId !== catIdNum));

      if (activeCategory === categoryId) {
        setActiveCategory('all');
      }

      if (newHabitCategory === categoryId) {
        if (newCategories.length > 0) {
          setNewHabitCategory(String(newCategories[0].id));
        } else {
          setNewHabitCategory('');
        }
      }
      toast.success('删除分组成功');
    } catch (err) {
      console.error('删除分组失败', err);
      toast.error('删除分组失败');
    }
  };

  const filteredHabits = habits;
  const totalHabitCount = categories.reduce(
    (sum, category) => sum + (category.habitCount ?? 0),
    0,
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Toaster position="top-center" richColors />
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
        
        {/* 分组标签页 - 仅在列表视图且非添加状态显示 */}
        {currentView === 'list' && !isAdding && !isAddingCategory && (
          <div className="px-4 py-4 flex items-center gap-2 relative" data-category-section>
            {/* 左侧滚动区域 */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max pt-1 pb-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                    activeCategory === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部 ({totalHabitCount})
                </motion.button>
                
                {categories.map((category) => (
                  <div key={category.id} className="relative">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (longPressingCategory !== String(category.id)) {
                          setActiveCategory(String(category.id));
                        }
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        const timer = setTimeout(() => {
                          setLongPressingCategory(String(category.id));
                          dismissTip();
                          if ('vibrate' in navigator) {
                            navigator.vibrate(50);
                          }
                        }, 500);
                        setPressTimer(timer);
                      }}
                      onPointerUp={() => {
                        if (pressTimer) {
                          clearTimeout(pressTimer);
                          setPressTimer(null);
                        }
                      }}
                      onPointerLeave={() => {
                        if (pressTimer) {
                          clearTimeout(pressTimer);
                          setPressTimer(null);
                        }
                      }}
                      className={`px-4 py-2 rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
                        longPressingCategory === String(category.id)
                          ? 'bg-red-500 text-white pr-2'
                          : activeCategory === String(category.id)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      data-category-id={category.id}
                    >
                      <span>{category.name} ({category.habitCount ?? 0})</span>
                      {longPressingCategory === String(category.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`确定删除分组"${category.name}"及其所有内容吗？`)) {
                              handleDeleteCategory(String(category.id));
                              setLongPressingCategory(null);
                            }
                          }}
                          className="p-1 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </motion.div>
                      )}
                    </motion.button>
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
            
            {/* 首次提示 */}
            <AnimatePresence>
              {showFirstTimeTip && categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 1 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl shadow-lg z-40 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span>长按分组可删除</span>
                    <button
                      onClick={dismissTip}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
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
              className="pb-6"
            >
              <Settings />
            </motion.div>
          ) : !isAdding && !isAddingCategory ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-4 pt-6 pb-6"
            >
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* 添加卡片 */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAdding(true)}
                  className="h-40 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
                  </div>
                  <span className="text-gray-500 group-hover:text-gray-700 transition-colors">添加项目</span>
                </motion.button>
                
                {/* 现有卡片 */}
                {filteredHabits.map((habit, index) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onReset={handleReset}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    index={index + 1}
                  />
                ))}
              </div>
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
                        onClick={() => setNewHabitCategory(String(category.id))}
                        className={`py-3 rounded-xl border-2 transition-all ${
                          newHabitCategory === String(category.id)
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

      {/* Floating Action Buttons - 仅在添加/编辑状态显示 */}
      {currentView === 'list' && (isAdding || isAddingCategory) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 py-4 px-6 z-20">
          <div className="flex justify-center items-center gap-4">
            <AnimatePresence mode="wait">
              {isAddingCategory ? (
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
