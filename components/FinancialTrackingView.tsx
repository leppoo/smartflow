
import React, { useState, useMemo } from 'react';
import { FinancialData, Invoice, FinancialBankBalance, FinancialAsset, FinancialExpense } from '../types';
import { formatCurrency, calculateTotal, createNewFinancialBankBalance, createNewAsset, createNewExpense } from '../utils/invoice';
import { Modal } from './Modal';
import { EditLiabilitiesView } from './EditLiabilitiesView';
import { ExpensesHistoryView } from './ExpensesHistoryView';

const deleteButtonStyle = `
  .delete-icon-btn {
    transition: box-shadow 300ms ease-in-out, color 300ms ease-in-out, transform 300ms ease-in-out, opacity 300ms ease-in-out;
    border-right: none;
  }
  .delete-icon-btn:hover {
    box-shadow: 0 0 40px 40px rgba(239, 68, 68, 0.8) inset;
    color: #fff;
  }
`;

interface Props {
  financialData: FinancialData;
  invoices: Invoice[];
  onBack: () => void;
  onSave: (data: FinancialData) => void;
}

type EditModal = 'liabilities' | null;
type PageView = 'main' | 'expensesHistory';
type DeleteConfirmType = { type: 'bank' | 'asset' | 'expense'; id: string; name: string } | null;

export const FinancialTrackingView: React.FC<Props> = ({ financialData, invoices, onBack, onSave }) => {
  const [activeModal, setActiveModal] = useState<EditModal>(null);
  const [currentPage, setCurrentPage] = useState<PageView>('main');
  const [bankBalances, setBankBalances] = useState<FinancialBankBalance[]>(financialData.bankBalances);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [showBankSavedMessage, setShowBankSavedMessage] = useState(false);
  const [assets, setAssets] = useState<FinancialAsset[]>(financialData.assets);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [showAssetSavedMessage, setShowAssetSavedMessage] = useState(false);
  const [expenses, setExpenses] = useState<FinancialExpense[]>(financialData.expenses);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showExpenseSavedMessage, setShowExpenseSavedMessage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmType>(null);

  const currency = financialData.currency;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7); // Get YYYY-MM
  
  // Get current month name (e.g., "March", "April")
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  // Filter expenses: only current month's expenses for the main view
  const todayExpenses = useMemo(() => {
    return expenses.filter(e => {
      const expenseMonth = e.date.substring(0, 7); // Get YYYY-MM
      return expenseMonth === currentMonth;
    });
  }, [expenses, currentMonth]);

  // Count past month expenses (expenses from months before current month)
  const pastExpensesCount = useMemo(() => {
    return expenses.filter(e => {
      const expenseMonth = e.date.substring(0, 7); // Get YYYY-MM
      return expenseMonth < currentMonth;
    }).length;
  }, [expenses, currentMonth]);

  const totalBankBalance = bankBalances.reduce((sum, b) => sum + (b.balance || 0), 0);
  const totalAssets = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalLiabilities = (financialData.liabilities || []).reduce((sum, l) => sum + ((l.totalAmount || 0) - (l.amountPaid || 0)), 0);
  const totalRevenue = invoices.reduce((sum, inv) => sum + calculateTotal(inv.items, inv.taxRate), 0);
  const netCashFlow = totalRevenue - totalExpenses;

  // Bank Balance handlers
  const addBankBalance = () => {
    const newEntry = createNewFinancialBankBalance();
    setBankBalances(prev => [...prev, newEntry]);
    setEditingBankId(newEntry.id);
  };

  const updateBankBalance = (id: string, field: keyof FinancialBankBalance, value: string | number) => {
    setBankBalances(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBankBalance = (id: string) => {
    setBankBalances(prev => {
      const updated = prev.filter(b => b.id !== id);
      // Auto-save after deletion
      onSave({ ...financialData, bankBalances: updated, lastUpdated: Date.now() });
      setShowBankSavedMessage(true);
      setTimeout(() => setShowBankSavedMessage(false), 3000);
      return updated;
    });
    if (editingBankId === id) setEditingBankId(null);
  };

  const saveBankBalances = () => {
    onSave({ ...financialData, bankBalances, lastUpdated: Date.now() });
    setShowBankSavedMessage(true);
    setTimeout(() => setShowBankSavedMessage(false), 3000);
  };

  const editingBankEntry = bankBalances.find(b => b.id === editingBankId);

  // Asset handlers
  const addAsset = () => {
    const newAsset = createNewAsset();
    setAssets(prev => [...prev, newAsset]);
    setEditingAssetId(newAsset.id);
  };

  const updateAsset = (id: string, field: keyof FinancialAsset, value: string | number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAsset = (id: string) => {
    setAssets(prev => {
      const updated = prev.filter(a => a.id !== id);
      // Auto-save after deletion
      onSave({ ...financialData, assets: updated, lastUpdated: Date.now() });
      setShowAssetSavedMessage(true);
      setTimeout(() => setShowAssetSavedMessage(false), 3000);
      return updated;
    });
    if (editingAssetId === id) setEditingAssetId(null);
  };

  const saveAssets = () => {
    onSave({ ...financialData, assets, lastUpdated: Date.now() });
    setShowAssetSavedMessage(true);
    setTimeout(() => setShowAssetSavedMessage(false), 3000);
  };

  const editingAssetEntry = assets.find(a => a.id === editingAssetId);

  // Expense handlers
  const addExpense = () => {
    const newExpense = createNewExpense();
    setExpenses(prev => [...prev, newExpense]);
    setEditingExpenseId(newExpense.id);
  };

  const updateExpense = (id: string, field: keyof FinancialExpense, value: string | number) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== id);
      // Auto-save after deletion
      onSave({ ...financialData, expenses: updated, lastUpdated: Date.now() });
      setShowExpenseSavedMessage(true);
      setTimeout(() => setShowExpenseSavedMessage(false), 3000);
      return updated;
    });
    if (editingExpenseId === id) setEditingExpenseId(null);
  };

  const saveExpenses = () => {
    onSave({ ...financialData, expenses, lastUpdated: Date.now() });
    setShowExpenseSavedMessage(true);
    setTimeout(() => setShowExpenseSavedMessage(false), 3000);
  };

  const editingExpenseEntry = expenses.find(e => e.id === editingExpenseId);
  if (currentPage === 'expensesHistory') {
    return (
      <ExpensesHistoryView
        expenses={financialData.expenses}
        currency={currency}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  return (                
    <div className="max-w-4xl mx-auto pb-24 sm:pb-0 relative">
      <style>{deleteButtonStyle}</style>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-primary-50 hover:bg-primary-100 flex items-center justify-center text-primary-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-primary-900">Financial Tracking</h1>
          <p className="text-primary-400 text-sm">Monitor your financial health</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Financial Overview Hero */}
        <section className="bg-gradient-to-br from-primary-600 to-accent-700 rounded-[2.5rem] p-8 sm:p-11 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 tracking-tight">Financial Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border-2 border-white/40 ring-1 ring-white/20 min-w-0">
                <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">Savings / Bank Balances</p>
                <p className="text-base sm:text-xl font-black truncate">{formatCurrency(totalBankBalance, currency)}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border-2 border-white/40 ring-1 ring-white/20 min-w-0">
                <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">Liabilities</p>
                <p className={`text-base sm:text-xl font-black truncate ${totalLiabilities > 0 ? 'text-red-300' : ''}`}>
                  {formatCurrency(totalLiabilities, currency)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-0">
                <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest mb-1">Total Assets</p>
                <p className="text-base sm:text-xl font-black truncate">{formatCurrency(totalAssets, currency)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-0">
                <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest mb-1">Total Expenses</p>
                <p className="text-base sm:text-xl font-black truncate">{formatCurrency(totalExpenses, currency)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-0">
                <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest mb-1">Net Cash Flow</p>
                <p className={`text-base sm:text-xl font-black truncate ${netCashFlow < 0 ? 'text-red-300' : ''}`}>
                  {formatCurrency(netCashFlow, currency)}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
        </section>

        {/* Bank Accounts Overview */}
        <section className="bg-white rounded-3xl shadow-xl border border-primary-100 overflow-hidden">
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                Bank Balances
              </h3>
              <button onClick={addBankBalance} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                Add Account
              </button>
            </div>

            {bankBalances.length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No bank accounts tracked yet.</p>
                <button onClick={addBankBalance} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bankBalances.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setEditingBankId(bank.id)}
                    className="relative bg-white rounded-2xl p-5 border border-primary-100 hover:border-primary-300 hover:shadow-md transition-all text-left group overflow-hidden"
                  >
                    {/* Edit Icon - Top Right */}
                    <div className="absolute top-3 right-3 p-2 text-primary-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </div>

                    {/* Card Content */}
                    <div className="pr-8">
                      <p className="font-bold text-primary-900 truncate text-base">{bank.bankName || 'Unnamed Bank'}</p>
                      <p className="text-xs text-primary-400 truncate mt-2">{bank.accountLabel || 'No label'}</p>
                      <p className="text-sm font-bold text-primary-600 mt-3">{bank.balance ? formatCurrency(bank.balance, currency) : 'No balance'}</p>
                    </div>

                    {/* Delete Button - Bottom Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ type: 'bank', id: bank.id, name: bank.bankName || 'Unnamed Bank' });
                      }}
                      className="absolute bottom-3 right-3 p-2 text-primary-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete account"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </button>
                ))}
              </div>
            )}

            {showBankSavedMessage && (
              <div className="flex justify-center py-2">
                <div className="bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Saved!
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Assets Overview */}
        <section className="bg-white rounded-3xl shadow-xl border border-primary-100 overflow-hidden">
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                Assets
              </h3>
              <button onClick={addAsset} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                Add Asset
              </button>
            </div>

            {assets.length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No assets tracked yet.</p>
                <button onClick={addAsset} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="space-y-2">
                {assets.map((asset) => (
                  <div key={asset.id} className="relative bg-primary-50/50 rounded-xl py-4 px-4 pr-0 border border-primary-100 hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-2 group overflow-hidden">
                    {/* Clickable Row - Left/Center */}
                    <button
                      onClick={() => setEditingAssetId(asset.id)}
                      className="flex-1 text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-primary-900 truncate">{asset.name || 'Unnamed Asset'}</p>
                        <p className="text-xs text-primary-400">{asset.category}</p>
                      </div>
                    </button>

                    {/* Amount - Center */}
                    <p className="text-lg font-black text-primary-700 whitespace-nowrap">{formatCurrency(asset.value || 0, currency)}</p>

                    {/* Action Icon - Slides In From Right on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ type: 'asset', id: asset.id, name: asset.name || 'Unnamed Asset' });
                      }}
                      className="delete-icon-btn p-3 text-red-400 border border-red-400 bg-transparent rounded-l-lg transform group-hover:translate-x-0 group-hover:opacity-100 translate-x-full opacity-0"
                      title="Delete asset"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAssetSavedMessage && (
              <div className="flex justify-center py-2">
                <div className="bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Saved!
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Expenses Overview */}
        <section className="bg-white rounded-3xl shadow-xl border border-primary-100 overflow-hidden">
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  Expenses ({currentMonthName})
                </h3>
                {pastExpensesCount > 0 && (
                  <p className="text-xs text-primary-400 mt-1">{pastExpensesCount} past month{pastExpensesCount !== 1 ? 's' : ''} in history</p>
                )}
              </div>
              <div className="flex gap-2">
                {pastExpensesCount > 0 && (
                  <button
                    onClick={() => setCurrentPage('expensesHistory')}
                    className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                  </button>
                )}
                <button onClick={addExpense} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                  Add Expense
                </button>
              </div>
            </div>

            {todayExpenses.length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No expenses tracked for this month.</p>
                <button onClick={addExpense} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayExpenses.map((expense) => (
                  <div key={expense.id} className="relative bg-primary-50/50 rounded-xl py-4 px-4 pr-0 border border-primary-100 hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-2 group overflow-hidden">
                    {/* Clickable Row - Left/Center */}
                    <button
                      onClick={() => setEditingExpenseId(expense.id)}
                      className="flex-1 text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-primary-900 truncate">{expense.description || 'Unnamed Expense'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-primary-400">{expense.category}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(expense.expenseType || 'Fixed') === 'Fixed' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                            {expense.expenseType || 'Fixed'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Amount - Center */}
                    <p className="text-lg font-black text-primary-700 whitespace-nowrap">{formatCurrency(expense.amount || 0, currency)}</p>

                    {/* Action Icon - Slides In From Right on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ type: 'expense', id: expense.id, name: expense.description || 'Unnamed Expense' });
                      }}
                      className="delete-icon-btn p-3 text-red-400 border border-red-400 bg-transparent rounded-l-lg transform group-hover:translate-x-0 group-hover:opacity-100 translate-x-full opacity-0"
                      title="Delete expense"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showExpenseSavedMessage && (
              <div className="flex justify-center py-2">
                <div className="bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Saved!
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Liabilities Overview */}
        <section className="bg-white rounded-3xl shadow-xl border border-primary-100 overflow-hidden">
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/></svg>
                Liabilities
              </h3>
              <button onClick={() => setActiveModal('liabilities')} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>

            {(financialData.liabilities || []).length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No liabilities tracked yet.</p>
                <button onClick={() => setActiveModal('liabilities')} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="space-y-2">
                {financialData.liabilities.map((liability) => {
                  const remaining = (liability.totalAmount || 0) - (liability.amountPaid || 0);
                  const paidPercent = liability.totalAmount > 0
                    ? Math.round(((liability.amountPaid || 0) / liability.totalAmount) * 100)
                    : 0;
                  return (
                    <div key={liability.id} className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-primary-900 truncate">{liability.name || 'Unnamed'}</p>
                          <p className="text-xs text-primary-400">{liability.type}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-black text-red-600">{formatCurrency(remaining, currency)}</p>
                          <p className="text-[10px] text-primary-400">of {formatCurrency(liability.totalAmount || 0, currency)}</p>
                        </div>
                      </div>
                      <div className="w-full bg-primary-100 rounded-full h-1.5">
                        <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${paidPercent}%` }}></div>
                      </div>
                      <p className="text-[10px] text-primary-400 mt-1">{paidPercent}% paid</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Edit Modal for Bank Balance */}
      {editingBankEntry && (
        <Modal
          isOpen={!!editingBankId}
          onClose={() => setEditingBankId(null)}
          title="Edit Bank Account"
          subtitle={editingBankEntry.bankName}
        >
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Bank Name</label>
              <input
                value={editingBankEntry.bankName}
                onChange={(e) => updateBankBalance(editingBankEntry.id, 'bankName', e.target.value)}
                placeholder="e.g. Maybank"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Account Label</label>
              <input
                value={editingBankEntry.accountLabel}
                onChange={(e) => updateBankBalance(editingBankEntry.id, 'accountLabel', e.target.value)}
                placeholder="e.g. Business Checking"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Balance</label>
              <input
                type="number"
                value={editingBankEntry.balance || ''}
                onChange={(e) => updateBankBalance(editingBankEntry.id, 'balance', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="p-6 bg-primary-50 border-t border-primary-100 flex justify-end gap-3">
            <button
              onClick={() => setEditingBankId(null)}
              className="px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                saveBankBalances();
                setEditingBankId(null);
              }}
              className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal for Assets */}
      {editingAssetEntry && (
        <Modal
          isOpen={!!editingAssetId}
          onClose={() => setEditingAssetId(null)}
          title="Edit Asset"
          subtitle={editingAssetEntry.name}
        >
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Asset Name</label>
              <input
                value={editingAssetEntry.name}
                onChange={(e) => updateAsset(editingAssetEntry.id, 'name', e.target.value)}
                placeholder="e.g. Office Equipment"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Category</label>
              <input
                value={editingAssetEntry.category}
                onChange={(e) => updateAsset(editingAssetEntry.id, 'category', e.target.value)}
                placeholder="e.g. Property, Equipment"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Value</label>
              <input
                type="number"
                value={editingAssetEntry.value || ''}
                onChange={(e) => updateAsset(editingAssetEntry.id, 'value', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="p-6 bg-primary-50 border-t border-primary-100 flex justify-end gap-3">
            <button
              onClick={() => setEditingAssetId(null)}
              className="px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                saveAssets();
                setEditingAssetId(null);
              }}
              className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal for Expenses */}
      {editingExpenseEntry && (
        <Modal
          isOpen={!!editingExpenseId}
          onClose={() => setEditingExpenseId(null)}
          title="Edit Expense"
          subtitle={editingExpenseEntry.description}
        >
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Description</label>
              <input
                value={editingExpenseEntry.description}
                onChange={(e) => updateExpense(editingExpenseEntry.id, 'description', e.target.value)}
                placeholder="e.g. Office Rent"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Category</label>
              <input
                value={editingExpenseEntry.category}
                onChange={(e) => updateExpense(editingExpenseEntry.id, 'category', e.target.value)}
                placeholder="e.g. Rent, Utilities"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Amount</label>
              <input
                type="number"
                value={editingExpenseEntry.amount || ''}
                onChange={(e) => updateExpense(editingExpenseEntry.id, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Type</label>
              <select
                value={editingExpenseEntry.expenseType || 'Fixed'}
                onChange={(e) => updateExpense(editingExpenseEntry.id, 'expenseType', e.target.value)}
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="Fixed">Fixed</option>
                <option value="Variable">Variable</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={editingExpenseEntry.date}
                onChange={(e) => updateExpense(editingExpenseEntry.id, 'date', e.target.value)}
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="p-6 bg-primary-50 border-t border-primary-100 flex justify-end gap-3">
            <button
              onClick={() => setEditingExpenseId(null)}
              className="px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                saveExpenses();
                setEditingExpenseId(null);
              }}
              className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={activeModal === 'liabilities'}
        onClose={() => setActiveModal(null)}
        title="Liabilities"
        subtitle={`Remaining: ${formatCurrency(totalLiabilities, currency)}`}
      >
        <EditLiabilitiesView financialData={financialData} onSave={onSave} onClose={() => setActiveModal(null)} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Confirmation"
        subtitle={deleteConfirm?.name}
      >
        <div className="p-6 space-y-4">
          <p className="text-primary-600">Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.</p>
        </div>
        <div className="p-6 bg-primary-50 border-t border-primary-100 flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (deleteConfirm) {
                if (deleteConfirm.type === 'bank') removeBankBalance(deleteConfirm.id);
                else if (deleteConfirm.type === 'asset') removeAsset(deleteConfirm.id);
                else if (deleteConfirm.type === 'expense') removeExpense(deleteConfirm.id);
              }
              setDeleteConfirm(null);
            }}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};
