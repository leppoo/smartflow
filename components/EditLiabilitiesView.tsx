
import React, { useState } from 'react';
import { FinancialData, FinancialLiability } from '../types';
import { createNewLiability } from '../utils/invoice';
import { Modal } from './Modal';

interface Props {
  financialData: FinancialData;
  onSave: (data: FinancialData) => void;
  onClose: () => void;
}

const LIABILITY_TYPES: FinancialLiability['type'][] = ['Loan', 'Credit Card', 'Payable'];

export const EditLiabilitiesView: React.FC<Props> = ({ financialData, onSave, onClose }) => {
  const [liabilities, setLiabilities] = useState<FinancialLiability[]>(financialData.liabilities || []);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addEntry = () => {
    const newEntry = createNewLiability();
    setLiabilities(prev => [...prev, newEntry]);
    setEditingId(newEntry.id);
  };

  const updateEntry = (id: string, field: keyof FinancialLiability, value: string | number) => {
    setLiabilities(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeEntry = (id: string) => {
    setLiabilities(prev => prev.filter(l => l.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSave = () => {
    onSave({ ...financialData, liabilities, lastUpdated: Date.now() });
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const editingEntry = liabilities.find(l => l.id === editingId);
  const remaining = editingEntry ? (editingEntry.totalAmount || 0) - (editingEntry.amountPaid || 0) : 0;

  return (
    <div className="relative">
      {showSavedMessage && (
        <div className="sticky top-0 z-10 flex justify-center py-3">
          <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
            Liabilities saved!
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <button onClick={addEntry} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
            Add Liability
          </button>
        </div>

        {liabilities.length === 0 ? (
          <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
            <p className="text-primary-400 font-medium">No liabilities tracked yet.</p>
            <button onClick={addEntry} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {liabilities.map((entry, index) => {
              const remaining = (entry.totalAmount || 0) - (entry.amountPaid || 0);
              return (
                <button
                  key={entry.id}
                  onClick={() => setEditingId(entry.id)}
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
                      removeEntry(entry.id);
                    }}
                    className="absolute top-3 left-3 p-2 text-primary-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete liability"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>

                  {/* Card Content */}
                  <div className="pr-8 pt-2">
                    <p className="font-bold text-primary-900 truncate text-base">{entry.name || 'Unnamed Liability'}</p>
                    <p className="text-xs text-primary-400 truncate mt-2">{entry.type}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-[10px] text-primary-300 font-medium">Remaining</p>
                        <p className="text-sm font-bold text-primary-600">${remaining.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-primary-300 font-medium">Progress</p>
                        <p className="text-xs font-bold text-primary-500">
                          {entry.totalAmount ? `${Math.round((entry.amountPaid || 0) / entry.totalAmount * 100)}%` : '0%'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Indicator */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <Modal
          isOpen={!!editingId}
          onClose={() => setEditingId(null)}
          title="Edit Liability"
          subtitle={editingEntry.name}
        >
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Name</label>
              <input
                value={editingEntry.name}
                onChange={(e) => updateEntry(editingEntry.id, 'name', e.target.value)}
                placeholder="e.g. Car Loan"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Type</label>
              <select
                value={editingEntry.type}
                onChange={(e) => updateEntry(editingEntry.id, 'type', e.target.value)}
                className="w-full rounded-xl border border-primary-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {LIABILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Total Amount</label>
              <input
                type="number"
                value={editingEntry.totalAmount || ''}
                onChange={(e) => updateEntry(editingEntry.id, 'totalAmount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Amount Paid</label>
              <input
                type="number"
                value={editingEntry.amountPaid || ''}
                onChange={(e) => updateEntry(editingEntry.id, 'amountPaid', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full rounded-xl border border-primary-200 p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="bg-primary-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Remaining</p>
              <p className="text-lg font-bold text-primary-600">${remaining.toFixed(2)}</p>
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
