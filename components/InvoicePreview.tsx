
import React from 'react';
import { Invoice } from '../types';
import { formatCurrency as formatCurrencyUtil, calculateSubtotal, calculateTax } from '../utils/invoice';

interface Props {
  invoice: Invoice;
}

export const InvoicePreview: React.FC<Props> = ({ invoice }) => {
  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, invoice.currency);

  const subtotal = calculateSubtotal(invoice.items);
  const taxAmount = calculateTax(subtotal, invoice.taxRate);
  const total = subtotal + taxAmount;

  return (
    <div className="flex flex-col h-full w-full bg-white text-slate-900">
      {/* Header Area */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-10">
        <div className="flex-1">
          <h1 className="text-5xl font-black text-primary-600 tracking-tighter mb-1">INVOICE</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right flex-1">
          <p className="font-black text-lg uppercase leading-tight mb-1">{invoice.senderName || 'Sender Name'}</p>
          <p className="text-slate-500 text-[11px] font-medium">{invoice.senderEmail}</p>
          <p className="text-slate-400 whitespace-pre-line text-[10px] leading-relaxed mt-1">{invoice.senderAddress}</p>
        </div>
      </div>

      {/* Bill To & Meta Info */}
      <div className="grid grid-cols-2 gap-10 mb-12">
        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1 inline-block">Bill To</p>
          <p className="font-bold text-1xl uppercase mb-1 leading-tight">{invoice.clientName || 'Client Name'}</p>
          <p className="text-slate-500 whitespace-pre-line text-[11px] leading-relaxed pr-8">{invoice.clientAddress}</p>
        </div>
        <div className="text-right">
          <div className="inline-block text-right">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Issue Date</p>
            <p className="font-bold text-sm bg-slate-100 px-3 py-1 rounded-md inline-block">
              {new Date(invoice.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="flex-grow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ maxWidth: '55%' }}>Description</th>
              <th className="py-3 w-32 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-6">Period</th>
              <th className="py-3 w-32 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount ({invoice.currency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(invoice.items || []).map((item) => (
              <tr key={item.id}>
                <td className="py-5 pr-6" style={{ maxWidth: '280px' }}>
                  <p className="font-bold text-sm text-slate-800 uppercase break-words">{item.description || 'Service/Product'}</p>
                </td>
                <td className="py-5 pl-6">
                  <p className="text-slate-400 text-[11px] font-medium uppercase whitespace-nowrap">{item.period || '-'}</p>
                </td>
                <td className="py-5 text-right font-black text-sm text-slate-900">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {/* <tr>
              <td colSpan={2} className="pt-8 pb-2 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtotal</td>
              <td className="pt-8 pb-2 text-right font-bold text-slate-900">{formatCurrency(subtotal)}</td>
            </tr> */}
            <tr className="border-t-2 border-slate-900">
              <td colSpan={2} className="py-5 font-black text-base uppercase tracking-widest">Total Amount Due</td>
              <td className="py-5 text-right font-black text-1xl text-primary-600">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Details - Clean & Right Aligned Acc No */}
      {invoice.banks && invoice.banks.length > 0 && (
        <div className="mt-12 mb-8 border-t border-slate-100 pt-8 payment-block">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Payment Instructions</p>
          <div className="grid grid-cols-1 gap-4">
            {invoice.banks.map((bank) => (
              <div key={bank.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{bank.paymentMethod}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Please use account below</span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Bank / Provider</span>
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{bank.bankName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Account Holder</span>
                      <span className="text-xs font-bold text-slate-700 uppercase leading-none">{bank.accountName}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Account Number</span>
                    <span className="font-black text-primary-600 tracking-widest text-1xl leading-none">
                      {bank.accountNo}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes & Footer */}
      <div className="mt-auto">
        {invoice.notes && (
          <div className="mb-10 notes-section">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Terms & Notes</p>
            <p className="text-slate-500 text-[10px] leading-relaxed whitespace-pre-line bg-primary-50/30 p-4 rounded-xl italic">
              {invoice.notes}
            </p>
          </div>
        )}

        <div className="flex justify-between items-end border-t border-slate-100 pt-8">
          <div className="w-60">
            <div className="border-b-2 border-slate-900 mb-2 flex items-center justify-center">
              {invoice.signature && (
                <img 
                  src={invoice.signature} 
                  alt="Signature" 
                  style={{ 
                    height: `${invoice.signatureSize || 80}px`,
                    transform: `translate(${invoice.signatureHorizontalPosition || 0}px, ${invoice.signatureVerticalPosition || 0}px)`
                  }}
                  className="object-contain"
                />
              )}
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Authorized Signature</p>
            <p className="font-black text-slate-900 text-xs mt-1 uppercase">{invoice.senderName}</p>
            <p className="text-slate-500 text-[11px] font-medium">{invoice.senderEmail}</p>
          </div>
          {/* <div className="text-right text-[9px] text-slate-300 font-bold uppercase tracking-tighter">
             SmartFlow Invoice &bull; Secure Local Ledger &bull; No Cloud Storage
          </div> */}
        </div>
      </div>
    </div>
  );
};
