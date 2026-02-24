
import React, { useState, useEffect } from 'react';
import { Invoice, View, UserProfile, BankDetail } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { ProfileView } from './components/ProfileView';
import { BankManagementView } from './components/BankManagementView';

const STORAGE_KEY = 'smartflow_invoices';
const PROFILE_KEY = 'smartflow_profile';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    address: '',
    banks: []
  });

  // Load from local storage
  useEffect(() => {
    const savedInvoices = localStorage.getItem(STORAGE_KEY);
    if (savedInvoices) {
      try {
        setInvoices(JSON.parse(savedInvoices));
      } catch (e) {
        console.error("Failed to load invoices", e);
      }
    }

    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }
  }, []);

  const isProfileComplete = (p: UserProfile) => {
    const hasInfo = p.name.trim() !== '' && p.email.trim() !== '' && p.address.trim() !== '';
    const hasBank = p.banks.some(b => b.bankName.trim() !== '' && b.accountNo.trim() !== '');
    return hasInfo && hasBank;
  };

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    
    if (isProfileComplete(newProfile)) {
      setTimeout(() => setView('dashboard'), 1500);
    }
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    saveProfile(newProfile);
  };

  const handleSaveBanks = (newBanks: BankDetail[]) => {
    const updatedProfile = { ...profile, banks: newBanks };
    saveProfile(updatedProfile);
    setView('profile');
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}${month}`;
    
    const sameMonthInvoices = invoices.filter(inv => inv.invoiceNumber.startsWith(prefix));
    let nextNum = 1;
    
    if (sameMonthInvoices.length > 0) {
      const sequences = sameMonthInvoices.map(inv => {
        const seqStr = inv.invoiceNumber.substring(6);
        return parseInt(seqStr, 10) || 0;
      });
      nextNum = Math.max(...sequences) + 1;
    }
    
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  };

  const handleCreateNew = (clientName?: string) => {
    let clientAddress = '';
    
    if (clientName) {
      const pastInvoicesForClient = invoices
        .filter(inv => inv.clientName.toLowerCase().trim() === clientName.toLowerCase().trim())
        .sort((a, b) => b.createdAt - a.createdAt);
      
      if (pastInvoicesForClient.length > 0) {
        clientAddress = pastInvoicesForClient[0].clientAddress;
      }
    }

    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      senderName: profile.name,
      senderEmail: profile.email,
      senderAddress: profile.address,
      clientName: clientName || '',
      clientAddress: clientAddress,
      items: [{ id: crypto.randomUUID(), description: '', period: '', amount: 0 }],
      taxRate: 0,
      currency: 'MYR',
      notes: '',
      status: 'draft',
      createdAt: Date.now(),
      banks: profile.banks.map(b => ({ ...b }))
    };
    setCurrentInvoice(newInvoice);
    setView('create');
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    const existingIndex = invoices.findIndex(i => i.id === invoice.id);
    let updatedInvoices: Invoice[];
    if (existingIndex > -1) {
      updatedInvoices = [...invoices];
      updatedInvoices[existingIndex] = invoice;
    } else {
      updatedInvoices = [invoice, ...invoices];
    }
    setInvoices(updatedInvoices);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
    setView('list');
    setCurrentInvoice(null);
  };

  const handleUpdateInvoiceStatus = (id: string, newStatus: Invoice['status']) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === id ? { ...inv, status: newStatus } : inv
    );
    setInvoices(updatedInvoices);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setView('edit');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setView('view');
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    if (currentInvoice) {
      const safeName = currentInvoice.clientName.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
      document.title = `${currentInvoice.invoiceNumber}_${safeName}`;
    }
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onHome={() => setView('dashboard')} 
        onProfile={() => setView('profile')} 
        userName={profile.name}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {view === 'dashboard' && (
          <Dashboard 
            invoices={invoices} 
            onViewHistory={() => setView('list')} 
            onCreateNew={handleCreateNew}
          />
        )}

        {view === 'list' && (
          <div className="space-y-6">
            <button 
              onClick={() => setView('dashboard')}
              className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back to Dashboard
            </button>
            <InvoiceList 
              invoices={invoices} 
              onCreate={() => handleCreateNew()} 
              onEdit={handleEditInvoice}
              onView={handleViewInvoice}
              onDelete={handleDeleteInvoice}
              onUpdateStatus={handleUpdateInvoiceStatus}
            />
          </div>
        )}

        {view === 'profile' && (
          <ProfileView 
            profile={profile}
            onSave={handleSaveProfile}
            onManageBanks={() => setView('banks')}
            onBack={() => setView('dashboard')}
          />
        )}

        {view === 'banks' && (
          <BankManagementView 
            banks={profile.banks}
            onSave={handleSaveBanks}
            onBack={() => setView('profile')}
          />
        )}

        {(view === 'create' || view === 'edit') && currentInvoice && (
          <InvoiceForm 
            invoice={currentInvoice} 
            onSave={handleSaveInvoice} 
            onCancel={() => setView(view === 'create' ? 'dashboard' : 'list')}
          />
        )}

        {view === 'view' && currentInvoice && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center no-print">
              <button 
                onClick={() => setView('list')}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Back to History
              </button>
              <button 
                onClick={handlePrint}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 font-bold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print / Save PDF
              </button>
            </div>
            
            {/* The single wrapper for the preview */}
            <div className="invoice-container overflow-hidden print:m-0 print:p-[15mm] border border-slate-100 print:border-none">
              <InvoicePreview invoice={currentInvoice} />
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-8 text-center text-slate-400 text-sm no-print">
        &copy; {new Date().getFullYear()} SmartFlow Invoice. Professional Billing.
      </footer>
    </div>
  );
};

export default App;
