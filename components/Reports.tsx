
import React, { useMemo } from 'react';
import { AppState, Status } from '../types';
import { formatKz, formatEur, exportToCSV, getMonthYear } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Download, CheckCircle2, TrendingUp, Filter, TrendingDown } from 'lucide-react';

interface Props {
  state: AppState;
}

const Reports: React.FC<Props> = ({ state }) => {
  const activitiesByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    state.activities
      .filter(a => a.status === Status.CONCLUIDA)
      .forEach(a => {
        data[a.category] = (data[a.category] || 0) + a.costEstimate;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [state.activities]);

  const savingsTrend = useMemo(() => {
    // Agrupar por mês
    const monthlyMap: Record<string, { month: string, kz: number, eur: number }> = {};
    
    [...state.savings].reverse().forEach(s => {
      if (!monthlyMap[s.month]) {
        monthlyMap[s.month] = { month: s.month, kz: 0, eur: 0 };
      }
      if (s.currency === 'Kz') {
        monthlyMap[s.month].kz += s.amountPoured;
      } else {
        monthlyMap[s.month].eur += s.amountPoured;
      }
    });

    return Object.values(monthlyMap);
  }, [state.savings]);

  const totalSpentInActivities = state.activities
    .filter(a => a.status === Status.CONCLUIDA)
    .reduce((acc, curr) => acc + curr.costEstimate, 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  const handleExportActivities = () => exportToCSV(state.activities, 'atividades_financeiras');
  const handleExportSavings = () => exportToCSV(state.savings, 'historico_poupanca');

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Relatórios</h2>
          <p className="text-slate-500 font-bold mt-2 text-sm md:text-base">Análise detalhada do seu fluxo financeiro.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportActivities}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[28px] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
          >
            <Download size={18} md:size={20} /> Atividades
          </button>
          <button 
            onClick={handleExportSavings}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[28px] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
          >
            <Download size={18} md:size={20} /> Poupança
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {/* Spending by Category */}
        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-8 md:mb-10 flex items-center gap-3">
            <TrendingDown className="text-indigo-600" /> Gastos por Categoria
          </h3>
          <div className="h-[300px] md:h-[400px] w-full">
            {activitiesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activitiesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {activitiesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: '900' }}
                    formatter={(value: number) => formatKz(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                Conclua atividades para ver estatísticas.
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {activitiesByCategory.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-black text-slate-500 uppercase truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Trend */}
        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-8 md:mb-10 flex items-center gap-3">
            <TrendingUp className="text-emerald-500" /> Evolução de Poupança
          </h3>
          <div className="h-[300px] md:h-[400px] w-full">
            {savingsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsTrend}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 16 }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: '900' }}
                    formatter={(value: number) => formatKz(value)}
                  />
                  <Bar dataKey="kz" fill="#10b981" radius={[12, 12, 12, 12]} barSize={24} />
                  <Bar dataKey="eur" fill="#6366f1" radius={[12, 12, 12, 12]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                Sem histórico de poupança.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Completed Activities */}
      <section>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-6 md:mb-8 px-4 md:px-6">Concluídos Recentemente</h3>
        <div className="bg-white rounded-3xl md:rounded-[56px] border border-slate-100 p-6 md:p-12 shadow-sm">
          <div className="space-y-6 md:space-y-8">
            {state.activities
              .filter(a => a.status === Status.CONCLUIDA)
              .sort((a, b) => b.plannedMonth.localeCompare(a.plannedMonth))
              .slice(0, 5)
              .map(activity => (
                <div key={activity.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50 rounded-2xl md:rounded-[32px] transition-all gap-4">
                  <div className="flex items-center gap-4 md:gap-7">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-500 rounded-xl md:rounded-[28px] flex items-center justify-center">
                      <CheckCircle2 size={24} md:size={28} />
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-black text-slate-900">{activity.name}</p>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[2px] mt-1">
                        {getMonthYear(activity.plannedMonth)} • {activity.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-xl md:text-2xl font-black text-slate-900">{formatKz(activity.costEstimate)}</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Liquidado</p>
                  </div>
                </div>
              ))}
            {state.activities.filter(a => a.status === Status.CONCLUIDA).length === 0 && (
              <p className="text-center text-slate-400 italic text-sm">Nenhuma atividade concluída para exibir.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
