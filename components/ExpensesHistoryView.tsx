import React, { useMemo } from 'react';
import { FinancialExpense } from '../types';
import { formatCurrency } from '../utils/invoice';

interface Props {
  expenses: FinancialExpense[];
  currency: string;
  onBack: () => void;
}

interface GroupedExpenses {
  month: string;
  monthYear: string;
  expenses: FinancialExpense[];
  total: number;
}

export const ExpensesHistoryView: React.FC<Props> = ({ expenses, currency, onBack }) => {
  const groupedExpenses = useMemo(() => {
    // Get current month in YYYY-MM format
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().substring(0, 7); // Get YYYY-MM

    // Filter only past months (before the current month)
    const pastExpenses = expenses.filter(e => {
      const expenseMonth = e.date.substring(0, 7); // Get YYYY-MM
      return expenseMonth < currentMonth;
    });

    // Group by month (YYYY-MM)
    const grouped: { [key: string]: FinancialExpense[] } = {};
    pastExpenses.forEach(expense => {
      const monthKey = expense.date.substring(0, 7); // Get YYYY-MM
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(expense);
    });

    // Sort months in descending order (newest first)
    const sortedMonths = Object.keys(grouped).sort().reverse();

    // Create result array with formatted month names
    return sortedMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthYear = monthDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });

      return {
        month: monthKey,
        monthYear,
        expenses: grouped[monthKey],
        total: grouped[monthKey].reduce((sum, e) => sum + (e.amount || 0), 0)
      };
    });
  }, [expenses]);

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-primary-100 p-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-primary-50 hover:bg-primary-100 flex items-center justify-center text-primary-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-primary-900">Expenses History</h1>
            <p className="text-primary-400 text-sm">View expenses by month</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto pb-24 sm:pb-0">
        {groupedExpenses.length === 0 ? (
          <div className="p-6">
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-primary-200">
              <svg className="w-16 h-16 mx-auto text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-primary-400 font-medium">No past expenses yet.</p>
              <p className="text-primary-300 text-sm mt-1">All expenses are from today or in the future.</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {groupedExpenses.map((group) => (
              <section key={group.month} className="bg-white rounded-3xl shadow-lg border border-primary-100 overflow-hidden">
                <div className="p-6 space-y-4">
                  {/* Month Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-primary-100">
                    <h3 className="text-lg font-bold text-primary-900">{group.monthYear}</h3>
                    <span className="text-lg font-black text-primary-700">
                      {formatCurrency(group.total, currency)}
                    </span>
                  </div>

                  {/* Expenses for this month */}
                  <div className="space-y-2">
                    {group.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="bg-primary-50/50 rounded-xl p-4 border border-primary-100 flex justify-between items-center hover:bg-primary-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-primary-900 truncate">{expense.description || 'Unnamed Expense'}</p>
                            <span className="text-[10px] text-primary-400">
                              {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-primary-400">{expense.category}</p>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                (expense.expenseType || 'Fixed') === 'Fixed'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-amber-100 text-amber-600'
                              }`}
                            >
                              {expense.expenseType || 'Fixed'}
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-black text-primary-700 ml-4">
                          {formatCurrency(expense.amount || 0, currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
