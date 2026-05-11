-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers Table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_interaction_date TIMESTAMP WITH TIME ZONE,
    total_interactions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed'))
);

-- 2. Platforms Table
CREATE TABLE public.platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_name TEXT NOT NULL,
    platform_type TEXT NOT NULL CHECK (platform_type IN ('chatbot', 'voice_agent')),
    is_active BOOLEAN DEFAULT true,
    webhook_url TEXT,
    api_key TEXT,
    icon_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- 3. Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Chatbot Conversations Table
CREATE TABLE public.chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
    platform_type TEXT CHECK (platform_type IN ('whatsapp', 'facebook', 'instagram', 'webchat', 'telegram')),
    conversation_data JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    collected_data JSONB DEFAULT '{}'::jsonb,
    tags TEXT[],
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    first_message_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0
);

-- 5. Voice Conversations Table
CREATE TABLE public.voice_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    call_direction TEXT CHECK (call_direction IN ('incoming', 'outgoing')),
    phone_number TEXT,
    duration_seconds INTEGER DEFAULT 0,
    recording_url TEXT,
    transcript TEXT,
    summary TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    call_status TEXT CHECK (call_status IN ('answered', 'missed', 'failed', 'completed')),
    collected_data JSONB DEFAULT '{}'::jsonb,
    tags TEXT[],
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    call_started_at TIMESTAMP WITH TIME ZONE,
    call_ended_at TIMESTAMP WITH TIME ZONE
);

-- 6. Users Table (Extends Supabase Auth or Standalone)
-- Note: Supabase handles auth via auth.users. This table is for app-specific profiles.
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}'::jsonb,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Notes Table
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    conversation_id UUID, -- Can be linked to chatbot or voice conversation
    conversation_type TEXT CHECK (conversation_type IN ('chatbot', 'voice')),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    note_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('urgent', 'system', 'success', 'warning')),
    title TEXT,
    message TEXT,
    link_url TEXT,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- 9. Webhook Logs Table
CREATE TABLE public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tags Table
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Allow all for development, restrict for production)
-- FOR DEVELOPMENT ONLY: Allow public access
CREATE POLICY "Enable read access for all users" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.customers FOR UPDATE USING (true);

-- Repeat for other tables (simplified for initial setup)
CREATE POLICY "Enable read access for all users" ON public.chatbot_conversations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.chatbot_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.chatbot_conversations FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.voice_conversations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.voice_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.voice_conversations FOR UPDATE USING (true);

-- Enable Realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatbot_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- call_analytics table (used by VoiceAgent page)
CREATE TABLE public.call_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_phone TEXT,
    summary TEXT,
    category TEXT,
    duration INTEGER,
    recording_url TEXT
);

ALTER TABLE public.call_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.call_analytics FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.call_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.call_analytics FOR UPDATE USING (true);

-- urgent_callbacks view (used by Overview page)
-- Shows chatbot conversations that require urgent human callback
CREATE OR REPLACE VIEW public.urgent_callbacks AS
SELECT
    cc.id AS conversation_id,
    cc.customer_id,
    c.first_name,
    c.last_name,
    c.phone,
    NULL::TEXT AS telegram_id,
    cc.summary AS konusma_ozeti,
    cat.name AS durum,
    cat.color AS renk_kodu,
    cc.last_message_at AS son_mesaj_tarihi
FROM public.chatbot_conversations cc
LEFT JOIN public.customers c ON cc.customer_id = c.id
LEFT JOIN public.categories cat ON cc.category_id = cat.id
WHERE cc.status = 'active'
  AND cat.name = 'Geri Arama Talebi';

-- Add DELETE policies for tables that support deletion from the UI
CREATE POLICY "Enable delete access for all users" ON public.customers FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.chatbot_conversations FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.voice_conversations FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.call_analytics FOR DELETE USING (true);

-- Seed Categories
INSERT INTO public.categories (name, description, color, sort_order) VALUES
('Başarılı/Tamamlandı', 'Randevu alındı, satış gerçekleşti, sorun çözüldü', '#10B981', 1),
('Beklemede', 'Müşteri düşünüyor, geri dönüş bekliyor', '#F59E0B', 2),
('Acil Aksiyona İhtiyaç Var', 'Şikayet var, sorun çözülmedi, memnuniyetsiz', '#EF4444', 3),
('Olumsuz Sonuçlandı', 'İptal, satış olmadı, ilgilenmiyor', '#6B7280', 4),
('Geri Arama Talebi', 'İnsan ile görüşmek istiyor', '#3B82F6', 5),
('Bilgi Talebi', 'Sadece bilgi aldı, karar aşamasında değil', '#8B5CF6', 6);
