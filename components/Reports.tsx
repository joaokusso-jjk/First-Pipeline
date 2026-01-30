
import React, { useMemo } from 'react';
import { AppState, Status } from '../types';
import { formatKz, formatEur, exportToCSV } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Download, CheckCircle2, TrendingUp, Filter } from 'lucide-react';

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Relatórios de Evolução</h3>
          <p className="text-slate-500 text-sm">Análise detalhada do seu desempenho financeiro.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportActivities} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold text-xs uppercase">
            <Download size={16} />
            CSV Atividades
          </button>
          <button onClick={handleExportSavings} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold text-xs uppercase">
            <Download size={16} />
            CSV Poupança
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-500" />
            Gastos por Categoria
          </h4>
          <div className="h-[300px] w-full">
            {activitiesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activitiesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {activitiesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatKz(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                Conclua atividades para ver estatísticas.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-500" />
            Poupança Mensal por Moeda
          </h4>
          <div className="h-[300px] w-full">
            {savingsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#f59e0b" fontSize={10} axisLine={false} tickLine={false} orientation="left" />
                  <YAxis yAxisId="right" stroke="#6366f1" fontSize={10} axisLine={false} tickLine={false} orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="kz" name="Kz Poupadis" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="eur" name="EUR Poupados" fill="#6366f1" radius={[4, 4, 0, 0]} />
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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
          <Filter size={20} className="text-slate-600" />
          <h4 className="font-bold text-slate-800">Últimas Conclusões</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="px-6 py-4">Mês</th>
                <th className="px-6 py-4">Atividade</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Custo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.activities
                .filter(a => a.status === Status.CONCLUIDA)
                .sort((a, b) => b.plannedMonth.localeCompare(a.plannedMonth))
                .slice(0, 5)
                .map(activity => (
                  <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{activity.plannedMonth}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{activity.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                        {activity.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">{formatKz(activity.costEstimate)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
