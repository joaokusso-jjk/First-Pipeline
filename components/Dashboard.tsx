
import React from 'react';
import { AppState, Priority } from '../types';
import { formatKz, formatEur, getCurrentMonthStr } from '../utils';
import { 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Globe, 
  AlertCircle,
  Building2,
  Coins
} from 'lucide-react';

interface Props {
  state: AppState;
}

const Dashboard: React.FC<Props> = ({ state }) => {
  const currentMonth = getCurrentMonthStr();
  const { settings, accounts } = state;
  
  const currentMonthSavings = state.savings.find(s => s.month === currentMonth);
  
  const totalKzBalance = accounts
    .filter(a => a.currency === 'Kz')
    .reduce((acc, curr) => acc + curr.balance, 0);
  
  const totalEurBalance = accounts
    .filter(a => a.currency === 'EUR')
    .reduce((acc, curr) => acc + curr.balance, 0);
  
  const activeFixedTotal = state.fixedExpenses
    .filter(e => e.active)
    .reduce((acc, curr) => acc + curr.value, 0);

  const monthActivitiesTotal = state.activities
    .filter(a => a.plannedMonth === currentMonth)
    .reduce((acc, curr) => acc + curr.costEstimate, 0);

  const budgetRemaining = settings.monthlyBudgetLimit - activeFixedTotal - monthActivitiesTotal;
  const isOverBudget = budgetRemaining < 0;

  const efPercentage = Math.min((state.emergencyFundCurrent / settings.emergencyFundTarget) * 100, 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Saldo Total Kz" 
          value={formatKz(totalKzBalance)} 
          icon={<Wallet className="text-indigo-600" />} 
          subtitle="Soma de todas as contas Kz"
          color="indigo"
        />
        <Card 
          title="Saldo Total EUR" 
          value={formatEur(totalEurBalance)} 
          icon={<Globe className="text-blue-600" />} 
          subtitle="Soma de todas as contas EUR"
          color="blue"
        />
        <Card 
          title="Reserva Emergência" 
          value={formatKz(state.emergencyFundCurrent)} 
          icon={<ShieldCheck className="text-amber-600" />} 
          subtitle={`${efPercentage.toFixed(1)}% da meta de ${formatKz(settings.emergencyFundTarget)}`}
          color="amber"
          progress={efPercentage}
        />
        <Card 
          title="Poupança Mensal" 
          value={formatKz(settings.mandatorySavings)} 
          icon={<TrendingUp className="text-emerald-600" />} 
          subtitle={currentMonthSavings ? 'Executada ✅' : 'Pendente ⏳'}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Building2 className="text-slate-400" size={20} />
              Minhas Contas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map(acc => (
                <div key={acc.id} className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 flex justify-between items-center group hover:border-indigo-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${acc.currency === 'Kz' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {acc.currency === 'Kz' ? <Coins size={18} /> : <Globe size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{acc.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{acc.currency}</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-800">
                    {acc.currency === 'Kz' ? formatKz(acc.balance) : formatEur(acc.balance)}
                  </p>
                </div>
              ))}
              {accounts.length === 0 && (
                <div className="col-span-full py-6 text-center text-slate-400 text-sm italic">
                  Nenhuma conta configurada. Vá às Configurações para adicionar.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Orçamento Mensal Disponível</h3>
                <p className="text-slate-500 text-sm">Controlo de gastos pós-poupança ({formatKz(settings.monthlyBudgetLimit)})</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${isOverBudget ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isOverBudget ? 'Orçamento Ultrapassado' : 'Dentro do Limite'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Gastos Fixos</span>
                <span className="text-xl font-bold text-slate-700">{formatKz(activeFixedTotal)}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Atividades Planeadas</span>
                <span className="text-xl font-bold text-slate-700">{formatKz(monthActivitiesTotal)}</span>
              </div>
              <div className={`p-4 rounded-xl border ${isOverBudget ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'}`}>
                <span className={`text-xs font-semibold block mb-1 ${isOverBudget ? 'text-rose-400' : 'text-indigo-400'}`}>Saldo Restante</span>
                <span className={`text-xl font-bold ${isOverBudget ? 'text-rose-600' : 'text-indigo-600'}`}>{formatKz(budgetRemaining)}</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(((activeFixedTotal + monthActivitiesTotal) / settings.monthlyBudgetLimit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Atividades Prioritárias</h3>
          <div className="space-y-4">
            {state.activities
              .filter(a => a.plannedMonth === currentMonth)
              .sort((a, b) => a.priority === Priority.ALTA ? -1 : 1)
              .slice(0, 5)
              .map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.priority === Priority.ALTA ? 'bg-rose-500' : 
                      activity.priority === Priority.MEDIA ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{activity.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{activity.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-600">{formatKz(activity.costEstimate)}</span>
                </div>
              ))}
            {state.activities.filter(a => a.plannedMonth === currentMonth).length === 0 && (
              <p className="text-center text-slate-400 py-10 text-sm italic">Nenhuma atividade para este mês.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{ 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  subtitle: string; 
  color: string;
  progress?: number;
}> = ({ title, value, icon, subtitle, color, progress }) => {
  const bgColors: Record<string, string> = {
    indigo: 'bg-indigo-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    blue: 'bg-blue-50'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColors[color]}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
          <div 
            className={`h-full rounded-full bg-${color}-500 transition-all duration-1000`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
