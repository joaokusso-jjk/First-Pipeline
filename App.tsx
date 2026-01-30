
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  CalendarRange, 
  Target, 
  TrendingUp, 
  PieChart, 
  Settings as SettingsIcon,
} from 'lucide-react';
import { 
  AppState, 
} from './types';
import { 
  MONTHLY_SALARY, 
  MANDATORY_SAVINGS, 
  EMERGENCY_FUND_TARGET, 
  INITIAL_EMERGENCY_FUND, 
  MONTHLY_BUDGET_LIMIT, 
  FIXED_EXPENSES_LIMIT,
  HIGH_COST_THRESHOLD
} from './constants';
import { formatKz, formatEur } from './utils';

// Components
import Dashboard from './components/Dashboard';
import FixedExpenses from './components/FixedExpenses';
import Activities from './components/Activities';
import Planning from './components/Planning';
import Savings from './components/Savings';
import Reports from './components/Reports';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('kwanza_plan_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.accounts) parsed.accounts = [];
      if (!parsed.settings) {
        parsed.settings = {
          monthlySalary: MONTHLY_SALARY,
          mandatorySavings: MANDATORY_SAVINGS,
          savingsPercentageRule: 40,
          emergencyFundTarget: EMERGENCY_FUND_TARGET,
          monthlyBudgetLimit: MONTHLY_BUDGET_LIMIT,
          fixedExpensesLimit: FIXED_EXPENSES_LIMIT,
          highCostThreshold: HIGH_COST_THRESHOLD,
          initialEurBalance: 0
        };
      } else if (parsed.settings.savingsPercentageRule === undefined) {
        parsed.settings.savingsPercentageRule = (parsed.settings.mandatorySavings / parsed.settings.monthlySalary) * 100 || 40;
      }
      return parsed;
    }
    return {
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
    localStorage.setItem('kwanza_plan_data', JSON.stringify(state));
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fixed', label: 'Despesas Fixas', icon: CreditCard },
    { id: 'activities', label: 'Atividades', icon: CalendarRange },
    { id: 'planning', label: 'Planeamento', icon: Target },
    { id: 'savings', label: 'Poupança & EUR', icon: TrendingUp },
    { id: 'reports', label: 'Relatórios', icon: PieChart },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} />;
      case 'fixed': return <FixedExpenses state={state} updateState={updateState} />;
      case 'activities': return <Activities state={state} updateState={updateState} />;
      case 'planning': return <Planning state={state} />;
      case 'savings': return <Savings state={state} updateState={updateState} />;
      case 'reports': return <Reports state={state} />;
      case 'settings': return <Settings state={state} updateState={updateState} />;
      default: return <Dashboard state={state} />;
    }
  };

  const savingsPercentage = state.settings.savingsPercentageRule;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 z-20 h-auto md:h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">KwanzaPlan</h1>
            <p className="text-slate-400 text-xs font-medium">Finanças Estruturadas</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
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

        <div className="p-4 border-t border-slate-100 hidden md:block">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-slate-400 text-xs mb-1">Salário Mensal</p>
            <p className="font-bold text-lg">{formatKz(state.settings.monthlySalary)}</p>
            <div className="mt-3 bg-white/10 rounded-full h-1 w-full overflow-hidden">
              <div 
                className="bg-indigo-400 h-full transition-all duration-500" 
                style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-indigo-200 mt-2 uppercase tracking-wider font-semibold">
              Regra de Poupança: {savingsPercentage.toFixed(0)}%
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-10">
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 backdrop-blur-md bg-white/80">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-slate-500 text-sm mt-1">Gestão inteligente do seu património.</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
