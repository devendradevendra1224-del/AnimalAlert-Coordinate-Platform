# AnimalAlert — AI-Powered Emergency Animal Rescue & Smart Dispatch Platform

[![Production Status](https://img.shields.io/badge/Production-Verified-emerald)](https://animalalert.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-rose)](https://animalalert.app)
[![AI Vision](https://img.shields.io/badge/Gemini_AI-Vision_Triage-amber)](https://ai.google.dev)
[![Supabase RLS](https://img.shields.io/badge/Supabase-RLS_Secured-blue)](https://supabase.com)

**AnimalAlert** is an end-to-end emergency rescue coordination platform connecting civilian reporters, verified rescuers, community volunteers, animal shelters, and veterinary hospitals in real time. Powered by Gemini Vision AI for automated injury triage and smart escalation algorithms for rapid dispatch.

---

## 🌟 Key Features & Capabilities

- 📷 **AI Animal Scanner & Triage**: Uses Gemini Vision AI to identify species, detect visible injury markers, evaluate environmental hazards, and recommend operational urgency.
- 📍 **GPS & High-Accuracy Location**: Captures exact reporter coordinates and tracks active rescuers/volunteers when on-duty with location privacy masking.
- 🧠 **Smart Escalation Dispatch**: 5-tier escalation engine automatically expands dispatch radius to nearby rescuers (L1/L2), community volunteers (L3), verified rescue organizations (L4), and admin emergency handlers (L5).
- 🚨 **Duplicate Protection**: Transaction-safe claim validation prevents multiple rescuers from accepting the same emergency. Duplicate report detection alerts users to existing nearby cases (500m / 30-min window).
- 💬 **Live Rescue Case Chat & Observations**: Real-time communication channel and photo field updates between reporters, rescuers, and volunteers.
- 🏥 **Veterinary Hospital & Shelter Discovery**: SF Bay Area emergency vet facilities and shelter capacity tracking with one-touch turn-by-turn navigation.
- 📱 **PWA & Offline Support**: Offline draft report storage with auto-sync, background push notifications, and native mobile bottom bar.
- 🔐 **Role-Based Access Control (RBAC)**: Distinct workflows for Reporter, Rescuer, Volunteer, Organization Manager, and Admin.
- 📊 **Admin Dashboard & Audit Logs**: Interactive real-time metrics, user role moderation, organization verification, and security audit logs.

---

## 🏗 System Architecture

```
[ Civilian Mobile / Web Reporter ]
             │
             ▼ (PWA / ServiceWorker / Offline Caching)
     [ React + Vite SPA ] ◄── (Tailwind CSS, Lucide Icons)
             │
      ┌──────┴─────────────────────────────────┐
      │                                        │
      ▼ (Server-Side Proxy)                    ▼ (Client DB / Realtime)
[ Express API Server ]                  [ Supabase Cloud Postgres ]
  ├── Gemini Vision AI Engine             ├── RLS Security Policies
  ├── VAPID Push Broadcasting             ├── Realtime Subscriptions
  └── Security Audit Logger               └── Storage Bucket
```

---

## ⚙️ Environment Variables Checklist

Copy `.env.example` to `.env` and fill in required keys:

```env
# Gemini API Key (Server-side Only)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Credentials
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Security Note:** Never commit `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to client-side code.

---

## 🗄 Database & Supabase Setup

1. Open your Supabase SQL Editor.
2. Run the SQL script located in `/supabase/schema.sql`.
3. The script provisions all 17 tables (`profiles`, `rescue_cases`, `rescue_updates`, `ai_assessments`, `rescuers`, `notifications`, `push_subscriptions`, `notification_preferences`, `case_observations`, `organizations`, `organization_members`, `rescue_messages`, `rescue_outcomes`, `shelters`, `foster_records`, `reports`, `audit_logs`).
4. Row Level Security (RLS) is automatically enabled on every table.

---

## 🚀 Local Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint codebase
npm run lint

# Build production bundle
npm run build
```

---

## 📄 License & Disclaimer

**Veterinary Disclaimer:** AnimalAlert provides AI-assisted visual assessment and rescue coordination. It is not a veterinary diagnostic service. AI results may be inaccurate. For serious emergencies, contact a qualified veterinarian or official animal rescue agency.
