
import React, { useState } from 'react';
import { Invoice } from '../types';

interface Props {
  invoices: Invoice[];
  onCreate: () => void;
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Invoice['status']) => void;
}

export const InvoiceList: React.FC<Props> = ({ invoices, onCreate, onEdit, onView, onDelete, onUpdateStatus }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'MYR' ? 'en-MY' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  };

  const calculateTotal = (invoice: Invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    return subtotal + (subtotal * (invoice.taxRate / 100));
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingId === id) {
      onDelete(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(current => current === id ? null : current), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoice History</h1>
          <p className="text-slate-500">Manage and track your generated invoices.</p>
        </div>
        
        <button 
          onClick={onCreate}
          className="hidden sm:flex bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-semibold items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          New Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No invoices yet</h3>
          <p className="text-slate-500 mb-6 max-w-xs mx-auto">Create your first professional invoice in seconds with our smart generator.</p>
          <button 
            onClick={onCreate}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Start creating now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((inv) => (
            <div 
              key={inv.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="overflow-hidden pr-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inv.invoiceNumber}</span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {inv.clientName || 'Unnamed Client'}
                  </h3>
                </div>
                
                {/* Status Selector */}
                <select 
                  value={inv.status}
                  onChange={(e) => onUpdateStatus(inv.id, e.target.value as Invoice['status'])}
                  className={`px-2 py-1 rounded text-[10px] font-black uppercase border-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition-all ${
                    inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 focus:ring-emerald-500' : 
                    inv.status === 'sent' ? 'bg-indigo-100 text-indigo-700 focus:ring-indigo-500' : 
                    'bg-slate-100 text-slate-600 focus:ring-slate-400'
                  }`}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="space-y-2 mb-6 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{new Date(inv.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(calculateTotal(inv), inv.currency)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => onView(inv)}
                  className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center"
                  title="View/Print"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
                <button 
                  onClick={() => onEdit(inv)}
                  className="bg-slate-50 text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button 
                  onClick={(e) => handleDeleteClick(e, inv.id)}
                  className={`p-2 rounded-lg transition-all flex items-center justify-center font-bold text-xs ${
                    deletingId === inv.id 
                      ? 'bg-red-600 text-white scale-105' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                  title={deletingId === inv.id ? "Confirm Delete" : "Delete"}
                >
                  {deletingId === inv.id ? (
                    "Confirm?"
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <button 
          onClick={onCreate}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold flex items-center justify-center gap-3 active:scale-[0.98] transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Create New Invoice
        </button>
      </div>
    </div>
  );
};
