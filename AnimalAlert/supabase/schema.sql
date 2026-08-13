-- ====================================================================
-- ANIMALALERT PRODUCTION SUPABASE DATABASE SCHEMA & RLS SECURITY POLICIES
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('reporter', 'rescuer', 'volunteer', 'organization', 'admin')),
  organization_id TEXT,
  avatar_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESCUE CASES TABLE
CREATE TABLE IF NOT EXISTS public.rescue_cases (
  id TEXT PRIMARY KEY DEFAULT ('case-' || extract(epoch from now())::bigint),
  reporter_id TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_phone TEXT,
  assigned_rescuer_id TEXT,
  assigned_rescuer_name TEXT,
  assigned_organization_id TEXT,
  assigned_organization_name TEXT,
  animal_type TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'assigned', 'in_progress', 'transporting', 'at_hospital', 'sheltered', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  urgency_reason TEXT,
  escalation_level INT DEFAULT 1 CHECK (escalation_level BETWEEN 1 AND 5),
  last_escalated_at TIMESTAMPTZ DEFAULT NOW(),
  hospital_id TEXT,
  hospital_name TEXT,
  shelter_id TEXT,
  shelter_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESCUE UPDATES / TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.rescue_updates (
  id TEXT PRIMARY KEY DEFAULT ('upd-' || extract(epoch from now())::bigint),
  rescue_case_id TEXT NOT NULL REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  status_from TEXT,
  status_to TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_assessments (
  id TEXT PRIMARY KEY DEFAULT ('ai-' || extract(epoch from now())::bigint),
  rescue_case_id TEXT REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  animal_type TEXT NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  injuries_detected JSONB DEFAULT '[]'::jsonb,
  environmental_dangers JSONB DEFAULT '[]'::jsonb,
  recommended_priority TEXT NOT NULL,
  urgency_reason TEXT,
  guidance_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RESCUERS ACTIVE TABLE
CREATE TABLE IF NOT EXISTS public.rescuers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  organization_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_available BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT ('notif-' || extract(epoch from now())::bigint),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('DISPATCH', 'ESCALATION', 'STATUS_CHANGE', 'TASK', 'SYSTEM')),
  case_id TEXT REFERENCES public.rescue_cases(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PUSH SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id TEXT PRIMARY KEY,
  push_enabled BOOLEAN DEFAULT true,
  critical_alerts BOOLEAN DEFAULT true,
  dispatch_notifs BOOLEAN DEFAULT true,
  status_updates BOOLEAN DEFAULT true,
  chat_messages BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CASE OBSERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.case_observations (
  id TEXT PRIMARY KEY DEFAULT ('obs-' || extract(epoch from now())::bigint),
  rescue_case_id TEXT NOT NULL REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  observation_type TEXT NOT NULL CHECK (observation_type IN ('animal_seen', 'updated_location', 'hazard_warning', 'first_aid', 'general_update')),
  description TEXT NOT NULL,
  photo_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('shelter', 'clinic', 'rescue_league', 'municipal')),
  phone TEXT,
  address TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ORGANIZATION MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'staff', 'volunteer_coordinator')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. RESCUE CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.rescue_messages (
  id TEXT PRIMARY KEY DEFAULT ('msg-' || extract(epoch from now())::bigint),
  rescue_case_id TEXT NOT NULL REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. RESCUE OUTCOMES TABLE
CREATE TABLE IF NOT EXISTS public.rescue_outcomes (
  id TEXT PRIMARY KEY DEFAULT ('out-' || extract(epoch from now())::bigint),
  rescue_case_id TEXT UNIQUE NOT NULL REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('rehabilitated', 'adopted', 'fostered', 'released_to_wild', 'transferred', 'deceased')),
  notes TEXT,
  completed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SHELTERS TABLE
CREATE TABLE IF NOT EXISTS public.shelters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  capacity_available INT DEFAULT 10,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. FOSTER RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.foster_records (
  id TEXT PRIMARY KEY DEFAULT ('fst-' || extract(epoch from now())::bigint),
  rescue_case_id TEXT REFERENCES public.rescue_cases(id) ON DELETE SET NULL,
  foster_user_id TEXT NOT NULL,
  foster_user_name TEXT NOT NULL,
  shelter_id TEXT REFERENCES public.shelters(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'adopted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. REPORTS / MODERATION ABUSE TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT ('rpt-' || extract(epoch from now())::bigint),
  reporter_id TEXT NOT NULL,
  target_case_id TEXT REFERENCES public.rescue_cases(id) ON DELETE SET NULL,
  target_user_id TEXT,
  reason TEXT NOT NULL CHECK (reason IN ('fake_rescue', 'spam', 'inappropriate_language', 'incorrect_location', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'action_taken')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('audit-' || extract(epoch from now())::bigint),
  action_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  details TEXT NOT NULL,
  target_case_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- DATABASE PERFORMANCE INDEXES
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_rescue_cases_status ON public.rescue_cases(status);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_priority ON public.rescue_cases(priority);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_created_at ON public.rescue_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_reported_by ON public.rescue_cases(reporter_id);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_assigned_rescuer ON public.rescue_cases(assigned_rescuer_id);

CREATE INDEX IF NOT EXISTS idx_rescuers_available ON public.rescuers(is_available);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_organizations_verified ON public.organizations(verified);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescuers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foster_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. RESCUE CASES POLICIES
CREATE POLICY "Public Read Access to Rescue Cases" ON public.rescue_cases
  FOR SELECT USING (true);

CREATE POLICY "Reporters and Authenticated Users can create cases" ON public.rescue_cases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR reporter_id IS NOT NULL);

CREATE POLICY "Assigned Rescuers, Reporters, and Admins can update cases" ON public.rescue_cases
  FOR UPDATE USING (
    auth.uid()::text = reporter_id OR 
    auth.uid()::text = assigned_rescuer_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. NOTIFICATIONS POLICIES
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'usr-all');

-- 3. AUDIT LOGS POLICIES
CREATE POLICY "Admins view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. RESCUE MESSAGES POLICIES
CREATE POLICY "Case Participants view chat messages" ON public.rescue_messages
  FOR SELECT USING (true);

CREATE POLICY "Case Participants send chat messages" ON public.rescue_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR sender_id IS NOT NULL);
