
import React, { useState } from 'react';
import { FinancialData, FinancialAsset } from '../types';
import { createNewAsset } from '../utils/invoice';

interface Props {
  financialData: FinancialData;
  onSave: (data: FinancialData) => void;
  onClose: () => void;
}

const ASSET_CATEGORIES = ['Property', 'Equipment', 'Vehicle', 'Investment'];

export const EditAssetsView: React.FC<Props> = ({ financialData, onSave, onClose }) => {
  const [assets, setAssets] = useState<FinancialAsset[]>(financialData.assets);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const addEntry = () => {
    setAssets(prev => [...prev, createNewAsset()]);
  };

  const updateEntry = (id: string, field: keyof FinancialAsset, value: string | number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeEntry = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = () => {
    onSave({ ...financialData, assets, lastUpdated: Date.now() });
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

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
          <button onClick={addEntry} className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors">
            + Add Asset
          </button>
        </div>

        {assets.length === 0 ? (
          <div className="bg-primary-50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
            <p className="text-primary-400 font-medium">No assets tracked yet.</p>
            <button onClick={addEntry} className="text-primary-600 font-bold hover:underline mt-2 text-sm">Add one now</button>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => {
              const isCustomCategory = !ASSET_CATEGORIES.includes(asset.category);
              return (
                <div key={asset.id} className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Asset Name</label>
                      <input
                        value={asset.name}
                        onChange={(e) => updateEntry(asset.id, 'name', e.target.value)}
                        placeholder="e.g. Office Equipment"
                        className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Category</label>
                      <select
                        value={isCustomCategory ? 'Other' : asset.category}
                        onChange={(e) => updateEntry(asset.id, 'category', e.target.value === 'Other' ? 'Other' : e.target.value)}
                        className="w-full rounded-xl border border-primary-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      >
                        {ASSET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="Other">Other</option>
                      </select>
                      {isCustomCategory && (
                        <input
                          value={asset.category === 'Other' ? '' : asset.category}
                          onChange={(e) => updateEntry(asset.id, 'category', e.target.value || 'Other')}
                          placeholder="Specify category..."
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      )}
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-primary-300 uppercase tracking-wider">Value</label>
                        <input
                          type="number"
                          value={asset.value || ''}
                          onChange={(e) => updateEntry(asset.id, 'value', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-primary-200 p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <button onClick={() => removeEntry(asset.id)} className="p-2.5 text-primary-300 hover:text-red-500 transition-colors">
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
