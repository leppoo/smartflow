
import React from 'react';
import { FinancialData, Invoice } from '../types';
import { formatCurrency, calculateTotal } from '../utils/invoice';

interface Props {
  financialData: FinancialData;
  invoices: Invoice[];
  onBack: () => void;
  onEditBalances: () => void;
  onEditAssets: () => void;
  onEditExpenses: () => void;
  onEditLiabilities: () => void;
}

export const FinancialTrackingView: React.FC<Props> = ({ financialData, invoices, onBack, onEditBalances, onEditAssets, onEditExpenses, onEditLiabilities }) => {
  const currency = financialData.currency;
  const totalBankBalance = financialData.bankBalances.reduce((sum, b) => sum + (b.balance || 0), 0);
  const totalAssets = financialData.assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const totalExpenses = financialData.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalLiabilities = (financialData.liabilities || []).reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
  const totalRevenue = invoices.reduce((sum, inv) => sum + calculateTotal(inv.items, inv.taxRate), 0);
  const netCashFlow = totalRevenue - totalExpenses;

  return (
    <div className="max-w-4xl mx-auto pb-24 sm:pb-0 relative">
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
        <section className="bg-gradient-to-br from-primary-600 to-accent-700 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 tracking-tight">Financial Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border-2 border-white/40 ring-1 ring-white/20 min-w-0">
                <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">Bank Balances</p>
                <p className="text-base sm:text-xl font-black truncate">{formatCurrency(totalBankBalance, currency)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-0">
                <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest mb-1">Total Assets</p>
                <p className="text-base sm:text-xl font-black truncate">{formatCurrency(totalAssets, currency)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-0">
                <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest mb-1">Liabilities</p>
                <p className={`text-base sm:text-xl font-black truncate ${totalLiabilities > 0 ? 'text-red-300' : ''}`}>
                  {formatCurrency(totalLiabilities, currency)}
                </p>
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
              <button onClick={onEditBalances} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>

            {financialData.bankBalances.length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No bank accounts tracked yet.</p>
                <button onClick={onEditBalances} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {financialData.bankBalances.map((bank) => (
                  <div key={bank.id} className="bg-primary-50/50 rounded-2xl p-5 border border-primary-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-black text-sm">
                        {(bank.bankName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary-900 truncate">{bank.bankName || 'Unnamed Bank'}</p>
                        <p className="text-xs text-primary-400 truncate">{bank.accountLabel || 'No label'}</p>
                      </div>
                    </div>
                    <p className="text-xl font-black text-primary-700">{formatCurrency(bank.balance || 0, currency)}</p>
                  </div>
                ))}
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
              <button onClick={onEditAssets} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>

            {financialData.assets.length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No assets tracked yet.</p>
                <button onClick={onEditAssets} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="space-y-2">
                {financialData.assets.map((asset) => (
                  <div key={asset.id} className="bg-primary-50/50 rounded-xl p-4 border border-primary-100 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary-900 truncate">{asset.name || 'Unnamed Asset'}</p>
                      <p className="text-xs text-primary-400">{asset.category}</p>
                    </div>
                    <p className="text-lg font-black text-primary-700 ml-4">{formatCurrency(asset.value || 0, currency)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Expenses Overview */}
        <section className="bg-white rounded-3xl shadow-xl border border-primary-100 overflow-hidden">
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                Expenses
              </h3>
              <button onClick={onEditExpenses} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>

            {financialData.expenses.length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No expenses tracked yet.</p>
                <button onClick={onEditExpenses} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="space-y-2">
                {financialData.expenses.map((expense) => (
                  <div key={expense.id} className="bg-primary-50/50 rounded-xl p-4 border border-primary-100 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary-900 truncate">{expense.description || 'Unnamed Expense'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-primary-400">{expense.category} &middot; {new Date(expense.date).toLocaleDateString()}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(expense.expenseType || 'Fixed') === 'Fixed' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                          {expense.expenseType || 'Fixed'}
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-black text-primary-700 ml-4">{formatCurrency(expense.amount || 0, currency)}</p>
                  </div>
                ))}
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
              <button onClick={onEditLiabilities} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>

            {(financialData.liabilities || []).length === 0 ? (
              <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">No liabilities tracked yet.</p>
                <button onClick={onEditLiabilities} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
              </div>
            ) : (
              <div className="space-y-2">
                {financialData.liabilities.map((liability) => {
                  const paidPercent = liability.totalAmount > 0
                    ? Math.round(((liability.totalAmount - liability.remainingBalance) / liability.totalAmount) * 100)
                    : 0;
                  return (
                    <div key={liability.id} className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-primary-900 truncate">{liability.name || 'Unnamed'}</p>
                          <p className="text-xs text-primary-400">{liability.type}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-black text-red-600">{formatCurrency(liability.remainingBalance || 0, currency)}</p>
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
    </div>
  );
};
