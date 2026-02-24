
import React, { useState } from 'react';
import { Invoice, LineItem, BankDetail } from '../types';

interface Props {
  invoice: Invoice;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<Props> = ({ invoice, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Invoice>(invoice);
  const [signatureSize, setSignatureSize] = useState<number>(invoice.signatureSize || 80);
  const [signatureVerticalPosition, setSignatureVerticalPosition] = useState<number>(invoice.signatureVerticalPosition || 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleBankChange = (id: string, field: keyof BankDetail, value: string) => {
    setFormData(prev => ({
      ...prev,
      banks: prev.banks.map(bank => bank.id === id ? { ...bank, [field]: value } : bank)
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', period: '', amount: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const addBank = () => {
    setFormData(prev => ({
      ...prev,
      banks: [...prev.banks, { id: crypto.randomUUID(), paymentMethod: 'Bank Transfer', bankName: '', accountName: '', accountNo: '' }]
    }));
  };

  const removeBank = (id: string) => {
    setFormData(prev => ({ ...prev, banks: prev.banks.filter(b => b.id !== id) }));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setFormData(prev => ({ ...prev, signature: imageData }));
    };
    reader.readAsDataURL(file);
  };

  const clearSignature = () => {
    setFormData(prev => ({ ...prev, signature: undefined }));
    setSignatureSize(80);
    setSignatureVerticalPosition(0);
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (formData.taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 pb-24 sm:pb-0">
      {/* Header */}
      <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {invoice.createdAt === formData.createdAt ? 'Edit Invoice' : 'New Invoice'}
          </h2>
          <p className="text-slate-500">Enter simple billing details below.</p>
        </div>
        
        <div className="hidden sm:flex gap-3">
          <button onClick={onCancel} className="px-6 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 font-medium transition-all">
            Cancel
          </button>
          <button onClick={() => onSave({ ...formData, signatureSize, signatureVerticalPosition })} className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-100">
            Save Invoice
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-2">Basic & Sender Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Invoice #</label>
                <input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} className="w-full rounded-lg border-slate-200" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full rounded-lg border-slate-200">
                  <option value="MYR">MYR (RM)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full rounded-lg border-slate-200" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full rounded-lg border-slate-200">
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Your Info</h4>
                <div className="space-y-2">
                  <input name="senderName" placeholder="Your Name" value={formData.senderName} onChange={handleInputChange} className="w-full rounded-lg border-slate-200 text-sm" />
                  <input name="senderEmail" placeholder="Your Email" value={formData.senderEmail} onChange={handleInputChange} className="w-full rounded-lg border-slate-200 text-sm" />
                  <textarea name="senderAddress" placeholder="Address" value={formData.senderAddress} onChange={handleInputChange} className="w-full rounded-lg border-slate-200 text-sm h-16" />
                </div>
            </div>
          </div>

          <div className="space-y-8">
             <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-2">Client & Payment Info</h4>
             <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Bill To</h4>
                <div className="space-y-2">
                  <input name="clientName" placeholder="Client Name" value={formData.clientName} onChange={handleInputChange} className="w-full rounded-lg border-slate-200 text-sm" />
                  <textarea name="clientAddress" placeholder="Client Address" value={formData.clientAddress} onChange={handleInputChange} className="w-full rounded-lg border-slate-200 text-sm h-16" />
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h4 className="text-xs font-bold text-slate-500 uppercase">Payment Accounts</h4>
                   <button onClick={addBank} className="text-indigo-600 text-xs font-bold">+ Add</button>
                </div>
                <div className="space-y-3">
                  {formData.banks.map((bank) => (
                    <div key={bank.id} className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 relative group">
                      <button onClick={() => removeBank(bank.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500">×</button>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={bank.bankName} onChange={(e) => handleBankChange(bank.id, 'bankName', e.target.value)} placeholder="Bank Name" className="text-xs rounded border-slate-100" />
                        <input value={bank.accountNo} onChange={(e) => handleBankChange(bank.id, 'accountNo', e.target.value)} placeholder="Account No" className="text-xs rounded border-slate-100" />
                        <input value={bank.accountName} onChange={(e) => handleBankChange(bank.id, 'accountName', e.target.value)} placeholder="Account Name" className="text-xs rounded border-slate-100 col-span-2" />
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Line Items</h3>
            <button onClick={addItem} className="text-indigo-600 font-bold text-sm">+ Add Item</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="pb-4 px-2">Description</th>
                  <th className="pb-4 px-2 w-48">Period</th>
                  <th className="pb-4 px-2 w-32 text-right">Amount ({formData.currency})</th>
                  <th className="pb-4 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {formData.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-4 px-2">
                      <input value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Service description..." className="w-full border-none p-0 focus:ring-0 text-sm" />
                    </td>
                    <td className="py-4 px-2">
                      <input value={item.period} onChange={(e) => handleItemChange(item.id, 'period', e.target.value)} placeholder="e.g. Jan 2024" className="w-full border-none p-0 focus:ring-0 text-sm" />
                    </td>
                    <td className="py-4 px-2">
                      <input type="number" value={item.amount} onChange={(e) => handleItemChange(item.id, 'amount', parseFloat(e.target.value) || 0)} className="w-full border-none p-0 focus:ring-0 text-sm text-right font-medium" />
                    </td>
                    <td className="py-4 px-2 text-right">
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 font-bold text-lg">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-50/50">
                  <td colSpan={2} className="py-4 px-4 font-bold text-indigo-900">Total Amount</td>
                  <td className="py-4 px-2 font-black text-indigo-600 text-lg text-right">
                    {new Intl.NumberFormat('en-MY', { style: 'currency', currency: formData.currency }).format(total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100">
          <div className="mb-8">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-4">Signature</label>
            <div className="space-y-4">
              {/* Upload Section */}
              <label className="flex-1 relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
                <div className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-all text-center">
                  📤 Upload Signature Image
                </div>
              </label>

              {/* Preview with Size Adjustment */}
              {formData.signature && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Size Control */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-4">
                    <div className="flex items-center justify-center h-32 bg-white rounded border border-slate-200">
                      <img 
                        src={formData.signature} 
                        alt="Signature preview" 
                        style={{ height: `${signatureSize}px` }}
                        className="object-contain"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block">
                          Size: {signatureSize}px
                        </label>
                        <input
                          type="range"
                          min="40"
                          max="200"
                          value={signatureSize}
                          onChange={(e) => setSignatureSize(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block">
                          Vertical Position: {signatureVerticalPosition}px
                        </label>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          value={signatureVerticalPosition}
                          onChange={(e) => setSignatureVerticalPosition(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Invoice Preview */}
                  <div className="p-4 rounded-lg bg-white border border-slate-100 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">How it looks in invoice:</p>
                    <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-center" style={{ height: `${signatureSize + 20}px` }}>
                      <img 
                        src={formData.signature} 
                        alt="Signature in invoice" 
                        style={{ height: `${signatureSize}px`, transform: `translateY(${signatureVerticalPosition}px)` }}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Authorized Signature</p>
                  </div>
                </div>
              )}

              {formData.signature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="w-full px-3 py-2 rounded text-slate-600 hover:text-red-500 font-medium text-sm transition-colors bg-white border border-slate-200 hover:border-red-300"
                >
                  Remove Signature
                </button>
              )}
            </div>
          </div>

          <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Additional details..." className="w-full rounded-xl border-slate-200 text-sm h-24" />
        </div>
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold">Cancel</button>
        <button onClick={() => onSave({ ...formData, signatureSize, signatureVerticalPosition })} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold">Save Invoice</button>
      </div>
    </div>
  );
};
