
import React, { useState } from 'react';
import { FinancialData, FinancialBankBalance, FinancialAsset, FinancialExpense, Invoice } from '../types';
import { formatCurrency, calculateTotal, createNewFinancialBankBalance, createNewAsset, createNewExpense } from '../utils/invoice';

interface Props {
  financialData: FinancialData;
  invoices: Invoice[];
  onSave: (data: FinancialData) => void;
  onBack: () => void;
}

const ASSET_CATEGORIES = ['Property', 'Equipment', 'Vehicle', 'Investment', 'Other'];
const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Salaries', 'Software', 'Marketing', 'Travel', 'Supplies', 'Insurance', 'Other'];

export const FinancialTrackingView: React.FC<Props> = ({ financialData, invoices, onSave, onBack }) => {
  const [localData, setLocalData] = useState<FinancialData>(financialData);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const currency = localData.currency;
  const totalBankBalance = localData.bankBalances.reduce((sum, b) => sum + (b.balance || 0), 0);
  const totalAssets = localData.assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const totalExpenses = localData.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalRevenue = invoices.reduce((sum, inv) => sum + calculateTotal(inv.items, inv.taxRate), 0);
  const netCashFlow = totalRevenue - totalExpenses;

  // Bank Balance CRUD
  const addBankBalance = () => {
    setLocalData(prev => ({ ...prev, bankBalances: [...prev.bankBalances, createNewFinancialBankBalance()] }));
  };
  const updateBankBalance = (id: string, field: keyof FinancialBankBalance, value: string | number) => {
    setLocalData(prev => ({
      ...prev,
      bankBalances: prev.bankBalances.map(b => b.id === id ? { ...b, [field]: value } : b),
    }));
  };
  const removeBankBalance = (id: string) => {
    setLocalData(prev => ({ ...prev, bankBalances: prev.bankBalances.filter(b => b.id !== id) }));
  };

  // Asset CRUD
  const addAsset = () => {
    setLocalData(prev => ({ ...prev, assets: [...prev.assets, createNewAsset()] }));
  };
  const updateAsset = (id: string, field: keyof FinancialAsset, value: string | number) => {
    setLocalData(prev => ({
      ...prev,
      assets: prev.assets.map(a => a.id === id ? { ...a, [field]: value } : a),
    }));
  };
  const removeAsset = (id: string) => {
    setLocalData(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) }));
  };

  // Expense CRUD
  const addExpense = () => {
    setLocalData(prev => ({ ...prev, expenses: [...prev.expenses, createNewExpense()] }));
  };
  const updateExpense = (id: string, field: keyof FinancialExpense, value: string | number) => {
    setLocalData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };
  const removeExpense = (id: string) => {
    setLocalData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setLocalData(prev => ({ ...prev, currency: newCurrency }));
  };

  const handleSave = () => {
    onSave({ ...localData, lastUpdated: Date.now() });
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 sm:pb-0 relative">
      {/* Save toast */}
      {showSavedMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
          Financial data saved!
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-primary-50 hover:bg-primary-100 flex items-center justify-center text-primary-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-primary-900">Financial Tracking</h1>
          <p className="text-primary-400 text-sm">Monitor your financial health</p>
        </div>
        <select
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="bg-primary-50 text-primary-700 font-bold text-sm px-4 py-2 rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="MYR">MYR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      <div className="space-y-8">
        {/* Financial Overview Hero */}
        <section className="bg-gradient-to-br from-primary-600 to-accent-700 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 tracking-tight">Financial Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest mb-1">Bank Balances</p>
                <p className="text-xl sm:text-2xl font-black">{formatCurrency(totalBankBalance, currency)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest mb-1">Total Assets</p>
                <p className="text-xl sm:text-2xl font-black">{formatCurrency(totalAssets, currency)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest mb-1">Total Expenses</p>
                <p className="text-xl sm:text-2xl font-black">{formatCurrency(totalExpenses, currency)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest mb-1">Net Cash Flow</p>
                <p className={`text-xl sm:text-2xl font-black ${netCashFlow < 0 ? 'text-red-300' : ''}`}>
                  {formatCurrency(netCashFlow, currency)}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
        </section>

        {/* Bank Balances */}
        <section className="bg-white rounded-3xl shadow-xl border border-primary-100 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                Bank Balances
              </h3>
              <button onClick={addBankBalance} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors">
                + Add Account
              </button>
            </div>

            {localData.bankBalances.length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No bank accounts tracked yet.</p>
                <button onClick={addBankBalance} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="space-y-3">
                {localData.bankBalances.map((entry) => (
                  <div key={entry.id} className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Bank Name</label>
                        <input
                          value={entry.bankName}
                          onChange={(e) => updateBankBalance(entry.id, 'bankName', e.target.value)}
                          placeholder="e.g. Maybank"
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Account Label</label>
                        <input
                          value={entry.accountLabel}
                          onChange={(e) => updateBankBalance(entry.id, 'accountLabel', e.target.value)}
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
                            onChange={(e) => updateBankBalance(entry.id, 'balance', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full rounded-xl border border-primary-200 p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <button onClick={() => removeBankBalance(entry.id)} className="p-2.5 text-primary-300 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Assets */}
        <section className="bg-white rounded-3xl shadow-xl border border-primary-100 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                Assets
              </h3>
              <button onClick={addAsset} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors">
                + Add Asset
              </button>
            </div>

            {localData.assets.length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No assets tracked yet.</p>
                <button onClick={addAsset} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="space-y-3">
                {localData.assets.map((asset) => (
                  <div key={asset.id} className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Asset Name</label>
                        <input
                          value={asset.name}
                          onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                          placeholder="e.g. Office Equipment"
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Category</label>
                        <select
                          value={asset.category}
                          onChange={(e) => updateAsset(asset.id, 'category', e.target.value)}
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                        >
                          {ASSET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Value</label>
                          <input
                            type="number"
                            value={asset.value || ''}
                            onChange={(e) => updateAsset(asset.id, 'value', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full rounded-xl border border-primary-200 p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <button onClick={() => removeAsset(asset.id)} className="p-2.5 text-primary-300 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Expenses */}
        <section className="bg-white rounded-3xl shadow-xl border border-primary-100 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                Expenses
              </h3>
              <button onClick={addExpense} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors">
                + Add Expense
              </button>
            </div>

            {localData.expenses.length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No expenses tracked yet.</p>
                <button onClick={addExpense} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="space-y-3">
                {localData.expenses.map((expense) => (
                  <div key={expense.id} className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Description</label>
                        <input
                          value={expense.description}
                          onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                          placeholder="e.g. Office Rent"
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Category</label>
                        <select
                          value={expense.category}
                          onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                        >
                          {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Date</label>
                        <input
                          type="date"
                          value={expense.date}
                          onChange={(e) => updateExpense(expense.id, 'date', e.target.value)}
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Amount</label>
                          <input
                            type="number"
                            value={expense.amount || ''}
                            onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full rounded-xl border border-primary-200 p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <button onClick={() => removeExpense(expense.id)} className="p-2.5 text-primary-300 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer Actions */}
        <div className="hidden sm:flex justify-end gap-3 pt-4">
          <button onClick={onBack} className="px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100">
            Save Changes
          </button>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-primary-100 p-4 flex gap-3 z-50">
        <button onClick={onBack} className="flex-1 px-4 py-3 rounded-xl text-primary-600 font-bold bg-primary-50">
          Cancel
        </button>
        <button onClick={handleSave} className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-xl font-bold">
          Save Changes
        </button>
      </div>
    </div>
  );
};
