
import React from 'react';
import { Invoice } from '../types';

interface Props {
  invoices: Invoice[];
  onViewHistory: () => void;
  onCreateNew: (clientName?: string) => void;
}

export const Dashboard: React.FC<Props> = ({ invoices, onViewHistory, onCreateNew }) => {
  // Extract unique clients and some basic stats
  const uniqueClientsMap = new Map<string, { name: string, lastDate: string, count: number }>();
  
  let totalRevenue = 0;
  invoices.forEach(inv => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal + (subtotal * (inv.taxRate / 100));
    totalRevenue += total;

    const clientKey = inv.clientName.toLowerCase().trim();
    if (clientKey) {
      const existing = uniqueClientsMap.get(clientKey);
      if (!existing || new Date(inv.date) > new Date(existing.lastDate)) {
        uniqueClientsMap.set(clientKey, {
          name: inv.clientName,
          lastDate: inv.date,
          count: (existing?.count || 0) + 1
        });
      } else {
        uniqueClientsMap.set(clientKey, { ...existing, count: existing.count + 1 });
      }
    }
  });

  const involvedBusinesses = Array.from(uniqueClientsMap.values())
    .sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());

  return (
    <div className="space-y-10 pb-24 sm:pb-0">
      {/* Hero / Welcome Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Business Hub</h1>
          <p className="text-indigo-100 text-lg max-w-lg mb-8 opacity-90 leading-relaxed">
            Welcome back to your professional billing dashboard. Manage relationships and track your financial flow.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-3xl font-black">
                {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(totalRevenue)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Invoices Issued</p>
              <p className="text-3xl font-black">{invoices.length}</p>
            </div>
          </div>
        </div>
        
        {/* Abstract shapes for aesthetics */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </section>

      {/* Action Navigation */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button 
          onClick={() => onCreateNew()}
          className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all text-left flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Create Invoice</h3>
            <p className="text-slate-500 text-sm">Generate a new professional bill</p>
          </div>
        </button>

        <button 
          onClick={onViewHistory}
          className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-violet-100 transition-all text-left flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Invoice History</h3>
            <p className="text-slate-500 text-sm">Track and manage past records</p>
          </div>
        </button>
      </section>

      {/* Involved Businesses Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            Involved Businesses
          </h2>
          <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">{involvedBusinesses.length} Active</span>
        </div>

        {involvedBusinesses.length === 0 ? (
          <div className="bg-slate-50 rounded-[2rem] p-12 text-center border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No business connections found yet.</p>
            <p className="text-slate-400 text-sm">Your clients will appear here as you create invoices.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {involvedBusinesses.map((biz, idx) => (
              <div key={idx} className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 font-black text-lg group-hover:bg-indigo-50 transition-colors">
                    {biz.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="font-bold text-slate-900 truncate">{biz.name}</h4>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Client Company</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Last Billed:</span>
                    <span className="font-semibold text-slate-600">{new Date(biz.lastDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Invoices:</span>
                    <span className="font-black text-indigo-600 bg-indigo-50 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
                      {biz.count}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => onCreateNew(biz.name)}
                  className="mt-2 w-full bg-slate-50 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                  Create Invoice
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
