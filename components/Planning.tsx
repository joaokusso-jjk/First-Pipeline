
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
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm">
        <div className="space-y-2 md:space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Planeamento</h2>
          <p className="text-slate-500 font-bold max-w-sm text-sm md:text-base">Visão consolidada do seu orçamento para o mês selecionado.</p>
        </div>
        
        <div className="flex flex-col gap-2 md:gap-3 w-full md:w-auto">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Mês de Análise</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[28px] bg-slate-50 border-none font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none text-sm md:text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl md:rounded-[56px] p-6 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[140px] opacity-20 -mr-40 -mt-40"></div>
          
          <div className="relative z-10 space-y-8 md:space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[3px] mb-3">Total Comprometido ({getMonthYear(selectedMonth)})</p>
                <h3 className="text-4xl md:text-6xl font-black tracking-tighter">
                  {formatKz(totalCompromised)}
                </h3>
              </div>
              <div className="p-4 md:p-6 bg-white/10 rounded-2xl md:rounded-[32px] backdrop-blur-md border border-white/10">
                <Target className="text-indigo-400" size={32} md:size={40} />
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[9px] md:text-[10px] font-black text-white/50 uppercase tracking-widest">Limite de Orçamento: {formatKz(settings.monthlyBudgetLimit)}</span>
                <span className={`text-2xl md:text-4xl font-black ${totalCompromised > settings.monthlyBudgetLimit ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {((totalCompromised / settings.monthlyBudgetLimit) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-4 md:h-6 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 p-1">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${totalCompromised > settings.monthlyBudgetLimit ? 'bg-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.5)]'}`}
                  style={{ width: `${Math.min((totalCompromised / settings.monthlyBudgetLimit) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-4">
              <div className="bg-white/5 p-4 md:p-7 rounded-2xl md:rounded-[32px] border border-white/5">
                <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase mb-2 md:mb-3 tracking-widest">Despesas Fixas</p>
                <p className="text-lg md:text-2xl font-black">{formatKz(totalFixed)}</p>
              </div>
              <div className="bg-white/5 p-4 md:p-7 rounded-2xl md:rounded-[32px] border border-white/5">
                <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase mb-2 md:mb-3 tracking-widest">Atividades</p>
                <p className="text-lg md:text-2xl font-black">{formatKz(totalActivities)}</p>
              </div>
              <div className="hidden lg:block bg-white/5 p-4 md:p-7 rounded-2xl md:rounded-[32px] border border-white/5">
                <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase mb-2 md:mb-3 tracking-widest">Disponível</p>
                <p className={`text-lg md:text-2xl font-black ${balanceRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatKz(balanceRemaining)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-100 shadow-sm space-y-8 md:space-y-10">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-[28px] flex items-center justify-center">
              <CheckCircle2 size={24} md:size={32} />
            </div>
            <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Saúde do Mês</h4>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="p-6 md:p-8 bg-slate-50 rounded-2xl md:rounded-[40px] border border-slate-100">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Taxa de Comprometimento</p>
              <p className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{(totalCompromised / settings.monthlySalary * 100).toFixed(1)}%</p>
              <p className="text-[10px] font-bold text-slate-400 italic">Do salário base ({formatKz(settings.monthlySalary)})</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 size={18} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Poupança Mínima Garantida</span>
              </div>
              <div className={`flex items-center gap-3 ${balanceRemaining < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                {balanceRemaining < 0 ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                  {balanceRemaining < 0 ? 'Orçamento Excedido' : 'Dentro do Limite'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;
