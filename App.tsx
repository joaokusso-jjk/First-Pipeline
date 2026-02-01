
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  CalendarRange, 
  Target, 
  TrendingUp, 
  PieChart, 
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { AppState, User } from './types';
import { 
  MONTHLY_SALARY, 
  MANDATORY_SAVINGS, 
  EMERGENCY_FUND_TARGET, 
  INITIAL_EMERGENCY_FUND, 
  MONTHLY_BUDGET_LIMIT, 
  FIXED_EXPENSES_LIMIT,
  HIGH_COST_THRESHOLD
} from './constants';
import { formatKz } from './utils';

// Components
import Dashboard from './components/Dashboard';
import FixedExpenses from './components/FixedExpenses';
import Activities from './components/Activities';
import Planning from './components/Planning';
import Savings from './components/Savings';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('kwanza_plan_session');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [state, setState] = useState<AppState>(() => {
    return {
      user: null,
      accounts: [],
      fixedExpenses: [],
      activities: [],
      savings: [],
      emergencyFundCurrent: INITIAL_EMERGENCY_FUND,
      settings: {
        monthlySalary: MONTHLY_SALARY,
        mandatorySavings: MANDATORY_SAVINGS,
        savingsPercentageRule: 40,
        emergencyFundTarget: EMERGENCY_FUND_TARGET,
        monthlyBudgetLimit: MONTHLY_BUDGET_LIMIT,
        fixedExpensesLimit: FIXED_EXPENSES_LIMIT,
        highCostThreshold: HIGH_COST_THRESHOLD,
        initialEurBalance: 0
      }
    };
  });

  useEffect(() => {
    if (user) {
      const storageKey = `kwanza_plan_data_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState({ ...parsed, user });
        } catch (e) {
          console.error("Erro ao carregar dados do utilizador:", e);
        }
      } else {
        setState({
          user,
          accounts: [],
          fixedExpenses: [],
          activities: [],
          savings: [],
          emergencyFundCurrent: INITIAL_EMERGENCY_FUND,
          settings: {
            monthlySalary: MONTHLY_SALARY,
            mandatorySavings: MANDATORY_SAVINGS,
            savingsPercentageRule: 40,
            emergencyFundTarget: EMERGENCY_FUND_TARGET,
            monthlyBudgetLimit: MONTHLY_BUDGET_LIMIT,
            fixedExpensesLimit: FIXED_EXPENSES_LIMIT,
            highCostThreshold: HIGH_COST_THRESHOLD,
            initialEurBalance: 0
          }
        });
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && state.user) {
      const storageKey = `kwanza_plan_data_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, user]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('kwanza_plan_session', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    if (confirm("Deseja terminar a sessão?")) {
      setUser(null);
      localStorage.removeItem('kwanza_plan_session');
    }
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'fixed', label: 'Fixas', icon: CreditCard },
    { id: 'activities', label: 'Atividades', icon: CalendarRange },
    { id: 'planning', label: 'Plano', icon: Target },
    { id: 'savings', label: 'Poupança', icon: TrendingUp },
    { id: 'reports', label: 'Análise', icon: PieChart },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} />;
      case 'fixed': return <FixedExpenses state={state} updateState={updateState} />;
      case 'activities': return <Activities state={state} updateState={updateState} />;
      case 'planning': return <Planning state={state} />;
      case 'savings': return <Savings state={state} updateState={updateState} />;
      case 'reports': return <Reports state={state} />;
      case 'settings': return <Settings state={state} updateState={updateState} onLogout={handleLogout} />;
      default: return <Dashboard state={state} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">KwanzaPlan</h1>
            <p className="text-slate-400 text-xs font-medium">Finanças Estruturadas</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : ''} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
              <img src={user.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="avatar" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mb-1">Regra de Poupança</p>
            <p className="font-bold text-lg">{state.settings.savingsPercentageRule}%</p>
            <button 
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 hover:text-rose-400 transition-colors uppercase font-black tracking-widest"
            >
              <LogOut size={12} />
              Terminar Sessão
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <TrendingUp size={18} />
          </div>
          <h1 className="font-bold text-slate-800 text-sm">KwanzaPlan</h1>
        </div>
        <div className="flex items-center gap-3">
           <p className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{activeTab.toUpperCase()}</p>
           <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt="avatar" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <header className="hidden md:block bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 backdrop-blur-md bg-white/80">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-slate-500 text-sm mt-1">Gestão inteligente para {user.name}.</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 z-40 flex justify-around items-center safe-area-bottom">
        {menuItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'scale-110' : ''} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <SettingsIcon size={22} className={activeTab === 'settings' ? 'scale-110' : ''} />
          <span className="text-[10px] font-bold">Ajustes</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
