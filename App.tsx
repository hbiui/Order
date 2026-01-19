import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Dish, Order, OrderStatus, UserRole, PaymentMethod, CartItem } from './types';
import { INITIAL_USERS, INITIAL_DISHES } from './constants';
import { 
  Home, 
  ClipboardList, 
  User as UserIcon, 
  Settings, 
  Plus, 
  Minus, 
  Utensils, 
  Trash2, 
  ChevronRight,
  LogOut,
  CheckCircle2,
  Flame,
  Wallet,
  WashingMachine,
  RefreshCcw,
  Clock,
  Star,
  ShoppingCart,
  ChefHat,
  ArrowLeft,
  X,
  Edit2,
  Save,
  Upload,
  MessageSquare,
  Tag,
  Search,
  ShieldCheck,
  Square,
  CheckSquare,
  Check
} from 'lucide-react';

// --- Reusable Star Component for Half-Stars ---
const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 12 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starIndex = i + 1;
        const isFull = rating >= starIndex;
        const isHalf = !isFull && rating >= starIndex - 0.5;

        return (
          <div key={i} className="relative">
            <Star 
              size={size} 
              fill="none" 
              className="text-slate-200" 
            />
            {isFull && (
              <div className="absolute inset-0">
                <Star size={size} fill="#f97316" className="text-orange-500" />
              </div>
            )}
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star size={size} fill="#f97316" className="text-orange-500" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- 新增：加号按钮弹窗组件 ---
const AddToCartModal: React.FC<{
  dish: Dish;
  onClose: () => void;
  onConfirm: (selectedTaste?: string, note?: string) => void;
}> = ({ dish, onClose, onConfirm }) => {
  const [selectedTaste, setSelectedTaste] = useState<string>(
    dish.tasteOptions && dish.tasteOptions.length > 0 ? dish.tasteOptions[0] : ''
  );
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(selectedTaste || undefined, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[90] flex items-end backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full rounded-t-[56px] p-8 pb-16 animate-in slide-in-from-bottom duration-500 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">添加到购物车</h3>
            <p className="text-slate-400 text-sm font-bold mt-1">{dish.name}</p>
          </div>
          <button onClick={onClose} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-400 active:scale-90">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* 口味选择 */}
          {dish.tasteOptions && dish.tasteOptions.length > 0 && (
            <div>
              <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <MessageSquare size={20} className="text-orange-500" /> 口味选择
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {dish.tasteOptions.map((taste, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTaste(taste)}
                    className={`py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                      selectedTaste === taste
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                        : 'bg-white text-slate-400 border-slate-100 hover:border-orange-200'
                    }`}
                  >
                    {taste}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 订单备注 */}
          <div>
            <h4 className="text-lg font-black text-slate-800 mb-4">订单备注</h4>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="请输入特殊要求（如：少盐、不要葱等）"
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-orange-500/10 resize-none h-32 text-sm font-bold"
            />
          </div>

          {/* 价格信息 */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">点餐成本</p>
                <div className="flex items-baseline gap-2 mt-1">
                  {dish.supportsBalance && <span className="text-2xl font-black text-orange-600">¥{dish.price}</span>}
                  {dish.supportsHousework && (
                    <span className="text-[10px] font-black text-blue-500 uppercase">/ {dish.chorePrice} 次劳动</span>
                  )}
                </div>
              </div>
              <button
                onClick={handleConfirm}
                className="bg-slate-900 text-white py-4 px-8 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-xl shadow-slate-900/20"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components moved outside of App to maintain persistent identity ---

const HomeView: React.FC<{
  dishes: Dish[];
  currentUser: User | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setDetailDish: (d: Dish) => void;
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (dish: Dish, taste?: string, note?: string) => void;
}> = ({ dishes, currentUser, searchQuery, setSearchQuery, setDetailDish, cartCount, setIsCartOpen, addToCart }) => {
  const categories = Array.from(new Set(dishes.map(d => d.category)));
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  
  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    return dishes.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dishes, searchQuery]);

  const activeCategories = useMemo(() => {
    return categories.filter(cat => 
      filteredDishes.some(d => d.category === cat)
    );
  }, [categories, filteredDishes]);

  // 处理搜索框输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 处理加号按钮点击 - 显示弹窗
  const handleAddToCartClick = (e: React.MouseEvent, dish: Dish) => {
    e.stopPropagation();
    e.preventDefault();
    
    setSelectedDish(dish);
    setShowAddToCartModal(true);
  };

  // 处理弹窗确认
  const handleAddToCartConfirm = (dish: Dish, taste?: string, note?: string) => {
    // 设置最近添加的菜品用于动画效果
    setRecentlyAdded(dish.id);
    
    // 添加菜品到购物车
    addToCart(dish, taste, note);
    
    // 1秒后清除最近添加的状态
    setTimeout(() => {
      setRecentlyAdded(null);
    }, 1000);
    
    setShowAddToCartModal(false);
  };

  return (
    <>
      <div className="pb-32 animate-in fade-in duration-500" onClick={(e) => e.stopPropagation()}>
        <header className="px-5 pt-8 pb-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-orange-600 tracking-tighter flex items-center gap-1">
                <Utensils size={28} /> 家味点餐
              </h1>
              <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">挑选属于你的家常味</p>
            </div>
            {/* 修改点：添加家务点数余额展示 */}
            <div className="flex gap-2">
              <div className="bg-slate-50 p-2.5 rounded-2xl flex items-center gap-2 border border-slate-100">
                <div className="bg-orange-500 text-white p-1 rounded-lg"><Wallet size={14}/></div>
                <span className="text-xs font-bold text-slate-700 tracking-tighter">¥{currentUser?.balance?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl flex items-center gap-2 border border-slate-100">
                <div className="bg-blue-500 text-white p-1 rounded-lg"><WashingMachine size={14}/></div>
                <span className="text-xs font-bold text-slate-700 tracking-tighter">{currentUser?.houseworkCredits || 0}次</span>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder="想吃点什么？"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-50 border border-slate-100 py-3.5 pl-11 pr-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/5 focus:bg-white focus:border-orange-200 transition-all placeholder:text-slate-300 text-slate-700"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        <div className="px-5 py-4 space-y-8">
          {filteredDishes.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Search size={40} />
              </div>
              <p className="text-slate-400 font-bold text-sm">找不到相关的菜品哦</p>
              <button onClick={() => setSearchQuery('')} className="mt-4 text-orange-500 text-xs font-black uppercase tracking-widest">清空搜索条件</button>
            </div>
          ) : (
            activeCategories.map(cat => (
              <section key={cat}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">{cat}</h2>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{filteredDishes.filter(d => d.category === cat).length} 道菜品</span>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  {filteredDishes.filter(d => d.category === cat).map(dish => (
                    <div 
                      key={dish.id} 
                      className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-50 flex active:scale-[0.98] transition-all duration-300 group"
                      onClick={() => setDetailDish(dish)}
                    >
                      <div className="relative">
                        <img src={dish.imageUrl} className="w-32 h-32 object-cover" loading="lazy" alt={dish.name} />
                        {dish.difficulty > 3 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-lg">
                            <Flame size={12} fill="currentColor" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 group-hover:text-orange-500 transition-colors">{dish.name}</h3>
                          <p className="text-slate-400 text-[11px] leading-tight line-clamp-2 mt-1">{dish.description}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex flex-col">
                            {dish.supportsBalance && <span className="text-orange-600 font-black text-sm">¥{dish.price}</span>}
                            {dish.supportsHousework && (
                              <span className="text-blue-500 text-[9px] font-bold flex items-center gap-1 uppercase tracking-tighter">
                                <WashingMachine size={10}/> {dish.chorePrice} 次家务
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={(e) => handleAddToCartClick(e, dish)}
                            className={`bg-slate-900 text-white p-2.5 rounded-2xl transition-all hover:shadow-lg active:scale-90 relative ${recentlyAdded === dish.id ? 'bg-orange-500 scale-110' : ''}`}
                          >
                            <Plus size={18} />
                            {recentlyAdded === dish.id && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-ping">
                                <Check size={12} />
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {cartCount > 0 && (
          <button 
            onClick={() => setIsCartOpen(true)}
            className="fixed right-6 bottom-28 w-16 h-16 bg-slate-900 text-white rounded-[24px] shadow-2xl flex items-center justify-center z-30 animate-in zoom-in duration-300 active:scale-90 transition-transform hover:scale-105"
          >
            <ShoppingCart size={24} />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full border-4 border-slate-50 shadow-lg animate-pulse">
              {cartCount}
            </span>
          </button>
        )}
      </div>

      {/* 添加购物车弹窗 */}
      {showAddToCartModal && selectedDish && (
        <AddToCartModal
          dish={selectedDish}
          onClose={() => setShowAddToCartModal(false)}
          onConfirm={(taste, note) => handleAddToCartConfirm(selectedDish, taste, note)}
        />
      )}
    </>
  );
};

const DishDetailView: React.FC<{
  dish: Dish;
  onClose: () => void;
  addToCart: (dish: Dish, taste?: string, note?: string) => void;
}> = ({ dish, onClose, addToCart }) => {
  const [selectedTaste, setSelectedTaste] = useState<string>(dish.tasteOptions && dish.tasteOptions.length > 0 ? dish.tasteOptions[0] : '');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 bg-white z-[60] overflow-y-auto">
      <div className="relative h-80">
        <img src={dish.imageUrl} className="w-full h-full object-cover" alt={dish.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <button 
          onClick={onClose}
          className="absolute top-12 left-6 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 z-10"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="absolute bottom-8 left-8 right-8">
           <span className="px-4 py-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em]">{dish.category}</span>
           <h2 className="text-4xl font-black text-white mt-3 leading-none">{dish.name}</h2>
           <div className="flex items-center gap-6 mt-4 text-white/80 text-xs font-bold">
              <span className="flex items-center gap-1.5"><Clock size={16}/> {dish.cookingTime}</span>
              <StarRating rating={dish.difficulty} size={14} />
           </div>
        </div>
      </div>

      <div className="p-8 pb-48 space-y-12"> {/* 增加底部空间，防止内容被固定底部栏遮挡 */}
        {dish.tasteOptions && dish.tasteOptions.length > 0 && (
          <section>
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-5">
              <MessageSquare size={24} className="text-orange-500"/> 口味偏好
            </h3>
            <div className="flex flex-wrap gap-3">
              {dish.tasteOptions.map((taste, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedTaste(taste)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 ${selectedTaste === taste ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-orange-200'}`}
                >
                  {taste}
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-5"><Utensils size={24} className="text-orange-500"/> 所需食材</h3>
          <div className="flex flex-wrap gap-3">
            {dish.ingredients.map((ing, i) => (
              <span key={i} className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-2xl text-[11px] font-bold border border-slate-100">{ing}</span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-8"><ChefHat size={24} className="text-orange-500"/> 烹饪攻略</h3>
          <div className="space-y-10 relative before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-100">
             {dish.steps.map((step, i) => (
               <div key={i} className="flex gap-8 relative">
                  <div className="w-8 h-8 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xs font-black z-10 shrink-0 shadow-lg shadow-orange-500/20">{i+1}</div>
                  <p className="text-slate-600 text-sm leading-relaxed font-bold pt-1">{step}</p>
               </div>
             ))}
          </div>
        </section>

        {/* 备注输入框 */}
        <section>
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-5">订单备注</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="请输入特殊要求（如：少盐、不要葱等）"
            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-orange-500/10 resize-none h-32 text-sm font-bold"
          />
        </section>
      </div>

      {/* 固定在底部的操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">点餐成本</p>
            <div className="flex items-baseline gap-2">
              {dish.supportsBalance && <span className="text-2xl font-black text-orange-600">¥{dish.price}</span>}
              {dish.supportsHousework && <span className="text-[10px] font-black text-blue-500 uppercase">/ {dish.chorePrice} 次劳动</span>}
            </div>
          </div>
          <button 
            onClick={() => { addToCart(dish, selectedTaste, note.trim() || undefined); onClose(); }}
            className="flex-1 bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg active:scale-95 transition-all shadow-xl shadow-slate-900/20"
          >
            放入我的托盘
          </button>
        </div>
      </div>
    </div>
  );
};

const CartModal: React.FC<{
  cart: CartItem[];
  cartStats: { totalPrice: number; totalChore: number; count: number };
  currentUser: User | null;
  setIsCartOpen: (open: boolean) => void;
  updateCartQuantity: (dishId: string, taste: string | undefined, note: string | undefined, delta: number) => void;
  updateItemPaymentMethod: (dishId: string, taste: string | undefined, note: string | undefined, method: PaymentMethod) => void;
  handleCheckout: () => void;
}> = ({ cart, cartStats, currentUser, setIsCartOpen, updateCartQuantity, updateItemPaymentMethod, handleCheckout }) => (
  <div className="fixed inset-0 bg-black/70 z-[70] flex items-end animate-in fade-in duration-300 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
     <div className="bg-white w-full rounded-t-[56px] p-8 pb-16 animate-in slide-in-from-bottom duration-500 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8 px-2">
           <div className="flex items-baseline gap-2">
             <h2 className="text-3xl font-black tracking-tighter text-slate-900">我的托盘</h2>
             <span className="text-orange-500 font-black text-sm uppercase tracking-widest">{cartStats.count} 份美味</span>
           </div>
           <button onClick={() => setIsCartOpen(false)} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-400 active:scale-90 transition-transform"><X size={24}/></button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-6 mb-8 scrollbar-hide px-2">
           {cart.map((item, idx) => (
             <div key={`${item.dish.id}-${item.selectedTaste || 'default'}-${idx}`} className="bg-slate-50/80 p-5 rounded-[36px] border border-slate-100 flex flex-col gap-4">
               <div className="flex items-center gap-4">
                  <img src={item.dish.imageUrl} className="w-16 h-16 rounded-[24px] object-cover shadow-sm ring-4 ring-white" alt={item.dish.name} />
                  <div className="flex-1">
                     <h4 className="font-black text-slate-800 text-base leading-tight">
                       {item.dish.name}
                     </h4>
                     {item.selectedTaste && (
                       <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-black">
                         {item.selectedTaste}
                       </span>
                     )}
                     {item.note && (
                       <p className="text-[10px] text-slate-500 font-bold mt-1">备注: {item.note}</p>
                     )}
                     <div className="flex items-center bg-white rounded-xl border border-slate-100 p-1 w-fit mt-2 shadow-sm">
                        <button onClick={() => updateCartQuantity(item.dish.id, item.selectedTaste, item.note, -1)} className="p-1.5 text-slate-400 hover:text-red-500 active:scale-75 transition-colors"><Minus size={14}/></button>
                        <span className="w-8 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.dish.id, item.selectedTaste, item.note, 1)} className="p-1.5 text-orange-500 hover:text-orange-600 active:scale-75 transition-colors"><Plus size={14}/></button>
                     </div>
                  </div>
               </div>
               
               <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">结算方式</p>
                  <div className="flex gap-2">
                    {item.dish.supportsBalance && (
                      <button 
                        onClick={() => updateItemPaymentMethod(item.dish.id, item.selectedTaste, item.note, PaymentMethod.BALANCE)}
                        className={`flex-1 py-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${item.selectedPaymentMethod === PaymentMethod.BALANCE ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20' : 'bg-white text-slate-400 border-slate-100'}`}
                      >
                         <Wallet size={14} className={item.selectedPaymentMethod === PaymentMethod.BALANCE ? 'text-white' : 'text-slate-300'} />
                         <span className="text-[10px] font-black tracking-tight">¥{(item.dish.price * item.quantity).toFixed(1)}</span>
                      </button>
                    )}
                    {item.dish.supportsHousework && (
                      <button 
                        onClick={() => updateItemPaymentMethod(item.dish.id, item.selectedTaste, item.note, PaymentMethod.HOUSEWORK)}
                        className={`flex-1 py-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${item.selectedPaymentMethod === PaymentMethod.HOUSEWORK ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white text-slate-400 border-slate-100'}`}
                      >
                         <WashingMachine size={14} className={item.selectedPaymentMethod === PaymentMethod.HOUSEWORK ? 'text-white' : 'text-slate-300'} />
                         <span className="text-[10px] font-black tracking-tight">家务 {item.dish.chorePrice * item.quantity}次</span>
                      </button>
                    )}
                  </div>
               </div>
             </div>
           ))}
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-[36px] shadow-2xl shadow-slate-900/40">
           <div className="flex justify-between items-center mb-6 px-2">
              <div className="space-y-1">
                 <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">应收明细</p>
                 <div className="flex flex-col gap-1">
                    {cartStats.totalPrice > 0 && (
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                         <span className="text-lg font-black tracking-tighter text-orange-400">¥{cartStats.totalPrice.toFixed(1)}</span>
                      </div>
                    )}
                    {cartStats.totalChore > 0 && (
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                         <span className="text-lg font-black tracking-tighter text-blue-400">{cartStats.totalChore} 次家务</span>
                      </div>
                    )}
                    {cartStats.totalPrice === 0 && cartStats.totalChore === 0 && <span className="text-slate-500 font-bold text-sm">选择一种支付方式</span>}
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">剩余余额</p>
                 <span className="text-sm font-bold opacity-80">¥{currentUser?.balance.toFixed(1)}</span>
              </div>
           </div>
           
           <button 
             onClick={handleCheckout}
             disabled={cartStats.totalPrice === 0 && cartStats.totalChore === 0}
             className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:opacity-50 text-white py-5 rounded-[24px] font-black text-xl active:scale-[0.98] transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3"
           >
              <CheckCircle2 size={24} /> 确认下单
           </button>
        </div>
     </div>
  </div>
);

const OrdersView: React.FC<{
  orders: Order[];
  currentUser: User | null;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}> = ({ orders, currentUser, setOrders }) => {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // 核心数据过滤
  const userOrders = useMemo(() => {
    return orders.filter(o => o.userId === currentUser?.id || currentUser?.role === UserRole.ADMIN);
  }, [orders, currentUser]);

  const filteredOrders = useMemo(() => {
    return filter === 'ALL' ? userOrders : userOrders.filter(o => o.status === filter);
  }, [userOrders, filter]);

  // 状态流转逻辑
  const toggleStatus = (id: string, currentStatus: OrderStatus) => {
    const next: Record<string, OrderStatus> = {
      [OrderStatus.PENDING]: OrderStatus.COOKING,
      [OrderStatus.COOKING]: OrderStatus.COMPLETED,
      [OrderStatus.COMPLETED]: OrderStatus.COMPLETED,
      [OrderStatus.CANCELLED]: OrderStatus.CANCELLED,
    };
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next[currentStatus] } : o));
  };

  // 选择逻辑
  const toggleSelection = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  // 修复：单条直接删除
  const deleteSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要永久删除这条订单记录吗？')) {
      setOrders(prev => prev.filter(o => o.id !== id));
      setSelectedOrderIds(prev => prev.filter(sid => sid !== id));
    }
  };

  // 修复：批量删除 - 确保正确删除
  const handleDeleteSelected = () => {
    if (selectedOrderIds.length === 0) return;
    const count = selectedOrderIds.length;
    if (window.confirm(`确定要批量删除这 ${count} 条订单吗？`)) {
      const idsToRemove = new Set(selectedOrderIds);
      setOrders(prev => prev.filter(o => !idsToRemove.has(o.id)));
      setSelectedOrderIds([]);
      if (filteredOrders.length <= count) setIsManageMode(false);
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const map = {
      [OrderStatus.PENDING]: '等待中',
      [OrderStatus.COOKING]: '烹饪中',
      [OrderStatus.COMPLETED]: '已上菜',
      [OrderStatus.CANCELLED]: '已取消',
    };
    return map[status] || status;
  };

  // 修复：管理模式下点击订单项
  const handleOrderItemClick = (orderId: string, e: React.MouseEvent) => {
    if (!isManageMode) return;
    e.stopPropagation();
    toggleSelection(orderId);
  };

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      <header className="px-5 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm border-b border-slate-50">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight">点单记录</h1>
          {userOrders.length > 0 && (
            <button 
              onClick={() => {
                setIsManageMode(!isManageMode);
                setSelectedOrderIds([]);
              }}
              className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl transition-all ${isManageMode ? 'bg-red-500 text-white shadow-lg' : 'bg-orange-500 text-white shadow-lg'}`}
            >
              {isManageMode ? '退出管理' : '批量管理'}
            </button>
          )}
        </div>
        
        {!isManageMode ? (
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            {['ALL', OrderStatus.PENDING, OrderStatus.COOKING, OrderStatus.COMPLETED].map(st => (
              <button key={st} onClick={() => setFilter(st as any)} className={`px-6 py-2.5 rounded-full text-[11px] font-black transition-all uppercase tracking-widest shrink-0 ${filter === st ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                {st === 'ALL' ? '全部' : getStatusLabel(st as OrderStatus)}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl animate-in slide-in-from-top duration-300 shadow-xl">
             <button onClick={handleSelectAll} className="flex items-center gap-2 text-[10px] font-black uppercase px-2 hover:opacity-80 transition-opacity">
               {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? <CheckSquare size={16} className="text-orange-400" /> : <Square size={16} />}
               全选 ({selectedOrderIds.length})
             </button>
             <button 
               onClick={handleDeleteSelected}
               disabled={selectedOrderIds.length === 0}
               className="bg-red-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 disabled:grayscale transition-all shadow-lg active:scale-95"
             >
               <Trash2 size={14} /> 确认删除
             </button>
          </div>
        )}
      </header>

      <div className="p-5 space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="py-32 text-center">
            <ClipboardList size={64} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">暂无订单数据</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isSelected = selectedOrderIds.includes(order.id);
            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-[32px] p-5 shadow-sm border transition-all duration-300 flex flex-col gap-4 relative ${isManageMode ? 'cursor-pointer' : ''} ${isSelected ? 'border-orange-500 ring-4 ring-orange-500/10 bg-orange-50/30' : 'border-slate-50'}`}
                onClick={(e) => isManageMode && handleOrderItemClick(order.id, e)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4 flex-1">
                    {isManageMode && (
                       <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'border-slate-200'}`}>
                          {isSelected && <Check size={16} strokeWidth={4} />}
                       </div>
                    )}
                    <img src={order.dishImage} className="w-16 h-16 rounded-[24px] object-cover shadow-sm border-2 border-white" alt={order.dishName} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 text-base truncate pr-8">
                        {order.dishName} <span className="text-orange-500 text-xs ml-1">x{order.quantity}</span>
                      </h4>
                      {order.selectedTaste && (
                        <p className="text-[10px] font-black text-orange-400 uppercase mt-0.5 truncate">{order.selectedTaste}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                         <p className="text-[9px] text-slate-300 font-black tracking-wider uppercase">{new Date(order.timestamp).toLocaleDateString()} {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100 flex items-center gap-1 font-black">
                            {order.paymentMethod === PaymentMethod.BALANCE ? <Wallet size={10}/> : <WashingMachine size={10}/>}
                            {order.totalCost}
                         </span>
                      </div>
                    </div>
                  </div>
                  
                  {isManageMode ? (
                    <button 
                      onClick={(e) => deleteSingle(order.id, e)}
                      className="absolute top-5 right-5 p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shrink-0 ${
                      order.status === OrderStatus.PENDING ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                      order.status === OrderStatus.COOKING ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                      'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {getStatusLabel(order.status)}
                    </span>
                  )}
                </div>

                {currentUser?.role === UserRole.ADMIN && order.status !== OrderStatus.COMPLETED && !isManageMode && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleStatus(order.id, order.status); }}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                  >
                    {order.status === OrderStatus.PENDING ? <><ChefHat size={14}/> 开始烹饪</> : <><CheckCircle2 size={14}/> 确认送达</>}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const AdminView: React.FC<{
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
}> = ({ users, setUsers, dishes, setDishes, currentUser, setCurrentUser }) => {
  const [view, setView] = useState<'members' | 'dishes'>('members');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [newTaste, setNewTaste] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deleteUser = (id: string) => {
    if (id === currentUser?.id) return alert('不能删除自己！');
    if (window.confirm('确定要移除这位家庭成员吗？')) setUsers(prev => prev.filter(u => u.id !== id));
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (editingUser.id) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
      if (editingUser.id === currentUser?.id) setCurrentUser(editingUser);
    } else {
      setUsers(prev => [...prev, { ...editingUser, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setEditingUser(null);
  };

  const saveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;
    if (dishes.find(d => d.id === editingDish.id)) {
      setDishes(prev => prev.map(d => d.id === editingDish.id ? editingDish : d));
    } else {
      setDishes(prev => [...prev, { ...editingDish, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setEditingDish(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingDish) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingDish({ ...editingDish, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addTasteTag = () => {
    if (!newTaste.trim() || !editingDish) return;
    const tastes = editingDish.tasteOptions || [];
    if (tastes.includes(newTaste.trim())) {
      setNewTaste('');
      return;
    }
    setEditingDish({
      ...editingDish,
      tasteOptions: [...tastes, newTaste.trim()]
    });
    setNewTaste('');
  };

  const removeTasteTag = (tag: string) => {
    if (!editingDish) return;
    setEditingDish({
      ...editingDish,
      tasteOptions: (editingDish.tasteOptions || []).filter(t => t !== tag)
    });
  };

  return (
    <div className="pb-32 px-6 pt-10 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black tracking-tighter mb-8">系统管理</h1>
      <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
         <button onClick={() => setView('members')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest ${view === 'members' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>成员管理</button>
         <button onClick={() => setView('dishes')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest ${view === 'dishes' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>菜品库</button>
      </div>

      {view === 'members' ? (
        <div className="space-y-4">
           <button onClick={() => setEditingUser({ id: '', name: '', password: '123', balance: 0, houseworkCredits: 0, role: UserRole.MEMBER, avatar: `https://picsum.photos/seed/${Math.random()}/200` })} className="w-full bg-slate-900 text-white p-5 rounded-[24px] font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-slate-900/10">
              <Plus size={20} /> 添加家庭成员
           </button>
           <div className="space-y-4 pt-4">
              {users.map(u => (
                <div key={u.id} className="bg-white p-5 rounded-[32px] border border-slate-50 flex items-center gap-4 shadow-sm">
                   <img src={u.avatar} className="w-14 h-14 rounded-[20px] object-cover border-2 border-slate-50" alt={u.name} />
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-slate-800 leading-none">{u.name}</h4>
                        {u.role === UserRole.ADMIN && <ShieldCheck size={14} className="text-orange-500" />}
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${u.role === UserRole.ADMIN ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-50 text-slate-400'}`}>
                        {u.role === UserRole.ADMIN ? '管理员' : '家庭成员'}
                      </span>
                      <div className="mt-1 flex gap-2 text-[9px] font-bold text-slate-400">
                         <span>¥{u.balance}</span><span>{u.houseworkCredits}次家务</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => setEditingUser(u)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl active:bg-orange-500 active:text-white transition-all"><Edit2 size={16}/></button>
                      <button onClick={() => deleteUser(u.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl active:bg-red-500 active:text-white transition-all"><Trash2 size={16}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="space-y-6">
           <button onClick={() => setEditingDish({ id: '', name: '', description: '', price: 10, chorePrice: 1, supportsBalance: true, supportsHousework: true, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', category: '新分类', ingredients: [], steps: [], cookingTime: '15分钟', difficulty: 1, tasteOptions: [] })} className="w-full bg-slate-900 text-white p-5 rounded-[24px] font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-slate-900/10">
              <Plus size={20} /> 新增菜品
           </button>
           <div className="grid grid-cols-2 gap-4">
             {dishes.map(d => (
               <div key={d.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-50 group relative">
                  <img src={d.imageUrl} className="w-full h-24 object-cover" alt={d.name} />
                  <div className="p-3">
                    <p className="font-bold text-slate-800 text-xs truncate">{d.name}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{d.category}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => setEditingDish(d)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-600 active:scale-90 transition-transform"><Edit2 size={12}/></button>
                     <button onClick={() => setDishes(prev => prev.filter(item => item.id !== d.id))} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-red-500 active:scale-90 transition-transform"><Trash2 size={12}/></button>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

const ProfileView: React.FC<{
  currentUser: User | null;
  handleLogout: () => void;
}> = ({ currentUser, handleLogout }) => {
  if (!currentUser) return null;
  return (
    <div className="pb-32 animate-in fade-in duration-500">
      <header className="px-5 py-12 flex flex-col items-center">
         <div className="relative mb-6">
            <img src={currentUser.avatar} className="w-32 h-32 rounded-[48px] object-cover border-8 border-white shadow-2xl" alt={currentUser.name} />
         </div>
         <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentUser.name}</h2>
         <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-2 bg-orange-50 px-3 py-1 rounded-full">{currentUser.role === UserRole.ADMIN ? '管理员' : '家庭成员'}</span>
      </header>
      <div className="px-6 space-y-4">
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex flex-col gap-1">
               <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-2xl flex items-center justify-center mb-2"><Wallet size={20} /></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">账户余额</p>
               <span className="text-2xl font-black text-slate-800">¥{currentUser.balance.toFixed(1)}</span>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex flex-col gap-1">
               <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center mb-2"><WashingMachine size={20} /></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">家务点数</p>
               <span className="text-2xl font-black text-slate-800">{currentUser.houseworkCredits} 次</span>
            </div>
         </div>
         <button onClick={handleLogout} className="w-full p-6 flex items-center justify-between bg-white rounded-[32px] border border-slate-50 shadow-sm group text-red-500 active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><LogOut size={20}/></div>
               <span className="font-bold">退出登录</span>
            </div>
            <ChevronRight size={18} className="text-red-100" />
         </button>
      </div>
    </div>
  );
};

const OrderSuccessModal = () => (
  <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
     <div className="relative mb-12 animate-in zoom-in-50 duration-700">
        <div className="w-32 h-32 bg-orange-500 rounded-[48px] flex items-center justify-center text-white rotate-12 shadow-2xl shadow-orange-500/30">
           <CheckCircle2 size={72} strokeWidth={3} />
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white animate-bounce shadow-xl">
           <ChefHat size={24} />
        </div>
     </div>
     <h2 className="text-4xl font-black mb-4 tracking-tighter text-slate-900">下单成功！</h2>
     <p className="text-slate-400 font-bold text-lg leading-relaxed mb-8">大厨已收到指令，火速备菜中...<br/>请在订单页关注上菜状态</p>
     <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 animate-[progress_2.5s_linear_forwards]"></div>
     </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  // --- 数据状态 ---
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('family_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch (e) { return INITIAL_USERS; }
  });

  const [dishes, setDishes] = useState<Dish[]>(() => {
    try {
      const saved = localStorage.getItem('family_dishes');
      return saved ? JSON.parse(saved) : INITIAL_DISHES;
    } catch (e) { return INITIAL_DISHES; }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('family_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('family_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'profile' | 'admin'>('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(!currentUser);
  const [detailDish, setDetailDish] = useState<Dish | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // 初始化登录姓名
  useEffect(() => {
    if (users.length > 0 && !loginName) {
      setLoginName(users[0].name);
    }
  }, [users, loginName]);

  // 数据持久化
  useEffect(() => {
    localStorage.setItem('family_users', JSON.stringify(users));
    localStorage.setItem('family_dishes', JSON.stringify(dishes));
    localStorage.setItem('family_orders', JSON.stringify(orders));
    if (currentUser) {
      localStorage.setItem('family_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('family_current_user');
    }
  }, [users, dishes, orders, currentUser]);

  // --- 购物车统计 ---
  const cartStats = useMemo(() => {
    return cart.reduce((acc, item) => {
      const isBalance = item.selectedPaymentMethod === PaymentMethod.BALANCE;
      return {
        totalPrice: acc.totalPrice + (isBalance ? item.dish.price * item.quantity : 0),
        totalChore: acc.totalChore + (!isBalance ? (item.dish.chorePrice || 0) * item.quantity : 0),
        count: acc.count + item.quantity
      };
    }, { totalPrice: 0, totalChore: 0, count: 0 });
  }, [cart]);

  // --- 核心逻辑 ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.name === loginName && u.password === loginPass);
    if (user) {
      setCurrentUser(user);
      setIsLoginModalOpen(false);
      setLoginPass('');
    } else {
      alert('密码错误，请输入正确的家庭通行密码！');
    }
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      setCurrentUser(null);
      setIsLoginModalOpen(true);
      setCart([]);
      setActiveTab('home');
    }
  };

  const addToCart = (dish: Dish, taste?: string, note?: string) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.dish.id === dish.id && 
        item.selectedTaste === taste && 
        item.note === note
      );
      if (existing) {
        return prev.map(item => 
          (item.dish.id === dish.id && item.selectedTaste === taste && item.note === note) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      const defaultMethod = dish.supportsBalance ? PaymentMethod.BALANCE : PaymentMethod.HOUSEWORK;
      return [...prev, { 
        dish, 
        quantity: 1, 
        selectedPaymentMethod: defaultMethod, 
        selectedTaste: taste,
        note: note
      }];
    });
  };

  const updateCartQuantity = (dishId: string, taste: string | undefined, note: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.dish.id === dishId && item.selectedTaste === taste && item.note === note) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateItemPaymentMethod = (dishId: string, taste: string | undefined, note: string | undefined, method: PaymentMethod) => {
    setCart(prev => prev.map(item => 
      (item.dish.id === dishId && item.selectedTaste === taste && item.note === note) 
        ? { ...item, selectedPaymentMethod: method } 
        : item
    ));
  };

  const handleCheckout = () => {
    if (!currentUser) return;
    if (cart.length === 0) {
      alert('托盘是空的哦');
      return;
    }

    if (currentUser.balance < cartStats.totalPrice) {
      alert(`余额不足！共需 ¥${cartStats.totalPrice.toFixed(1)}，您的余额为 ¥${currentUser.balance.toFixed(1)}。`);
      return;
    }
    if (currentUser.houseworkCredits < cartStats.totalChore) {
      alert(`家务点数不足！共需 ${cartStats.totalChore} 次，您目前仅有 ${currentUser.houseworkCredits} 次。`);
      return;
    }

    const newOrders: Order[] = cart.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      dishId: item.dish.id,
      dishName: item.dish.name,
      dishImage: item.dish.imageUrl,
      quantity: item.quantity,
      paymentMethod: item.selectedPaymentMethod,
      totalCost: item.selectedPaymentMethod === PaymentMethod.BALANCE 
        ? item.dish.price * item.quantity 
        : (item.dish.chorePrice || 0) * item.quantity,
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      selectedTaste: item.selectedTaste
    }));

    const updatedUser = {
      ...currentUser,
      balance: Number((currentUser.balance - cartStats.totalPrice).toFixed(2)),
      houseworkCredits: currentUser.houseworkCredits - cartStats.totalChore
    };

    setOrders(prev => [...newOrders, ...prev]);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setCart([]);
    setIsCartOpen(false);
    setShowOrderSuccess(true);
    
    setTimeout(() => {
      setShowOrderSuccess(false);
      setActiveTab('orders');
    }, 2500);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative overflow-x-hidden">
      {activeTab === 'home' && (
        <HomeView 
          dishes={dishes} 
          currentUser={currentUser} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          setDetailDish={setDetailDish}
          cartCount={cartStats.count}
          setIsCartOpen={setIsCartOpen}
          addToCart={addToCart}
        />
      )}
      
      {activeTab === 'orders' && (
        <OrdersView 
          orders={orders} 
          currentUser={currentUser} 
          setOrders={setOrders} 
        />
      )}
      
      {activeTab === 'profile' && (
        <ProfileView 
          currentUser={currentUser} 
          handleLogout={handleLogout} 
        />
      )}
      
      {activeTab === 'admin' && currentUser?.role === UserRole.ADMIN && (
        <AdminView 
          users={users} 
          setUsers={setUsers} 
          dishes={dishes} 
          setDishes={setDishes} 
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      )}

      {detailDish && (
        <DishDetailView 
          dish={detailDish} 
          onClose={() => setDetailDish(null)} 
          addToCart={addToCart} 
        />
      )}
      
      {isCartOpen && (
        <CartModal 
          cart={cart} 
          cartStats={cartStats} 
          currentUser={currentUser} 
          setIsCartOpen={setIsCartOpen}
          updateCartQuantity={updateCartQuantity}
          updateItemPaymentMethod={updateItemPaymentMethod}
          handleCheckout={handleCheckout}
        />
      )}
      
      {showOrderSuccess && <OrderSuccessModal />}

      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col p-8 items-center justify-center animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-orange-500 rounded-[36px] flex items-center justify-center text-white mb-10 shadow-2xl rotate-6 border-[6px] border-white">
            <Utensils size={48} />
          </div>
          <h2 className="text-4xl font-black mb-1 tracking-tighter text-slate-900">家味点餐</h2>
          <p className="text-slate-400 mb-14 text-[10px] font-black tracking-[0.3em] uppercase">家庭私厨点餐系统</p>
          <form onSubmit={handleLogin} className="w-full space-y-6">
             <div className="space-y-2">
               <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1">请选择您的身份</label>
               <select value={loginName} onChange={(e) => setLoginName(e.target.value)} className="w-full p-6 bg-white rounded-[32px] border border-slate-100 outline-none focus:ring-4 ring-orange-500/10 font-black text-slate-800 shadow-sm appearance-none cursor-pointer">
                 {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1">请输入通行密码</label>
               <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-6 bg-white rounded-[32px] border border-slate-100 outline-none focus:ring-4 ring-orange-500/10 font-black tracking-[0.6em] shadow-sm transition-all" placeholder="••••" required />
             </div>
             <button type="submit" className="w-full bg-orange-500 text-white p-6 rounded-[32px] font-black text-xl shadow-2xl active:scale-[0.97] transition-all mt-6 uppercase tracking-widest">开始点餐</button>
          </form>
        </div>
      )}

      {/* 修改点：调整底部导航栏的内边距，使图标文字离屏幕边缘远一些 */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-2xl border-t border-slate-100 safe-bottom z-40 flex justify-around items-center px-8 py-4 rounded-t-[48px] shadow-[0_-20px_50px_rgba(0,0,0,0.06)]">
        {[
          { tab: 'home', icon: Home, label: '点餐' },
          { tab: 'orders', icon: ClipboardList, label: '订单' },
          { tab: 'profile', icon: UserIcon, label: '我的' },
          ...(currentUser?.role === UserRole.ADMIN ? [{ tab: 'admin', icon: Settings, label: '管理' }] : [])
        ].map(item => (
          <button 
            key={item.tab} 
            onClick={() => setActiveTab(item.tab as any)} 
            className={`flex flex-col items-center gap-1.5 transition-all relative ${activeTab === item.tab ? 'text-orange-500 scale-110' : 'text-slate-300 hover:text-slate-400 active:scale-90'}`}
          >
            <item.icon size={24} strokeWidth={activeTab === item.tab ? 3 : 2} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            {activeTab === item.tab && (
              <span className="absolute -bottom-2 w-1.5 h-1.5 bg-orange-500 rounded-full animate-in zoom-in"></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
