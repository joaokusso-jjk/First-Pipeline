
import React, { useState, useMemo } from 'react';
import { AppState, Status } from '../types';
import { formatKz, getCurrentMonthStr, getMonthYear } from '../utils';
import { Target, CheckCircle2, ChevronDown, ListChecks, Wallet, AlertCircle } from 'lucide-react';

interface Props {
  state: AppState;
}

const Planning: React.FC<Props> = ({ state }) => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const { settings } = state;

  const monthActivities = useMemo(() => 
    state.activities.filter(a => a.plannedMonth === selectedMonth),
    [state.activities, selectedMonth]
  );

  const activeFixedExpenses = useMemo(() => 
    state.fixedExpenses.filter(e => e.active),
    [state.fixedExpenses]
  );

  const totalFixed = activeFixedExpenses.reduce((acc, curr) => acc + curr.value, 0);
  const totalActivities = monthActivities.reduce((acc, curr) => acc + curr.costEstimate, 0);
  const totalCompromised = totalFixed + totalActivities;
  const balanceRemaining = settings.monthlyBudgetLimit - totalCompromised;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Target size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Planeamento Mensal</h3>
            <p className="text-slate-500">Analise o comprometimento do seu orçamento.</p>
          </div>
        </div>
        <div className="relative w-full md:w-auto">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Selecionar Período</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full md:w-64 px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
              <ListChecks size={20} className="text-indigo-600" />
              <h4 className="font-bold text-slate-700">Detalhes do Mês: {getMonthYear(selectedMonth)}</h4>
            </div>
            
            <div className="divide-y divide-slate-50">
              <div className="p-6">
                <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Despesas Fixas</p>
                <div className="space-y-3">
                  {activeFixedExpenses.map(expense => (
                    <div key={expense.id} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">{expense.name}</span>
                      <span className="font-semibold text-slate-700">{formatKz(expense.value)}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total Fixas</span>
                    <span className="font-black text-slate-900">{formatKz(totalFixed)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Atividades Planeadas</p>
                {monthActivities.length > 0 ? (
                  <div className="space-y-3">
                    {monthActivities.map(activity => (
                      <div key={activity.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${activity.status === Status.CONCLUIDA ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-slate-600">{activity.name}</span>
                        </div>
                        <span className="font-semibold text-slate-700">{formatKz(activity.costEstimate)}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total Atividades</span>
                      <span className="font-black text-slate-900">{formatKz(totalActivities)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Sem atividades para este período.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm sticky top-32">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Wallet size={20} className="text-indigo-600" />
              Estado do Orçamento
            </h4>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Comprometido</p>
                <p className="text-3xl font-black text-slate-800">{formatKz(totalCompromised)}</p>
                <p className="text-xs text-slate-500 mt-1">de {formatKz(settings.monthlyBudgetLimit)}</p>
              </div>

              <div className={`p-4 rounded-xl border ${balanceRemaining < 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className={`text-xs font-bold uppercase mb-1 ${balanceRemaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  Saldo Final
                </p>
                <p className={`text-2xl font-black ${balanceRemaining < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {formatKz(balanceRemaining)}
                </p>
              </div>

              {balanceRemaining < 0 && (
                <div className="flex items-start gap-2 text-rose-600">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-relaxed">
                    Atenção: Você planeou gastar mais do que o seu orçamento disponível de {formatKz(settings.monthlyBudgetLimit)}. Recomendamos remover atividades não prioritárias.
                  </p>
                </div>
              )}

              <div className="pt-4">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${totalCompromised > settings.monthlyBudgetLimit ? 'bg-rose-500' : 'bg-indigo-600'}`}
                    style={{ width: `${Math.min((totalCompromised / settings.monthlyBudgetLimit) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-bold text-slate-400">0%</span>
                  <span className="text-[10px] font-bold text-slate-400">100% (Limite)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;
