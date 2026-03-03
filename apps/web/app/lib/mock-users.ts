// Mock database for users (since database limit exceeded)
// In production, this should be replaced with real database

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

const users: User[] = [];

export const mockUsersDB = {
  async createUser(email: string, password: string, name: string, phone?: string) {
    // Check if user exists
    const existing = users.find((u) => u.email === email);
    if (existing) {
      throw new Error('المستخدم موجود بالفعل');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      password, // In production, this should be hashed
      name,
      phone,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    return newUser;
  },

  async findUserByEmail(email: string) {
    return users.find((u) => u.email === email);
  },

  async validateUser(email: string, password: string) {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    return user;
  },

  async updatePassword(email: string, newPassword: string) {
    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }
    user.password = newPassword;
    return user;
  },
};
