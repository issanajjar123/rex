-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('freelancer', 'client')),
  profile_image TEXT,
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- إنشاء جدول المحادثات
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- إنشاء جدول الرسائل
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'offer', 'file')),
  offer_id INTEGER,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- إنشاء جدول المشاريع
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  duration TEXT,
  skills TEXT[],
  client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- إنشاء جدول الوظائف
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  salary NUMERIC(10,2) NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance')),
  skills TEXT[] NOT NULL,
  location TEXT,
  company_name TEXT,
  company_logo TEXT,
  employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- إنشاء جدول عروض الأسعار
CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER,
  service_title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  deliverables TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج مستخدمين تجريبيين
INSERT INTO users (email, password_hash, full_name, user_type, bio, skills) VALUES
('ahmed@example.com', '$2a$10$mock.hash.for.testing', 'أحمد محمد', 'freelancer', 'مطور ويب متخصص في React و Node.js', ARRAY['React', 'Node.js', 'TypeScript']),
('sara@example.com', '$2a$10$mock.hash.for.testing', 'سارة أحمد', 'client', 'صاحبة مشروع ناشئ', ARRAY[]::TEXT[]),
('mohammed@example.com', '$2a$10$mock.hash.for.testing', 'محمد علي', 'freelancer', 'مصمم UI/UX', ARRAY['Figma', 'Adobe XD', 'UI Design'])
ON CONFLICT (email) DO NOTHING;

-- إدراج وظائف تجريبية
INSERT INTO jobs (title, description, salary, employment_type, skills, location, company_name, employer_id) VALUES
('مطور React Native', 'نبحث عن مطور React Native لتطوير تطبيق موبايل', 5000, 'full-time', ARRAY['React Native', 'JavaScript', 'Mobile'], 'الرياض، السعودية', 'شركة التقنية', 2),
('مصمم جرافيك', 'مطلوب مصمم جرافيك مبدع', 3500, 'part-time', ARRAY['Photoshop', 'Illustrator', 'Design'], 'جدة، السعودية', 'وكالة الإبداع', 2)
ON CONFLICT DO NOTHING;

-- إدراج مشاريع تجريبية
INSERT INTO projects (title, description, budget_min, budget_max, duration, skills, client_id) VALUES
('تصميم موقع إلكتروني', 'أحتاج تصميم موقع احترافي لشركتي', 2000, 5000, '30 يوم', ARRAY['Web Design', 'UI/UX'], 2),
('تطبيق جوال', 'تطوير تطبيق جوال للتجارة الإلكترونية', 10000, 15000, '60 يوم', ARRAY['React Native', 'Node.js'], 2)
ON CONFLICT DO NOTHING;
