
import React, { useState } from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateTotal } from '../utils/invoice';

interface Props {
  invoices: Invoice[];
  onCreate: () => void;
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Invoice['status']) => void;
}

const ITEMS_PER_PAGE = 9;

export const InvoiceList: React.FC<Props> = ({ invoices, onCreate, onEdit, onView, onDelete, onUpdateStatus }) => {
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInvoices = invoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModalId(id);
  };

  const confirmDelete = () => {
    if (deleteModalId) {
      onDelete(deleteModalId);
      setDeleteModalId(null);
      const remainingCount = invoices.length - 1;
      const maxPage = Math.max(1, Math.ceil(remainingCount / ITEMS_PER_PAGE));
      if (currentPage > maxPage) {
        setCurrentPage(maxPage);
      }
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
          className="hidden sm:flex bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 font-semibold items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          New Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="mx-auto w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-4 text-primary-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No invoices yet</h3>
          <p className="text-slate-500 mb-6 max-w-xs mx-auto">Create your first professional invoice in seconds with our smart generator.</p>
          <button 
            onClick={onCreate}
            className="text-primary-600 font-semibold hover:underline"
          >
            Start creating now
          </button>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedInvoices.map((inv) => (
            <div 
              key={inv.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="overflow-hidden pr-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inv.invoiceNumber}</span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                    {inv.clientName || 'Unnamed Client'}
                  </h3>
                </div>
                
                {/* Status Selector */}
                <select 
                  value={inv.status}
                  onChange={(e) => onUpdateStatus(inv.id, e.target.value as Invoice['status'])}
                  className={`px-2 py-1 rounded text-[10px] font-black uppercase border-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition-all ${
                    inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 focus:ring-emerald-500' : 
                    inv.status === 'sent' ? 'bg-primary-100 text-primary-700 focus:ring-primary-500' : 
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
                  <span className="font-bold text-slate-900">{formatCurrency(calculateTotal(inv.items, inv.taxRate), inv.currency)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => onView(inv)}
                  className="bg-primary-50 text-primary-600 p-2 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center"
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
                  className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Delete Invoice</h3>
            <p className="text-slate-500 text-sm">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <button 
          onClick={onCreate}
          className="w-full bg-primary-600 text-white py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 font-bold flex items-center justify-center gap-3 active:scale-[0.98] transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Create New Invoice
        </button>
      </div>
    </div>
  );
};
