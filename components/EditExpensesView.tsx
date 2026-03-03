
import React, { useState } from 'react';
import { FinancialData, FinancialExpense } from '../types';
import { createNewExpense } from '../utils/invoice';

interface Props {
  financialData: FinancialData;
  onSave: (data: FinancialData) => void;
  onClose: () => void;
}

const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Salaries', 'Software', 'Marketing', 'Travel', 'Supplies', 'Insurance'];

export const EditExpensesView: React.FC<Props> = ({ financialData, onSave, onClose }) => {
  const [expenses, setExpenses] = useState<FinancialExpense[]>(financialData.expenses);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const addEntry = () => {
    setExpenses(prev => [...prev, createNewExpense()]);
  };

  const updateEntry = (id: string, field: keyof FinancialExpense, value: string | number) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEntry = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleSave = () => {
    onSave({ ...financialData, expenses, lastUpdated: Date.now() });
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  return (
    <div className="relative">
      {showSavedMessage && (
        <div className="sticky top-0 z-10 flex justify-center py-3">
          <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
            Expenses saved!
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <button onClick={addEntry} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors">
            + Add Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
            <p className="text-primary-400 font-medium">No expenses tracked yet.</p>
            <button onClick={addEntry} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const isCustomCategory = !EXPENSE_CATEGORIES.includes(expense.category);
              return (
                <div key={expense.id} className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Description</label>
                      <input
                        value={expense.description}
                        onChange={(e) => updateEntry(expense.id, 'description', e.target.value)}
                        placeholder="e.g. Office Rent"
                        className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Category</label>
                      <select
                        value={isCustomCategory ? 'Other' : expense.category}
                        onChange={(e) => updateEntry(expense.id, 'category', e.target.value === 'Other' ? 'Other' : e.target.value)}
                        className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      >
                        {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="Other">Other</option>
                      </select>
                      {isCustomCategory && (
                        <input
                          value={expense.category === 'Other' ? '' : expense.category}
                          onChange={(e) => updateEntry(expense.id, 'category', e.target.value || 'Other')}
                          placeholder="Specify category..."
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Type</label>
                      <div className="flex rounded-xl border border-primary-200 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateEntry(expense.id, 'expenseType', 'Fixed')}
                          className={`flex-1 py-2.5 text-xs font-bold transition-colors ${(expense.expenseType || 'Fixed') === 'Fixed' ? 'bg-primary-600 text-white' : 'bg-white text-primary-400 hover:bg-primary-50'}`}
                        >
                          Fixed
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEntry(expense.id, 'expenseType', 'Variable')}
                          className={`flex-1 py-2.5 text-xs font-bold transition-colors ${(expense.expenseType || 'Fixed') === 'Variable' ? 'bg-primary-600 text-white' : 'bg-white text-primary-400 hover:bg-primary-50'}`}
                        >
                          Variable
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Date</label>
                      <input
                        type="date"
                        value={expense.date}
                        onChange={(e) => updateEntry(expense.id, 'date', e.target.value)}
                        className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Amount</label>
                        <input
                          type="number"
                          value={expense.amount || ''}
                          onChange={(e) => updateEntry(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <button onClick={() => removeEntry(expense.id)} className="p-2.5 text-primary-300 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-6 bg-primary-50 border-t border-primary-100 flex justify-end gap-3 sticky bottom-0">
        <button onClick={onClose} className="px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-100 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100">
          Save Changes
        </button>
      </div>
    </div>
  );
};
