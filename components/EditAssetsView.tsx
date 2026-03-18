
import React, { useState } from 'react';
import { FinancialData, FinancialAsset } from '../types';
import { createNewAsset } from '../utils/invoice';
import { Modal } from './Modal';

interface Props {
  financialData: FinancialData;
  onSave: (data: FinancialData) => void;
  onClose: () => void;
}

const ASSET_CATEGORIES = ['Property', 'Equipment', 'Vehicle', 'Investment'];

export const EditAssetsView: React.FC<Props> = ({ financialData, onSave, onClose }) => {
  const [assets, setAssets] = useState<FinancialAsset[]>(financialData.assets);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addEntry = () => {
    const newEntry = createNewAsset();
    setAssets(prev => [...prev, newEntry]);
    setEditingId(newEntry.id);
  };

  const updateEntry = (id: string, field: keyof FinancialAsset, value: string | number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeEntry = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSave = () => {
    onSave({ ...financialData, assets, lastUpdated: Date.now() });
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const editingEntry = assets.find(a => a.id === editingId);
  const isCustomCategory = editingEntry && !ASSET_CATEGORIES.includes(editingEntry.category);

  return (
    <div className="relative">
      {showSavedMessage && (
        <div className="sticky top-0 z-10 flex justify-center py-3">
          <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
            Assets saved!
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <button onClick={addEntry} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
            Add Asset
          </button>
        </div>

        {assets.length === 0 ? (
          <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
            <p className="text-primary-400 font-medium">No assets tracked yet.</p>
            <button onClick={addEntry} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.map((asset, index) => (
              <button
                key={asset.id}
                onClick={() => setEditingId(asset.id)}
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
                    removeEntry(asset.id);
                  }}
                  className="absolute top-3 left-3 p-2 text-primary-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Delete asset"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>

                {/* Card Content */}
                <div className="pr-8 pt-2">
                  <p className="font-bold text-primary-900 truncate text-base">{asset.name || 'Unnamed Asset'}</p>
                  <p className="text-xs text-primary-400 truncate mt-2">{asset.category}</p>
                  <p className="text-sm font-bold text-primary-600 mt-3">{asset.value ? `$${asset.value.toFixed(2)}` : 'No value'}</p>
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
          title="Edit Asset"
          subtitle={editingEntry.name}
        >
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Asset Name</label>
              <input
                value={editingEntry.name}
                onChange={(e) => updateEntry(editingEntry.id, 'name', e.target.value)}
                placeholder="e.g. Office Equipment"
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
                {ASSET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
              <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Value</label>
              <input
                type="number"
                value={editingEntry.value || ''}
                onChange={(e) => updateEntry(editingEntry.id, 'value', parseFloat(e.target.value) || 0)}
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
