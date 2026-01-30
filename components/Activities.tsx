
import React, { useState } from 'react';
import { AppState, FinancialActivity, Category, Priority, Status } from '../types';
import { formatKz, getCurrentMonthStr, getMonthYear } from '../utils';
import { Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Calendar, Info } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Activities: React.FC<Props> = ({ state, updateState }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { settings } = state;
  const [newActivity, setNewActivity] = useState<Partial<FinancialActivity>>({
    name: '',
    category: Category.PESSOAL,
    subcategory: '',
    costEstimate: 0,
    plannedMonth: getCurrentMonthStr(),
    priority: Priority.MEDIA,
    status: Status.PLANEADA,
    observations: ''
  });

  const checkHighCostViolation = (month: string, category: Category, currentId?: string) => {
    const highCostInMonth = state.activities.filter(a => 
      a.plannedMonth === month && 
      a.category === category && 
      a.costEstimate >= settings.highCostThreshold &&
      a.id !== currentId
    );
    return highCostInMonth.length >= 1;
  };

  const handleAdd = () => {
    if (!newActivity.name || !newActivity.costEstimate || !newActivity.plannedMonth) return;

    if (newActivity.costEstimate >= settings.highCostThreshold) {
      if (checkHighCostViolation(newActivity.plannedMonth!, newActivity.category!)) {
        alert(`Regra de Ouro: Máximo de uma atividade de alto custo (>= ${formatKz(settings.highCostThreshold)}) por categoria (${newActivity.category}) no mesmo mês.`);
        return;
      }
    }

    // Check budget
    const monthActivitiesTotal = state.activities
      .filter(a => a.plannedMonth === newActivity.plannedMonth)
      .reduce((acc, curr) => acc + curr.costEstimate, 0);
    
    const activeFixedTotal = state.fixedExpenses
      .filter(e => e.active)
      .reduce((acc, curr) => acc + curr.value, 0);

    if (monthActivitiesTotal + activeFixedTotal + (newActivity.costEstimate || 0) > settings.monthlyBudgetLimit) {
      if (!confirm(`O total de despesas planeadas para este mês ultrapassa o orçamento disponível (${formatKz(settings.monthlyBudgetLimit)}). Deseja continuar mesmo assim?`)) {
        return;
      }
    }

    updateState(prev => ({
      ...prev,
      activities: [...prev.activities, {
        ...newActivity as FinancialActivity,
        id: Math.random().toString(36).substr(2, 9)
      }]
    }));
    setIsAdding(false);
    setNewActivity({
      name: '',
      category: Category.PESSOAL,
      subcategory: '',
      costEstimate: 0,
      plannedMonth: getCurrentMonthStr(),
      priority: Priority.MEDIA,
      status: Status.PLANEADA,
      observations: ''
    });
  };

  const deleteActivity = (id: string) => {
    updateState(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== id)
    }));
  };

  const updateStatus = (id: string, status: Status) => {
    updateState(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === id ? { ...a, status } : a)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Atividades Financeiras</h3>
          <p className="text-slate-500 text-sm">Planeie projetos de vida de forma organizada.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Planear Atividade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.activities.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhuma atividade planeada.</p>
            <p className="text-sm">Clique no botão acima para começar o seu planeamento.</p>
          </div>
        )}
        
        {state.activities.sort((a, b) => a.plannedMonth.localeCompare(b.plannedMonth)).map(activity => (
          <div key={activity.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                  activity.priority === Priority.ALTA ? 'bg-rose-100 text-rose-600' :
                  activity.priority === Priority.MEDIA ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {activity.priority}
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {getMonthYear(activity.plannedMonth)}
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 line-clamp-1">{activity.name}</h4>
              <p className="text-xs text-slate-400 mb-4">{activity.category} • {activity.subcategory}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-500">Custo:</span>
                <span className="text-lg font-black text-slate-800">{formatKz(activity.costEstimate)}</span>
                {/* Fixed: Wrapped AlertCircle in a span to use the title attribute correctly */}
                {activity.costEstimate >= settings.highCostThreshold && (
                  <span title="Alto Custo">
                    <AlertCircle size={14} className="text-rose-500" />
                  </span>
                )}
              </div>

              {activity.observations && (
                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 italic mb-4">
                  "{activity.observations}"
                </div>
              )}
            </div>

            <div className="px-5 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
              <select 
                value={activity.status}
                onChange={e => updateStatus(activity.id, e.target.value as Status)}
                className="text-xs font-bold bg-transparent border-none focus:ring-0 text-slate-600 cursor-pointer"
              >
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex gap-2">
                <button 
                  onClick={() => deleteActivity(activity.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Planear Nova Atividade</h3>
              <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">REGRAS ATIVAS</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome da Atividade</label>
                  <input 
                    type="text" 
                    value={newActivity.name}
                    onChange={e => setNewActivity({...newActivity, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Revisão do motor"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoria</label>
                    <select 
                      value={newActivity.category}
                      onChange={e => setNewActivity({...newActivity, category: e.target.value as Category})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                    >
                      {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subcategoria</label>
                    <input 
                      type="text" 
                      value={newActivity.subcategory}
                      onChange={e => setNewActivity({...newActivity, subcategory: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      placeholder="Ex: Segurança"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Custo Estimado (Kz)</label>
                  <input 
                    type="number" 
                    value={newActivity.costEstimate || ''}
                    onChange={e => setNewActivity({...newActivity, costEstimate: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold"
                  />
                  {newActivity.costEstimate! >= settings.highCostThreshold && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">Atividade de Alto Custo - Verificação de Regras Ativa</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mês Planeado</label>
                  <input 
                    type="month" 
                    value={newActivity.plannedMonth}
                    onChange={e => setNewActivity({...newActivity, plannedMonth: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prioridade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(Priority).map(p => (
                      <button
                        key={p}
                        onClick={() => setNewActivity({...newActivity, priority: p})}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          newActivity.priority === p 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações</label>
                  <textarea 
                    value={newActivity.observations}
                    onChange={e => setNewActivity({...newActivity, observations: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-[100px]"
                    placeholder="Detalhes adicionais..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 border-t border-slate-100 pt-6">
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                Descartar
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100"
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
