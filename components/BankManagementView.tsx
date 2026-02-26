
import React, { useState } from 'react';
import { BankDetail } from '../types';
import { createNewBank } from '../utils/invoice';

interface Props {
  banks: BankDetail[];
  onSave: (banks: BankDetail[]) => void;
  onBack: () => void;
}

export const BankManagementView: React.FC<Props> = ({ banks, onSave, onBack }) => {
  const [localBanks, setLocalBanks] = useState<BankDetail[]>(banks);
  const [expandedId, setExpandedId] = useState<string | null>(
    banks.length > 0 ? banks[0].id : null
  );

  const handleBankChange = (id: string, field: keyof BankDetail, value: string) => {
    setLocalBanks(prev => prev.map(bank => 
      bank.id === id ? { ...bank, [field]: value } : bank
    ));
  };

  const addBank = () => {
    const newBank = createNewBank();
    setLocalBanks(prev => [...prev, newBank]);
    setExpandedId(newBank.id);
  };

  const removeBank = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent toggling the accordion when clicking delete
    setLocalBanks(prev => prev.filter(b => b.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-0">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Accounts</h1>
            <p className="text-slate-500 text-sm">Organize your payment destinations.</p>
          </div>
        </div>
        <button 
          onClick={addBank}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Add Account
        </button>
      </div>

      <div className="space-y-4">
        {localBanks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
             <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
             </div>
             <h3 className="text-lg font-bold text-slate-900">No bank accounts yet</h3>
             <p className="text-slate-500 max-w-xs mx-auto mb-6 text-sm">Start by adding your first payment account to show on invoices.</p>
             <button onClick={addBank} className="text-indigo-600 font-bold hover:underline">Add one now</button>
          </div>
        ) : (
          <div className="space-y-3">
            {localBanks.map((bank, index) => {
              const isExpanded = expandedId === bank.id;
              return (
                <div key={bank.id} className={`bg-white rounded-2xl border transition-all duration-200 ${isExpanded ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}>
                  {/* Accordion Header */}
                  <button 
                    onClick={() => toggleExpand(bank.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        <span className="font-black text-sm">{index + 1}</span>
                      </div>
                      <div className="truncate">
                        <p className={`font-bold transition-colors ${isExpanded ? 'text-indigo-600' : 'text-slate-700'}`}>
                          {bank.bankName || 'New Account'}
                        </p>
                        <p className="text-xs text-slate-400 font-mono truncate">{bank.accountNo || 'No account number set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => removeBank(e, bank.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete account"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1">
                          <label htmlFor={`paymentMethod-${bank.id}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</label>
                          <input
                            id={`paymentMethod-${bank.id}`}
                            value={bank.paymentMethod}
                            onChange={(e) => handleBankChange(bank.id, 'paymentMethod', e.target.value)}
                            placeholder="e.g. Bank Transfer"
                            className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`bankName-${bank.id}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</label>
                          <input
                            id={`bankName-${bank.id}`}
                            value={bank.bankName}
                            onChange={(e) => handleBankChange(bank.id, 'bankName', e.target.value)}
                            placeholder="e.g. Maybank, PayPal, etc."
                            className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm font-bold uppercase"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`accountName-${bank.id}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Holder Name</label>
                          <input
                            id={`accountName-${bank.id}`}
                            value={bank.accountName}
                            onChange={(e) => handleBankChange(bank.id, 'accountName', e.target.value)}
                            placeholder="Name as it appears in bank"
                            className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm font-medium uppercase"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`accountNo-${bank.id}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number</label>
                          <input
                            id={`accountNo-${bank.id}`}
                            value={bank.accountNo}
                            onChange={(e) => handleBankChange(bank.id, 'accountNo', e.target.value)}
                            placeholder="e.g. 1234567890"
                            className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
           <button 
            onClick={onBack}
            className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(localBanks)}
            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all"
          >
            Update & Save Accounts
          </button>
        </div>
      </div>
    </div>
  );
};
