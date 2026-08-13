# ANIMALALERT: AI-POWERED REAL-TIME EMERGENCY ANIMAL RESCUE COORDINATION PLATFORM
### Final-Year Academic Project & Technical Portfolio Documentation

---

## 📄 Abstract

Urban stray animal injuries and wildlife distress reports often suffer from delayed response times, fragmented communication, and lack of visual triage prior to rescuer dispatch. **AnimalAlert** addresses these challenges by introducing an end-to-end web and mobile progressive web application (PWA) that leverages Gemini Vision AI for automated visual injury triage, GPS location tagging, and an automated 5-tier escalation engine. The system coordinates civilian reporters, verified rescuers, community volunteers, animal shelters, and veterinary emergency hospitals through a unified real-time dashboard protected by Supabase Row-Level Security (RLS).

---

## 1. Introduction & Problem Statement

### 1.1 Problem Statement
- **Delayed Incident Response**: Traditional animal rescue reporting relies on phone calls to local shelters, leading to dispatch delays and loss of real-time GPS positioning.
- **Unassessed Medical Urgency**: Rescuers arrive without prior knowledge of animal species, visible injuries, or environmental hazards (e.g., traffic, electrical lines).
- **Duplicate Reports & Race Conditions**: Multiple citizens report the same stray animal, or multiple rescuers accept the same case simultaneously without atomic state management.
- **Poor Coordination**: Lack of centralized communication between reporters on scene, field rescuers, and receiving veterinary hospitals.

### 1.2 Proposed System Solution
AnimalAlert resolves these issues by pairing instant AI-assisted computer vision triage with real-time geospatial dispatch:
1. **Instant Camera Scanning**: Citizens snap a photo to receive an immediate AI-assisted visual assessment (species, possible distress, hazards).
2. **GPS Tagging & Duplicate Shield**: Captures exact coordinates and alerts users to existing nearby reports within a 500m radius.
3. **Smart Escalation Pipeline**: Progressively alerts nearby rescuers (L1/L2), community volunteers (L3), verified organizations (L4), and system admins (L5).
4. **Atomic Rescue Claiming**: Ensures duplicate claim protection so only one rescuer accepts a given emergency case.
5. **Veterinary & Shelter Integration**: Direct turn-by-turn routing to nearby emergency clinics and shelter capacity tracking.

---

## 2. System Architecture & Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANIMALALERT PLATFORM                            │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│  REPORTER MODULE │  RESCUER MODULE  │ VOLUNTEER MODULE │ ADMIN MODULE  │
├──────────────────┴──────────────────┴──────────────────┴───────────────┤
│                         PROGRESSIVE WEB APP (PWA)                      │
│                  ServiceWorker Caching & Push Notifications           │
├────────────────────────────────────────────────────────────────────────┤
│                           EXPRESS / NODE API                           │
│                 Gemini Vision AI • Audit Log • VAPID Push              │
├────────────────────────────────────────────────────────────────────────┤
│                           SUPABASE POSTGRES DB                         │
│                    Row-Level Security (RLS) & Realtime                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Functional Modules
1. **AI Vision Triage Module**: Sends compressed base64 images to Gemini Vision API for structured JSON extraction (`animal_type`, `injuries_detected`, `environmental_dangers`, `recommended_priority`).
2. **Geospatial & GPS Dispatch Module**: Calculates Haversine distances to filter nearby active rescuers and emergency veterinary hospitals.
3. **Smart Escalation Module**: Background timers evaluate response age and escalate unassigned critical cases to higher authority levels.
4. **Offline Sync & PWA Module**: Saves offline report drafts to local storage and syncs automatically when internet connectivity restores.
5. **Real-time Case Chat & Observations Module**: Multi-user messaging channel allowing field volunteers to attach notes and photos.

---

## 3. Database Schema Design (17 Tables)

1. `profiles`: User roles, contact details, and availability flags.
2. `rescue_cases`: Core incident records (status, coordinates, priority, assigned rescuer/hospital).
3. `rescue_updates`: Audit log of status transitions.
4. `ai_assessments`: Raw AI triage outputs and confidence scores.
5. `rescuers`: Real-time location and availability status of field rescuers.
6. `notifications`: User alert logs.
7. `push_subscriptions`: Web Push endpoint keys.
8. `notification_preferences`: Toggle settings for alert channels.
9. `case_observations`: Field updates submitted by volunteers.
10. `organizations`: Verified rescue shelters and humane societies.
11. `organization_members`: Organization staff and managers.
12. `rescue_messages`: In-app chat messages per rescue case.
13. `rescue_outcomes`: Post-rescue resolution logs (rehabilitated, adopted, released).
14. `shelters`: Shelter facilities and bed availability.
15. `foster_records`: Foster parent matching and dates.
16. `reports`: Moderation abuse flags.
17. `audit_logs`: Administrative activity logs.

---

## 4. User Roles & Workflow Scenarios

### Scenario 1: Citizen Reporter
1. Accesses web app or installs PWA.
2. Snaps photo of injured animal.
3. Receives AI-assisted visual assessment (`Dog`, `CRITICAL priority`, `Near road traffic`).
4. Confirms location via GPS and submits rescue alert.
5. Monitors real-time status and chats with assigned rescuer.

### Scenario 2: On-Duty Rescuer
1. Toggles "Available for Dispatch" and shares location.
2. Receives push notification for nearby Level 1 emergency.
3. Opens case details and clicks "Accept Rescue" (atomic transaction check prevents duplicate claims).
4. Follows live map navigation to animal location.
5. Updates status to "Transporting" and selects nearest SF SPCA Veterinary Hospital.
6. Completes rescue and logs outcome.

### Scenario 3: Admin & Moderation
1. Views live system metrics (active rescues, resolution rates, average response time).
2. Monitors smart escalation levels on active cases.
3. Verifies new rescue organizations and reviews audit logs.
4. Runs live System Health Diagnostics.

---

## 5. System Health Check & Security Audit Results

| Diagnostic Category | Component Checked | Status |
| :--- | :--- | :---: |
| **Identity & Access** | Role-Based Auth (Reporter, Rescuer, Volunteer, Org, Admin) | **PASS** |
| **Database & RLS** | Supabase Postgres & 17 Table RLS Policies | **PASS** |
| **AI Intelligence** | Server-side Gemini Vision Triage Engine | **PASS** |
| **Geolocation** | High-Accuracy Browser GPS API | **PASS** |
| **Mapping** | Interactive Rescue Map Canvas & Tiles | **PASS** |
| **Messaging** | Realtime Subscription Listener | **PASS** |
| **Alerts** | Service Worker Web Push Engine & In-app Fallback | **PASS** |
| **Mobile & PWA** | Standalone Installation & Local Offline Draft Store | **PASS** |
| **Directory** | SF Emergency Vet & Shelter Indexes | **PASS** |
| **Security** | API Secret Protection & Sanitized Uploads | **PASS** |

---

## 💼 Job Portfolio Resume Summary

> **AnimalAlert — AI-Powered Real-Time Emergency Rescue Platform**
> Developed a full-stack, PWA-enabled emergency animal rescue coordination system using TypeScript, React 18, Tailwind CSS, Express, and Supabase. Features computer vision triage via Gemini API, high-accuracy GPS tracking, a 5-tier automated dispatch escalation engine, atomic duplicate claim protection, turn-by-turn veterinary hospital discovery, Web Push notifications, offline draft caching, and role-based access control (RBAC).
