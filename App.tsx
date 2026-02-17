
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Target, 
  TrendingUp, 
  PieChart, 
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Plus,
  Coins
} from 'lucide-react';
import { AppState, User, Transaction, TransactionType, Status } from './types';

// Components
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import Activities from './components/Activities';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Savings from './components/Savings';
import Reports from './components/Reports';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('kwanza_plan_session');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [state, setState] = useState<AppState>(() => ({
    user: null,
    accounts: [],
    activities: [],
    goals: [],
    transactions: [],
    fixedExpenses: [],
    savings: [],
    emergencyFundCurrent: 0,
    settings: {
      monthlySalary: 1250000,
      mandatorySavings: 500000,
      savingsPercentageRule: 40,
      emergencyFundTarget: 1500000,
      monthlyBudgetLimit: 750000,
      fixedExpensesLimit: 500000,
    }
  }));

  useEffect(() => {
    if (user) {
      const storageKey = `kwanza_plan_data_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState({ ...parsed, user });
        } catch (e) { console.error(e); }
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && state.user) {
      localStorage.setItem(`kwanza_plan_data_${user.id}`, JSON.stringify(state));
    }
  }, [state, user]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('kwanza_plan_session', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    if (confirm("Deseja sair da conta?")) {
      setUser(null);
      localStorage.removeItem('kwanza_plan_session');
    }
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const transaction = { ...t, id };

    updateState(prev => {
      let updatedAccounts = prev.accounts.map(acc => {
        if (transaction.status === Status.CONCLUIDA) {
          if (acc.id === transaction.accountId) {
            if (transaction.type === TransactionType.EXPENSE) return { ...acc, balance: acc.balance - transaction.amount };
            if (transaction.type === TransactionType.INCOME) return { ...acc, balance: acc.balance + transaction.amount };
            if (transaction.type === TransactionType.TRANSFER) return { ...acc, balance: acc.balance - transaction.amount };
          }
          if (transaction.type === TransactionType.TRANSFER && acc.id === transaction.toAccountId) {
            return { ...acc, balance: acc.balance + transaction.amount };
          }
        }
        return acc;
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: [transaction, ...prev.transactions]
      };
    });
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'savings', label: 'Poupança', icon: Coins },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'activities', label: 'Atividades', icon: CalendarRange },
    { id: 'reports', label: 'Análise', icon: PieChart },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FDFDFF] text-slate-900">
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <TrendingUp size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter">KwanzaPlan.</span>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all font-bold text-sm ${
                  activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-10 space-y-4">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all font-bold text-sm ${
              activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <SettingsIcon size={20} />
            Ajustes
          </button>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl">
            <img src={user.avatar} className="w-10 h-10 rounded-xl shadow-sm" alt="profile" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-black truncate">{user.name}</p>
              <button onClick={handleLogout} className="text-[10px] text-rose-500 font-bold uppercase hover:underline">Sair</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-32 md:pb-0">
        <div className="p-6 md:p-12 max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard state={state} updateState={updateState} onAddTransaction={addTransaction} />}
          {activeTab === 'savings' && <Savings state={state} updateState={updateState} />}
          {activeTab === 'goals' && <Goals state={state} updateState={updateState} />}
          {activeTab === 'activities' && <Activities state={state} updateState={updateState} />}
          {activeTab === 'reports' && <Reports state={state} />}
          {activeTab === 'settings' && <Settings state={state} updateState={updateState} onLogout={handleLogout} />}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-50 flex justify-around items-center rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {menuItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            <item.icon size={24} />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
