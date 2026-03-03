
import React, { useState } from 'react';
import { FinancialData, FinancialBankBalance } from '../types';
import { formatCurrency, createNewFinancialBankBalance } from '../utils/invoice';

interface Props {
  financialData: FinancialData;
  onSave: (data: FinancialData) => void;
  onBack: () => void;
}

export const EditBankBalancesView: React.FC<Props> = ({ financialData, onSave, onBack }) => {
  const [balances, setBalances] = useState<FinancialBankBalance[]>(financialData.bankBalances);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const currency = financialData.currency;

  const addEntry = () => {
    setBalances(prev => [...prev, createNewFinancialBankBalance()]);
  };

  const updateEntry = (id: string, field: keyof FinancialBankBalance, value: string | number) => {
    setBalances(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeEntry = (id: string) => {
    setBalances(prev => prev.filter(b => b.id !== id));
  };

  const handleSave = () => {
    onSave({ ...financialData, bankBalances: balances, lastUpdated: Date.now() });
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const total = balances.reduce((sum, b) => sum + (b.balance || 0), 0);

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-0 relative">
      {showSavedMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
          Bank balances saved!
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-primary-50 hover:bg-primary-100 flex items-center justify-center text-primary-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-primary-900">Bank Balances</h1>
          <p className="text-primary-400 text-sm">Total: {formatCurrency(total, currency)}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-primary-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex justify-end">
            <button onClick={addEntry} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors">
              + Add Account
            </button>
          </div>

          {balances.length === 0 ? (
            <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
              <p className="text-primary-400 font-medium">No bank accounts tracked yet.</p>
              <button onClick={addEntry} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
            </div>
          ) : (
            <div className="space-y-3">
              {balances.map((entry) => (
                <div key={entry.id} className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Bank Name</label>
                      <input
                        value={entry.bankName}
                        onChange={(e) => updateEntry(entry.id, 'bankName', e.target.value)}
                        placeholder="e.g. Maybank"
                        className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Account Label</label>
                      <input
                        value={entry.accountLabel}
                        onChange={(e) => updateEntry(entry.id, 'accountLabel', e.target.value)}
                        placeholder="e.g. Business Checking"
                        className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Balance</label>
                        <input
                          type="number"
                          value={entry.balance || ''}
                          onChange={(e) => updateEntry(entry.id, 'balance', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <button onClick={() => removeEntry(entry.id)} className="p-2.5 text-primary-300 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-primary-50 border-t border-primary-100 flex justify-end gap-3">
          <button onClick={onBack} className="px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100">
            Save Changes
          </button>
        </div>
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-primary-100 p-4 flex gap-3 z-50">
        <button onClick={onBack} className="flex-1 px-4 py-3 rounded-xl text-primary-600 font-bold bg-primary-50">Cancel</button>
        <button onClick={handleSave} className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-xl font-bold">Save Changes</button>
      </div>
    </div>
  );
};
