// Mock data for chats and messages

export type MessageType = 'text' | 'image' | 'file' | 'price_offer' | 'project' | 'job';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

export interface PriceOffer {
  id: string;
  service: string;
  price: number;
  duration: string;
  currency: string;
  status: 'pending' | 'accepted' | 'negotiating' | 'rejected';
}

export interface Project {
  id: string;
  title: string;
  budget: number;
  deadline: string;
  currency: string;
}

export interface Job {
  id: string;
  title: string;
  salary: number;
  type: 'full-time' | 'part-time' | 'freelance';
  currency: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  priceOffer?: PriceOffer;
  project?: Project;
  job?: Job;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  name: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

export const mockUsers: User[] = [
  { id: '1', name: 'أحمد محمد', avatar: '👨', status: 'online' },
  { id: '2', name: 'فاطمة علي', avatar: '👩', status: 'online' },
  { id: '3', name: 'محمود حسن', avatar: '👨', status: 'offline' },
  { id: '4', name: 'سارة إبراهيم', avatar: '👩', status: 'away' },
  { id: '5', name: 'خالد عمر', avatar: '👨', status: 'online' },
];

export const mockChats: Chat[] = [
  {
    id: '1',
    type: 'individual',
    name: 'أحمد محمد',
    avatar: '👨',
    participants: [mockUsers[0]],
    unreadCount: 2,
    lastMessage: {
      id: '1',
      chatId: '1',
      senderId: '1',
      senderName: 'أحمد محمد',
      type: 'text',
      content: 'هل يمكنك البدء بالمشروع الأسبوع القادم؟',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
    },
  },
  {
    id: '2',
    type: 'individual',
    name: 'فاطمة علي',
    avatar: '👩',
    participants: [mockUsers[1]],
    unreadCount: 0,
    lastMessage: {
      id: '2',
      chatId: '2',
      senderId: '2',
      senderName: 'فاطمة علي',
      type: 'text',
      content: 'شكراً جزيلاً على المساعدة',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: true,
    },
  },
  {
    id: '3',
    type: 'group',
    name: 'مشروع تصميم المتجر',
    avatar: '💼',
    participants: [mockUsers[0], mockUsers[2], mockUsers[4]],
    unreadCount: 5,
    lastMessage: {
      id: '3',
      chatId: '3',
      senderId: '3',
      senderName: 'محمود حسن',
      type: 'text',
      content: 'تم إنهاء التصميم الأولي',
      timestamp: new Date(Date.now() - 60 * 60000),
      read: false,
    },
  },
  {
    id: '4',
    type: 'individual',
    name: 'سارة إبراهيم',
    avatar: '👩',
    participants: [mockUsers[3]],
    unreadCount: 0,
    lastMessage: {
      id: '4',
      chatId: '4',
      senderId: 'me',
      senderName: 'أنا',
      type: 'text',
      content: 'حسناً، سأرسل لك الملفات غداً',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: true,
    },
  },
];

export const mockMessages: { [chatId: string]: Message[] } = {
  '1': [
    {
      id: 'm1',
      chatId: '1',
      senderId: '1',
      senderName: 'أحمد محمد',
      type: 'text',
      content: 'مرحباً، أحتاج إلى تصميم موقع إلكتروني',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: true,
    },
    {
      id: 'm2',
      chatId: '1',
      senderId: 'me',
      senderName: 'أنا',
      type: 'text',
      content: 'أهلاً وسهلاً، يسعدني مساعدتك. ما هي التفاصيل؟',
      timestamp: new Date(Date.now() - 2 * 60 * 60000 + 60000),
      read: true,
    },
    {
      id: 'm3',
      chatId: '1',
      senderId: '1',
      senderName: 'أحمد محمد',
      type: 'text',
      content: 'أريد موقعاً لعرض منتجاتي مع نظام دفع إلكتروني',
      timestamp: new Date(Date.now() - 2 * 60 * 60000 + 120000),
      read: true,
    },
    {
      id: 'm4',
      chatId: '1',
      senderId: 'me',
      senderName: 'أنا',
      type: 'price_offer',
      priceOffer: {
        id: 'po1',
        service: 'تصميم موقع متجر إلكتروني',
        price: 300,
        duration: '7 أيام',
        currency: '$',
        status: 'pending',
      },
      timestamp: new Date(Date.now() - 10 * 60000),
      read: true,
    },
    {
      id: 'm5',
      chatId: '1',
      senderId: '1',
      senderName: 'أحمد محمد',
      type: 'text',
      content: 'هل يمكنك البدء بالمشروع الأسبوع القادم؟',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
    },
  ],
  '2': [
    {
      id: 'm6',
      chatId: '2',
      senderId: '2',
      senderName: 'فاطمة علي',
      type: 'text',
      content: 'هل لديك خبرة في تطوير تطبيقات الجوال؟',
      timestamp: new Date(Date.now() - 60 * 60000),
      read: true,
    },
    {
      id: 'm7',
      chatId: '2',
      senderId: 'me',
      senderName: 'أنا',
      type: 'text',
      content: 'نعم، لدي خبرة 5 سنوات في React Native',
      timestamp: new Date(Date.now() - 55 * 60000),
      read: true,
    },
    {
      id: 'm8',
      chatId: '2',
      senderId: 'me',
      senderName: 'أنا',
      type: 'project',
      project: {
        id: 'proj1',
        title: 'تطوير تطبيق iOS/Android',
        budget: 1500,
        deadline: '30 يوم',
        currency: '$',
      },
      timestamp: new Date(Date.now() - 40 * 60000),
      read: true,
    },
    {
      id: 'm9',
      chatId: '2',
      senderId: '2',
      senderName: 'فاطمة علي',
      type: 'text',
      content: 'شكراً جزيلاً على المساعدة',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: true,
    },
  ],
  '3': [
    {
      id: 'm10',
      chatId: '3',
      senderId: '3',
      senderName: 'محمود حسن',
      type: 'text',
      content: 'متى نبدأ بتنفيذ المشروع؟',
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
      read: true,
    },
    {
      id: 'm11',
      chatId: '3',
      senderId: '5',
      senderName: 'خالد عمر',
      type: 'text',
      content: 'يمكننا البدء غداً',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: true,
    },
    {
      id: 'm12',
      chatId: '3',
      senderId: 'me',
      senderName: 'أنا',
      type: 'image',
      imageUrl: 'https://via.placeholder.com/300x200',
      content: 'هذا التصميم المقترح',
      timestamp: new Date(Date.now() - 90 * 60000),
      read: true,
    },
    {
      id: 'm13',
      chatId: '3',
      senderId: '3',
      senderName: 'محمود حسن',
      type: 'text',
      content: 'تم إنهاء التصميم الأولي',
      timestamp: new Date(Date.now() - 60 * 60000),
      read: false,
    },
  ],
  '4': [
    {
      id: 'm14',
      chatId: '4',
      senderId: '4',
      senderName: 'سارة إبراهيم',
      type: 'job',
      job: {
        id: 'job1',
        title: 'مطور Full Stack',
        salary: 3000,
        type: 'full-time',
        currency: '$',
      },
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
      read: true,
    },
    {
      id: 'm15',
      chatId: '4',
      senderId: 'me',
      senderName: 'أنا',
      type: 'text',
      content: 'الوظيفة مثيرة للاهتمام، أريد معرفة المزيد',
      timestamp: new Date(Date.now() - 2.5 * 60 * 60000),
      read: true,
    },
    {
      id: 'm16',
      chatId: '4',
      senderId: 'me',
      senderName: 'أنا',
      type: 'text',
      content: 'حسناً، سأرسل لك الملفات غداً',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: true,
    },
  ],
};
