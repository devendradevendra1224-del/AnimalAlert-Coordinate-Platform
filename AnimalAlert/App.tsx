import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, RescueCase, AIAnalysisResult } from './types';
import { getCurrentUser, DEMO_REPORTER } from './services/authService';
import { fetchRescueCases, createRescueCase } from './services/rescueService';
import { startRescuerLocationTracking, stopRescuerLocationTracking } from './services/rescuerLocationTracker';

import { Navbar } from './components/Navbar';
import { DemoUserSwitcher } from './components/DemoUserSwitcher';
import { CriticalAlertBanner } from './components/CriticalAlertBanner';
import { EmergencyHotlinesModal } from './components/EmergencyHotlinesModal';
import { RescueReportForm } from './components/RescueReportForm';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { VolunteerProfileView } from './components/VolunteerProfileView';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { RescueDetailsView } from './components/RescueDetailsView';
import { PublicRescueView } from './components/PublicRescueView';
import { InteractiveRescueMap } from './components/InteractiveRescueMap';
import { VetHospitalFinder } from './components/VetHospitalFinder';
import { SheltersView } from './components/SheltersView';
import { AdminDashboardView } from './components/AdminDashboardView';

import { PwaInstallBanner } from './components/PwaInstallBanner';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { MobileCameraScanner } from './components/MobileCameraScanner';
import { PrivacyAndTermsModal } from './components/PrivacyAndTermsModal';
import { SystemHealthCheckModal } from './components/SystemHealthCheckModal';

import { ShieldAlert, MapPin, Camera, HandHeart, CheckCircle2, Building2, HeartPulse, ArrowRight } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser() || DEMO_REPORTER);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('case-1001');
  const [cases, setCases] = useState<RescueCase[]>([]);

  const [showHotlines, setShowHotlines] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showCameraScannerModal, setShowCameraScannerModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    // Location tracking for active rescuers/volunteers
    if (currentUser && (currentUser.role === 'rescuer' || currentUser.role === 'volunteer') && currentUser.is_available) {
      startRescuerLocationTracking(currentUser, (lat, lng) => {
        console.log(`Updated rescuer coordinates: ${lat}, ${lng}`);
      });
    } else {
      stopRescuerLocationTracking();
    }

    return () => {
      stopRescuerLocationTracking();
    };
  }, [currentUser]);

  const loadCases = async () => {
    const data = await fetchRescueCases();
    setCases(data);
  };

  const handleNavigate = (view: AppView, caseId?: string) => {
    if (caseId) setSelectedCaseId(caseId);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCameraScanCompleted = async (result: AIAnalysisResult, photoBase64: string) => {
    setShowCameraScannerModal(false);
    // Create new case from mobile camera scan
    const newCase = await createRescueCase(
      {
        reporter_id: currentUser?.id || 'usr-anon',
        reporter_name: currentUser?.full_name || 'Anonymous Mobile Reporter',
        reporter_phone: currentUser?.phone,
        animal_type: result.animal_type || 'Unknown Animal',
        description: `Mobile Scanner AI Scan: ${result.injuries_detected.join(', ') || 'Possible distress'}. Hazards: ${result.environmental_dangers.join(', ')}.`,
        photo_url: photoBase64,
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'Market St & 10th St, San Francisco, CA',
        priority: result.recommended_priority || 'HIGH',
        urgency_reason: result.urgency_reason || 'Mobile AI Scanner direct dispatch',
      },
      currentUser
    );

    loadCases();
    handleNavigate('case-details', newCase.id);
  };

  const criticalCase = cases.find(
    (c) => c.priority === 'CRITICAL' && c.status !== 'completed' && c.status !== 'cancelled'
  ) || null;

  const currentSelectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-rose-500 selection:text-white pb-16 sm:pb-0">
      {/* DEMO USER ROLE SWITCHER HEADER */}
      <DemoUserSwitcher
        currentUser={currentUser}
        onUserChanged={(updatedUser) => {
          setCurrentUser(updatedUser);
          loadCases();
        }}
      />

      {/* NAVBAR */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenHotlines={() => setShowHotlines(true)}
        onOpenNotificationsModal={() => setShowNotificationModal(true)}
        onOpenHealthCheck={() => setShowHealthCheckModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
      />

      {/* CRITICAL EMERGENCY BANNER */}
      <CriticalAlertBanner
        criticalCase={criticalCase}
        onViewCase={(id) => handleNavigate('case-details', id)}
        onHelpCase={(id) => handleNavigate('case-details', id)}
      />

      {/* EMERGENCY HOTLINES MODAL */}
      {showHotlines && <EmergencyHotlinesModal onClose={() => setShowHotlines(false)} />}

      {/* PRIVACY & TERMS / MEDICAL DISCLAIMER MODAL */}
      {showPrivacyModal && <PrivacyAndTermsModal onClose={() => setShowPrivacyModal(false)} />}

      {/* PRODUCTION HEALTH & DIAGNOSTIC MODAL */}
      {showHealthCheckModal && <SystemHealthCheckModal onClose={() => setShowHealthCheckModal(false)} />}

      {/* PUSH NOTIFICATION SETTINGS MODAL */}
      {showNotificationModal && (
        <NotificationCenterModal
          currentUser={currentUser}
          onClose={() => setShowNotificationModal(false)}
        />
      )}

      {/* MOBILE CAMERA SCANNER MODAL */}
      {showCameraScannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <MobileCameraScanner
              onScanCompleted={handleCameraScanCompleted}
              onCancel={() => setShowCameraScannerModal(false)}
            />
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        {/* PWA INSTALLATION BANNER */}
        <PwaInstallBanner />

        {/* OFFLINE NETWORK STATUS & DRAFTS BANNER */}
        <OfflineSyncBanner onReportSubmitted={loadCases} />

        {/* VIEW: HOME / REPORT */}
        {(currentView === 'home' || currentView === 'report') && (
          <div className="space-y-6">
            {/* MOBILE QUICK ACTION HERO BUTTONS FOR PHONE SCREEN */}
            <div className="sm:hidden grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setShowCameraScannerModal(true)}
                className="p-3.5 bg-rose-600 text-white rounded-2xl shadow-md flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>SCAN ANIMAL</span>
              </button>

              <button
                onClick={() => handleNavigate('report')}
                className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-md flex items-center justify-center space-x-2"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>REPORT ALERT</span>
              </button>

              <button
                onClick={() => setShowNotificationModal(true)}
                className="p-3 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-center space-x-2"
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>PUSH ALERTS</span>
              </button>

              <button
                onClick={() => handleNavigate('live-map')}
                className="p-3 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-center space-x-2"
              >
                <MapPin className="w-4 h-4 text-sky-500" />
                <span>RESCUE MAP</span>
              </button>
            </div>

            <RescueReportForm
              currentUser={currentUser}
              onReportCreated={(newCase) => {
                loadCases();
                handleNavigate('case-details', newCase.id);
              }}
              onViewCase={(id) => handleNavigate('case-details', id)}
            />
          </div>
        )}

        {/* VIEW: LIVE MAP */}
        {currentView === 'live-map' && currentUser && (
          <InteractiveRescueMap
            currentUser={currentUser}
            onViewCase={(id) => handleNavigate('case-details', id)}
          />
        )}

        {/* VIEW: VOLUNTEER DASHBOARD */}
        {currentView === 'volunteer-dashboard' && currentUser && (
          <VolunteerDashboard
            currentUser={currentUser}
            onViewCase={(id) => handleNavigate('case-details', id)}
            onOpenProfile={() => handleNavigate('volunteer-profile')}
          />
        )}

        {/* VIEW: VOLUNTEER PROFILE */}
        {currentView === 'volunteer-profile' && currentUser && (
          <VolunteerProfileView
            currentUser={currentUser}
            onProfileUpdated={(updated) => setCurrentUser(updated)}
          />
        )}

        {/* VIEW: RESCUER DASHBOARD */}
        {currentView === 'rescuer-dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center space-x-2 text-sky-200 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Rescuer Operations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Rescuer Active Missions
              </h1>
              <p className="text-sm text-sky-100 mt-1 font-medium">
                Emergency dispatch, location navigation, and veterinary clinic intake transfer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-0.5 rounded">CASE #{c.id}</span>
                    <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      {c.priority}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">{c.animal_type}</h4>
                  <p className="text-xs text-slate-600 font-medium">{c.description}</p>

                  <button
                    onClick={() => handleNavigate('case-details', c.id)}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    DISPATCH & MANAGE MISSION
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: ORGANIZATION DASHBOARD */}
        {currentView === 'organization-dashboard' && currentUser && (
          <OrganizationDashboard
            currentUser={currentUser}
            onViewCase={(id) => handleNavigate('case-details', id)}
          />
        )}

        {/* VIEW: CASE DETAILS */}
        {currentView === 'case-details' && currentUser && currentSelectedCase && (
          <RescueDetailsView
            caseId={currentSelectedCase.id}
            currentUser={currentUser}
            rescueCase={currentSelectedCase}
            onBack={() => handleNavigate('home')}
            onOpenPublicLink={(id) => handleNavigate('public-rescue', id)}
            onCaseUpdated={loadCases}
          />
        )}

        {/* VIEW: PUBLIC RESCUE */}
        {currentView === 'public-rescue' && currentSelectedCase && (
          <PublicRescueView
            rescueCase={currentSelectedCase}
            onBack={() => handleNavigate('home')}
          />
        )}

        {/* VIEW: VET FINDER */}
        {currentView === 'vet-finder' && <VetHospitalFinder />}

        {/* VIEW: SHELTERS */}
        {currentView === 'shelters' && <SheltersView />}

        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === 'admin-dashboard' && currentUser && (
          <AdminDashboardView
            currentUser={currentUser}
            onViewCase={(id) => handleNavigate('case-details', id)}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenScanner={() => setShowCameraScannerModal(true)}
        onOpenAlertsModal={() => setShowNotificationModal(true)}
      />

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-medium mt-auto mb-16 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 font-sans">AnimalAlert Emergency Platform</span>
            <span className="font-mono text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold">
              Production Verified
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-bold text-slate-600">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-rose-600 transition-colors"
            >
              Privacy & Disclaimer
            </button>
            <span>•</span>
            <button
              onClick={() => setShowHealthCheckModal(true)}
              className="hover:text-rose-600 transition-colors flex items-center space-x-1"
            >
              <span>System Health</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <span>•</span>
            <button
              onClick={() => setShowHotlines(true)}
              className="hover:text-rose-600 transition-colors"
            >
              Hotlines
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

