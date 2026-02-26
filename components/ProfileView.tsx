
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onManageBanks: () => void;
  onBack: () => void;
}

export const ProfileView: React.FC<Props> = ({ profile, onSave, onManageBanks, onBack }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const hasFilledBanks = profile.banks.some(b => b.bankName.trim() !== '' && b.accountNo.trim() !== '');
  const isComplete = formData.name.trim() !== '' && formData.email.trim() !== '' && formData.address.trim() !== '' && hasFilledBanks;

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-0 relative">
      {/* Save Notification */}
      {showSavedMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-bold border-2 border-emerald-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
            Profile Saved Successfully!
            {isComplete && <span className="text-emerald-100 font-medium ml-2">— Redirecting to Dashboard...</span>}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
          <p className="text-slate-500">Your professional business identity.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
        <div className="p-8 space-y-8">
          {/* Business Info Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Business Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="profileName" className="text-xs font-bold text-slate-500 uppercase">Your Name / Business Name</label>
                <input
                  id="profileName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe Consulting"
                  className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 p-3"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="profileEmail" className="text-xs font-bold text-slate-500 uppercase">Your Email</label>
                <input
                  id="profileEmail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. hello@business.com"
                  className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 p-3"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="profileAddress" className="text-xs font-bold text-slate-500 uppercase">Business Address</label>
              <textarea
                id="profileAddress"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street name, City, Postcode, Country"
                rows={3}
                className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 p-3"
              />
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Read-Only Payment Accounts Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Registered Accounts
              </h3>
              <button 
                onClick={onManageBanks}
                className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors"
              >
                Manage Accounts
              </button>
            </div>

            {!hasFilledBanks ? (
              <div className="bg-orange-50 rounded-2xl p-8 text-center border border-dashed border-orange-200">
                <p className="text-orange-700 font-medium mb-4 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  At least one account is required to activate invoices.
                </p>
                <button 
                  onClick={onManageBanks}
                  className="bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-100"
                >
                  Click here to add one
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.banks.filter(b => b.bankName.trim() !== '' || b.accountNo.trim() !== '').map((bank) => (
                  <div key={bank.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{bank.paymentMethod}</span>
                    </div>
                    <p className="font-bold text-slate-900 uppercase text-sm truncate">{bank.bankName || 'Unnamed Bank'}</p>
                    <p className="text-xs text-slate-500 font-mono truncate">{bank.accountNo || 'No Account Number'}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-2 truncate font-medium">{bank.accountName}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onBack}
            className="px-6 py-2 rounded-xl text-slate-600 font-bold hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-2 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all"
          >
            Save Profile
          </button>
        </div>
      </div>
      
      {!isComplete && (
        <div className="bg-slate-100 rounded-2xl p-4 flex items-center gap-3 text-slate-500 text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Complete all fields and add an account to return to the Hub.
        </div>
      )}
    </div>
  );
};
