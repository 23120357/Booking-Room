'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { User, Shield, Bell, Palette, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { useTranslation } from '@/context/LanguageContext';

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Form states for Account
  const [fullName, setFullName] = useState('');
  
  // Form states for Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
    }
  }, [user]);

  const tabs = [
    { id: 'account', name: t.admin.settingsPage.tabAccount, icon: User },
    { id: 'security', name: t.admin.settingsPage.tabSecurity, icon: Shield },
    { id: 'notifications', name: t.admin.settingsPage.tabNotif, icon: Bell },
    { id: 'appearance', name: t.admin.settingsPage.tabAppearance, icon: Palette },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      if (activeTab === 'account') {
        // Validation
        if (!fullName.trim()) {
          window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t.admin.settingsPage.nameEmpty, type: 'error' } }));
          setLoading(false);
          return;
        }

        await authService.updateProfile({
          fullName,
          gender: user?.gender || 'OTHER', // Preserve existing gender
        });
        await refreshProfile();
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t.admin.settingsPage.updateProfileSuccess, type: 'success' } }));
      } 
      else if (activeTab === 'security') {
        // Validation
        if (!currentPassword || !newPassword) {
          window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t.admin.settingsPage.passFieldsEmpty, type: 'error' } }));
          setLoading(false);
          return;
        }
        if (newPassword.length < 6) {
          window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t.admin.settingsPage.newPassShort, type: 'error' } }));
          setLoading(false);
          return;
        }

        await authService.changePassword({
          currentPassword,
          newPassword,
          confirmPassword: newPassword, // auto-confirm since UI only has 1 new password field
        });
        setCurrentPassword('');
        setNewPassword('');
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t.admin.settingsPage.changePassSuccess, type: 'success' } }));
      }
      else {
        // Notification / Appearance mock save
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t.admin.settingsPage.saveConfigSuccess, type: 'success' } }));
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || t.admin.settingsPage.saveError;
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: errorMsg, type: 'error' } }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative">
      <AdminHeader
        title={t.admin.settingsPage.title}
        description={t.admin.settingsPage.description}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Horizontal Tabs Header */}
        <div className="bg-white border-b border-slate-200 px-6 md:px-12 pt-2 sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <nav className="flex space-x-8 overflow-x-auto custom-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-booking-primary text-booking-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="p-6 md:p-12">
          <main className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)]">
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{t.admin.settingsPage.accountTitle}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t.admin.settingsPage.accountDesc}</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.admin.settingsPage.fullNameLabel}</label>
                        <input 
                          type="text" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t.admin.settingsPage.fullNamePlaceholder}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-booking-primary/20 focus:border-booking-primary transition-all text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.admin.settingsPage.emailLabel}</label>
                        <input 
                          type="email" 
                          disabled
                          value={user?.email || ''} 
                          className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed transition-all text-sm" 
                        />
                        <p className="text-xs text-slate-400 mt-1.5">{t.admin.settingsPage.emailNote}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{t.admin.settingsPage.securityTitle}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t.admin.settingsPage.securityDesc}</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.admin.settingsPage.currentPassLabel}</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-booking-primary/20 focus:border-booking-primary transition-all text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.admin.settingsPage.newPassLabel}</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-booking-primary/20 focus:border-booking-primary transition-all text-sm" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{t.admin.settingsPage.notifTitle}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t.admin.settingsPage.notifDesc}</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900">{t.admin.settingsPage.newListingNotif}</p>
                        <p className="text-sm text-slate-500">{t.admin.settingsPage.newListingDesc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-booking-primary" />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900">{t.admin.settingsPage.complaintNotif}</p>
                        <p className="text-sm text-slate-500">{t.admin.settingsPage.complaintDesc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-booking-primary" />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{t.admin.settingsPage.appearanceTitle}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t.admin.settingsPage.appearanceDesc}</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="border-2 border-booking-primary rounded-xl p-4 cursor-pointer bg-slate-50"
                    >
                      <div className="w-full h-24 bg-white border border-slate-200 rounded-lg shadow-sm mb-3"></div>
                      <p className="text-center font-medium text-booking-primary text-sm">{t.admin.settingsPage.lightMode}</p>
                    </div>
                    <div 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: t.admin.settingsPage.darkModeWIP, type: 'error' } }));
                      }}
                      className="border-2 border-transparent hover:border-slate-300 rounded-xl p-4 cursor-pointer bg-slate-900 transition-colors"
                    >
                      <div className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg shadow-sm mb-3"></div>
                      <p className="text-center font-medium text-slate-300 text-sm">{t.admin.settingsPage.darkMode}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-auto pt-8 flex justify-end border-t border-slate-100">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm ${loading ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-booking-primary hover:bg-booking-primary/90 text-white shadow-booking-primary/20 hover:shadow-booking-primary/40 hover:-translate-y-0.5'}`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{loading ? t.admin.settingsPage.savingBtn : t.admin.settingsPage.saveBtn}</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

