
import React, { useState } from 'react';
import { FinancialData, FinancialExpense } from '../types';
import { createNewExpense } from '../utils/invoice';
import { Modal } from './Modal';

interface Props {
  financialData: FinancialData;
  onSave: (data: FinancialData) => void;
  onClose: () => void;
}

const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Salaries', 'Software', 'Marketing', 'Travel', 'Supplies', 'Insurance'];

export const EditExpensesView: React.FC<Props> = ({ financialData, onSave, onClose }) => {
  const [expenses, setExpenses] = useState<FinancialExpense[]>(financialData.expenses);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addEntry = () => {
    const newEntry = createNewExpense();
    setExpenses(prev => [...prev, newEntry]);
    setEditingId(newEntry.id);
  };

  const updateEntry = (id: string, field: keyof FinancialExpense, value: string | number) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEntry = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSave = () => {
    onSave({ ...financialData, expenses, lastUpdated: Date.now() });
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const editingEntry = expenses.find(e => e.id === editingId);
  const isCustomCategory = editingEntry && !EXPENSE_CATEGORIES.includes(editingEntry.category);

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
          <button onClick={addEntry} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
            Add Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
            <p className="text-primary-400 font-medium">No expenses tracked yet.</p>
            <button onClick={addEntry} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expenses.map((expense, index) => (
              <button
                key={expense.id}
                onClick={() => setEditingId(expense.id)}
                className="relative bg-white rounded-2xl p-5 border border-primary-100 hover:border-primary-300 hover:shadow-md transition-all text-left group overflow-hidden"
              >
                {/* Index Badge */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-black">
                  {index + 1}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEntry(expense.id);
                  }}
                  className="absolute top-3 left-3 p-2 text-primary-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Delete expense"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>

                {/* Card Content */}
                <div className="pr-8 pt-2">
                  <p className="font-bold text-primary-900 truncate text-base">{expense.description || 'Unnamed Expense'}</p>
                  <p className="text-xs text-primary-400 truncate mt-2">{expense.category}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm font-bold text-primary-600">{expense.amount ? `$${expense.amount.toFixed(2)}` : 'No amount'}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${expense.expenseType === 'Fixed' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                      {expense.expenseType || 'Fixed'}
                    </span>
                  </div>
                </div>

                {/* Edit Indicator */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <Modal
          isOpen={!!editingId}
          onClose={() => setEditingId(null)}
          title="Edit Expense"
          subtitle={editingEntry.description}
        >
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Description</label>
              <input
                value={editingEntry.description}
                onChange={(e) => updateEntry(editingEntry.id, 'description', e.target.value)}
                placeholder="e.g. Office Rent"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Category</label>
              <select
                value={isCustomCategory ? 'Other' : editingEntry.category}
                onChange={(e) => updateEntry(editingEntry.id, 'category', e.target.value === 'Other' ? 'Other' : e.target.value)}
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="Other">Other</option>
              </select>
              {isCustomCategory && (
                <input
                  value={editingEntry.category === 'Other' ? '' : editingEntry.category}
                  onChange={(e) => updateEntry(editingEntry.id, 'category', e.target.value || 'Other')}
                  placeholder="Specify category..."
                  className="w-full rounded-xl border border-primary-200 p-3 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Type</label>
              <div className="flex rounded-xl border border-primary-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => updateEntry(editingEntry.id, 'expenseType', 'Fixed')}
                  className={`flex-1 py-2.5 text-xs font-bold transition-colors ${(editingEntry.expenseType || 'Fixed') === 'Fixed' ? 'bg-primary-600 text-white' : 'bg-white text-primary-400 hover:bg-primary-50'}`}
                >
                  Fixed
                </button>
                <button
                  type="button"
                  onClick={() => updateEntry(editingEntry.id, 'expenseType', 'Variable')}
                  className={`flex-1 py-2.5 text-xs font-bold transition-colors ${(editingEntry.expenseType || 'Fixed') === 'Variable' ? 'bg-primary-600 text-white' : 'bg-white text-primary-400 hover:bg-primary-50'}`}
                >
                  Variable
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={editingEntry.date}
                onChange={(e) => updateEntry(editingEntry.id, 'date', e.target.value)}
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Amount</label>
              <input
                type="number"
                value={editingEntry.amount || ''}
                onChange={(e) => updateEntry(editingEntry.id, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="p-6 bg-primary-50 border-t border-primary-100 flex justify-end gap-3">
            <button
              onClick={() => setEditingId(null)}
              className="px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

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
