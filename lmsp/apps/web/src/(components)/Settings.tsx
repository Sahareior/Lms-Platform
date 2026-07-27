import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe } from 'lucide-react';

const settingsGroups = [
  {
    icon: <User size={18} />,
    title: 'Profile',
    description: 'Manage your personal information and preferences',
  },
  {
    icon: <Bell size={18} />,
    title: 'Notifications',
    description: 'Configure push notifications and email alerts',
  },
  {
    icon: <Shield size={18} />,
    title: 'Privacy & Security',
    description: 'Control your account security and data privacy',
  },
  {
    icon: <Palette size={18} />,
    title: 'Appearance',
    description: 'Customize theme, colors, and display options',
  },
  {
    icon: <Globe size={18} />,
    title: 'Language & Region',
    description: 'Set your preferred language and regional settings',
  },
];

const Settings = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a2332] flex items-center justify-center">
            <SettingsIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account and application preferences</p>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsGroups.map((group, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-[#1a2332] group-hover:text-white transition-colors">
                {group.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{group.title}</h3>
                <p className="text-sm text-gray-400">{group.description}</p>
              </div>
              <div className="text-gray-300 group-hover:text-gray-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: 'Md. Rahim Uddin' },
              { label: 'Email', value: 'rahim.uddin@example.com' },
              { label: 'Exam Target', value: 'BCS 47th' },
              { label: 'Member Since', value: 'January 2024' },
            ].map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-400 font-medium mb-0.5">{item.label}</div>
                <div className="text-sm font-semibold text-gray-800">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
