
import { User, Dish, UserRole } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: '爸爸',
    password: 'admin',
    balance: 500,
    houseworkCredits: 10,
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/seed/papa/200'
  },
  {
    id: '2',
    name: '妈妈',
    password: '123',
    balance: 1000,
    houseworkCredits: 50,
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/seed/mama/200'
  },
  {
    id: '3',
    name: '宝贝',
    password: '123',
    balance: 50,
    houseworkCredits: 2,
    role: UserRole.MEMBER,
    avatar: 'https://picsum.photos/seed/baby/200'
  }
];

export const INITIAL_DISHES: Dish[] = [
  {
    id: 'd1',
    name: '红烧肉',
    description: '经典的家常硬菜，色泽金黄，肥而不腻。',
    price: 35,
    chorePrice: 2,
    supportsBalance: true,
    supportsHousework: true,
    imageUrl: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=400&h=300&auto=format&fit=crop',
    category: '热菜',
    ingredients: ['五花肉 500g', '生抽', '老抽', '冰糖', '八角', '桂皮', '生姜'],
    steps: [
      '五花肉切块，冷水下锅焯水去腥。',
      '锅内少许油，下五花肉煎至微焦出油。',
      '放入冰糖炒出糖色，加入生抽老抽。',
      '加入热水没过肉块，放入香料中小火慢炖45分钟。',
      '最后大火收汁，至汤汁浓稠即可。'
    ],
    cookingTime: '60分钟',
    difficulty: 3,
    tasteOptions: ['常规口味', '少糖少油', '加辣版', '软烂一点']
  },
  {
    id: 'd2',
    name: '清蒸鱼',
    description: '保持原汁原味，鱼肉鲜嫩细腻。',
    price: 45,
    chorePrice: 3,
    supportsBalance: true,
    supportsHousework: true,
    imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=400&h=300&auto=format&fit=crop',
    category: '热菜',
    ingredients: ['新鲜鲈鱼 1条', '大葱', '姜丝', '蒸鱼豉油', '热油'],
    steps: [
      '鱼身两面切花刀，涂抹料酒腌制。',
      '盘底垫姜片，鱼身上铺姜丝葱段。',
      '水开后入锅大火蒸8-10分钟。',
      '倒掉盘中多余水分，淋上蒸鱼豉油。',
      '泼上一层滚烫的热油激发出香气。'
    ],
    cookingTime: '15分钟',
    difficulty: 2,
    tasteOptions: ['常规', '少盐', '不要葱姜', '多淋点油']
  },
  {
    id: 'd3',
    name: '蒜蓉油麦菜',
    description: '清淡爽口，营养丰富。',
    price: 15,
    chorePrice: 1,
    supportsBalance: true,
    supportsHousework: true,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=300&auto=format&fit=crop',
    category: '素菜',
    ingredients: ['油麦菜', '大蒜 5瓣', '蚝油', '盐'],
    steps: [
      '油麦菜洗净切段，大蒜拍碎切末。',
      '热锅凉油，下蒜末爆香。',
      '下油麦菜大火快速翻炒至断生。',
      '加入适量蚝油和盐，炒匀后立即出锅。'
    ],
    cookingTime: '5分钟',
    difficulty: 1,
    tasteOptions: ['多蒜蓉', '不要蚝油', '微辣', '少盐清淡']
  },
  {
    id: 'd4',
    name: '可口可乐',
    description: '冰凉畅快，解腻必备。',
    price: 3,
    chorePrice: 0,
    supportsBalance: true,
    supportsHousework: false,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&h=300&auto=format&fit=crop',
    category: '饮品',
    ingredients: ['罐装可乐 330ml', '冰块'],
    steps: [
      '打开冰箱，取出冰镇可乐。',
      '倒入装满冰块的杯中饮用。'
    ],
    cookingTime: '1分钟',
    difficulty: 1,
    tasteOptions: ['常温', '加冰', '多冰', '去冰']
  }
];
