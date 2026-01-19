export enum PaymentMethod {
  BALANCE = 'BALANCE',
  HOUSEWORK = 'HOUSEWORK'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface User {
  id: string;
  name: string;
  password?: string;
  balance: number;
  houseworkCredits: number;
  role: UserRole;
  avatar?: string;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number; 
  chorePrice: number; 
  supportsBalance: boolean;
  supportsHousework: boolean;
  imageUrl: string;
  category: string;
  ingredients: string[]; 
  steps: string[]; 
  cookingTime: string; 
  difficulty: number; 
  tasteOptions?: string[]; // 可供选择的口味
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  selectedPaymentMethod: PaymentMethod;
  selectedTaste?: string; // 用户选择的口味
  note?: string; // 新增：订单备注
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  dishId: string;
  dishName: string;
  dishImage: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  totalCost: number;
  status: OrderStatus;
  timestamp: number;
  selectedTaste?: string; // 订单中体现的口味
  note?: string; // 新增：订单备注
}
