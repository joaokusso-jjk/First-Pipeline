
import React, { useState } from 'react';
import { AppState, FinancialActivity, Category, Priority, Status } from '../types';
import { formatKz, formatEur, getCurrentMonthStr, getMonthYear } from '../utils';
import { Plus, Trash2, Calendar, AlertCircle, ChevronDown, CheckCircle, Clock, Wallet, X } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Activities: React.FC<Props> = ({ state, updateState }) => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isAdding, setIsAdding] = useState(false);
  
  const monthActivities = state.activities.filter(a => a.plannedMonth === selectedMonth);

  const [newActivity, setNewActivity] = useState<Partial<FinancialActivity>>({
    name: '',
    category: Category.PESSOAL,
    costEstimate: 0,
    plannedMonth: selectedMonth,
    priority: Priority.MEDIA,
    status: Status.PLANEADA,
    accountId: ''
  });

  const handleAdd = () => {
    if (!newActivity.name || !newActivity.costEstimate || !newActivity.accountId) {
      alert("Preencha o nome, o custo e selecione a conta de origem.");
      return;
    }
    updateState(prev => ({
      ...prev,
      activities: [...prev.activities, {
        ...newActivity as FinancialActivity,
        id: Math.random().toString(36).substr(2, 9)
      }]
    }));
    setIsAdding(false);
    setNewActivity({ ...newActivity, name: '', costEstimate: 0, accountId: '' });
  };

  const updateStatus = (id: string, status: Status) => {
    updateState(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === id ? { ...a, status } : a)
    }));
  };

  const deleteActivity = (id: string) => {
    if(confirm("Eliminar esta atividade?")) {
      updateState(prev => ({
        ...prev,
        activities: prev.activities.filter(a => a.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-12 rounded-[56px] border border-slate-50 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Atividades</h2>
          <p className="text-slate-500 font-bold max-w-sm">Planeie os seus gastos futuros associados a cada carteira.</p>
        </div>
        
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Mês de Planeamento</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={e => {
              setSelectedMonth(e.target.value);
              setNewActivity(prev => ({ ...prev, plannedMonth: e.target.value }));
            }}
            className="px-8 py-5 rounded-[28px] bg-slate-50 border-none font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 px-6">
        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-[4px]">{getMonthYear(selectedMonth)}</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <Plus size={20} />
          Planear Movimento
        </button>
      </div>

      <div className="space-y-6">
        {monthActivities.length > 0 ? monthActivities.map(activity => {
          const linkedAccount = state.accounts.find(a => a.id === activity.accountId);
          return (
            <div key={activity.id} className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm hover:shadow-2xl transition-all flex flex-col md:flex-row items-center justify-between gap-8 group">
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all ${
                  activity.status === Status.CONCLUIDA ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
                }`}>
                  {activity.status === Status.CONCLUIDA ? <CheckCircle size={32} /> : <Clock size={32} />}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{activity.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activity.category}</span>
                    {linkedAccount && (
                      <span className="text-[9px] font-black bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full flex items-center gap-1">
                        <Wallet size={10} /> {linkedAccount.name}
                      </span>
                    )}
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      activity.priority === Priority.ALTA ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {activity.priority}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-12 w-full md:w-auto">
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Estimado</p>
                  <p className="text-3xl font-black text-slate-900">
                    {linkedAccount?.currency === 'EUR' ? formatEur(activity.costEstimate) : formatKz(activity.costEstimate)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => updateStatus(activity.id, activity.status === Status.CONCLUIDA ? Status.PLANEADA : Status.CONCLUIDA)}
                    className={`px-8 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all ${
                      activity.status === Status.CONCLUIDA ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white'
                    }`}
                  >
                    {activity.status === Status.CONCLUIDA ? 'Pago' : 'Marcar Pago'}
                  </button>
                  <button onClick={() => deleteActivity(activity.id)} className="p-5 text-slate-200 hover:text-rose-500 transition-colors">
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-40 text-center bg-white border-4 border-dashed border-slate-50 rounded-[56px] text-slate-300">
            <Calendar size={72} className="mx-auto mb-6 opacity-10" />
            <p className="font-black text-xl uppercase tracking-[4px]">Nenhum gasto planeado</p>
            <p className="mt-2 font-bold text-slate-400">Tudo sob controlo para este período.</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[64px] w-full max-w-2xl p-14 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={() => setIsAdding(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
              <X size={28} />
            </button>
            <h3 className="text-4xl font-black text-slate-900 mb-12 tracking-tight">Planear Atividade</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nome do Plano</label>
                  <input 
                    type="text" 
                    value={newActivity.name}
                    onChange={e => setNewActivity({...newActivity, name: e.target.value})}
                    className="w-full bg-slate-50 border-none px-8 py-6 rounded-[32px] font-black text-slate-900"
                    placeholder="Ex: Consultas Médicas"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Custo Estimado</label>
                  <input 
                    type="number" 
                    value={newActivity.costEstimate || ''}
                    onChange={e => setNewActivity({...newActivity, costEstimate: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none px-8 py-6 rounded-[32px] font-black text-indigo-600 text-2xl"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categoria</label>
                  <select 
                    value={newActivity.category}
                    onChange={e => setNewActivity({...newActivity, category: e.target.value as Category})}
                    className="w-full bg-slate-50 border-none px-8 py-6 rounded-[32px] font-black text-slate-900"
                  >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Fonte de Fundos (Conta)</label>
                  <select 
                    value={newActivity.accountId}
                    onChange={e => setNewActivity({...newActivity, accountId: e.target.value})}
                    className="w-full bg-slate-50 border-none px-8 py-6 rounded-[32px] font-black text-slate-900"
                  >
                    <option value="">Selecionar Conta...</option>
                    {state.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Prioridade do Gasto</label>
              <div className="flex gap-4">
                {Object.values(Priority).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setNewActivity({...newActivity, priority: p})}
                    className={`flex-1 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                      newActivity.priority === p ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' : 'bg-transparent text-slate-400 border-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-12">
              <button 
                onClick={handleAdd}
                className="w-full bg-indigo-600 text-white py-7 rounded-[32px] font-black text-xs uppercase tracking-[3px] shadow-2xl hover:scale-105 transition-all"
              >
                Confirmar Planeamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
