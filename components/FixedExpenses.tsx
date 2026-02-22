
import React, { useState } from 'react';
import { AppState, FixedExpense, FixedCategory } from '../types';
import { formatKz } from '../utils';
import { Plus, Trash2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const FixedExpenses: React.FC<Props> = ({ state, updateState }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { settings } = state;
  const [newExpense, setNewExpense] = useState<Partial<FixedExpense>>({
    name: '',
    value: 0,
    category: FixedCategory.OUTROS,
    active: true
  });

  const totalFixed = state.fixedExpenses
    .filter(e => e.active)
    .reduce((acc, curr) => acc + curr.value, 0);

  const isOverLimit = totalFixed > settings.fixedExpensesLimit;

  const handleAdd = () => {
    if (!newExpense.name || !newExpense.value) return;
    
    updateState(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, { 
        ...newExpense as FixedExpense, 
        id: Math.random().toString(36).substr(2, 9) 
      }]
    }));
    setNewExpense({ name: '', value: 0, category: FixedCategory.OUTROS, active: true });
    setIsAdding(false);
  };

  const toggleExpense = (id: string) => {
    updateState(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(e => e.id === id ? { ...e, active: !e.active } : e)
    }));
  };

  const deleteExpense = (id: string) => {
    updateState(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter(e => e.id !== id)
    }));
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Despesas Fixas</h2>
          <p className="text-slate-500 font-bold mt-2 text-sm md:text-base">Custos recorrentes que mantêm a sua vida a funcionar.</p>
        </div>
        <div className="bg-indigo-50 px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] border border-indigo-100 w-full md:w-auto">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Ativo</p>
          <p className={`text-2xl md:text-3xl font-black ${isOverLimit ? 'text-rose-500' : 'text-indigo-600'}`}>
            {formatKz(totalFixed)}
          </p>
          <p className="text-[9px] font-bold text-indigo-300 mt-1 uppercase">Limite: {formatKz(settings.fixedExpensesLimit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {/* Form to add */}
        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm space-y-8 md:space-y-10">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
            <Plus className="text-indigo-600" /> Novo Compromisso
          </h3>
          
          <div className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Nome da Despesa</label>
              <input 
                type="text" 
                value={newExpense.name}
                onChange={e => setNewExpense({...newExpense, name: e.target.value})}
                className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-slate-900 text-sm md:text-base"
                placeholder="Ex: Renda da Casa"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Valor (Kz)</label>
                <input 
                  type="number" 
                  value={newExpense.value || ''}
                  onChange={e => setNewExpense({...newExpense, value: Number(e.target.value)})}
                  className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-slate-900 text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Categoria</label>
                <select 
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value as FixedCategory})}
                  className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-slate-900 text-sm md:text-base"
                >
                  {Object.values(FixedCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button 
              onClick={handleAdd}
              className="w-full bg-slate-900 text-white py-5 md:py-7 rounded-2xl md:rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
            >
              Registar Despesa
            </button>
          </div>
        </div>

        {/* List of expenses */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {state.fixedExpenses.map(expense => (
            <div key={expense.id} className={`bg-white p-6 md:p-10 rounded-3xl md:rounded-[48px] border border-slate-50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8 transition-all ${!expense.active ? 'opacity-50 grayscale' : 'hover:shadow-2xl'}`}>
              <div className="flex items-center gap-4 md:gap-8 w-full sm:w-auto">
                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[32px] flex items-center justify-center ${expense.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  {expense.active ? <ToggleRight size={24} md:size={32} /> : <ToggleLeft size={24} md:size={32} />}
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900">{expense.name}</h4>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{expense.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 md:gap-12 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-black text-slate-900">{formatKz(expense.value)}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest">Mensal</p>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <button 
                    onClick={() => toggleExpense(expense.id)}
                    className={`p-3 md:p-5 rounded-xl md:rounded-[24px] transition-all ${expense.active ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {expense.active ? <ToggleRight size={20} md:size={24} /> : <ToggleLeft size={20} md:size={24} />}
                  </button>
                  <button onClick={() => deleteExpense(expense.id)} className="p-3 md:p-5 text-slate-200 hover:text-rose-500 transition-colors">
                    <Trash2 size={20} md:size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {state.fixedExpenses.length === 0 && (
            <div className="py-20 md:py-40 text-center bg-white border-4 border-dashed border-slate-50 rounded-3xl md:rounded-[56px] text-slate-300">
              <Plus size={48} md:size={72} className="mx-auto mb-4 md:mb-6 opacity-10" />
              <p className="font-black text-lg md:text-xl uppercase tracking-[4px]">Sem despesas fixas</p>
              <p className="mt-2 font-bold text-slate-400 text-sm md:text-base">Adicione os seus compromissos mensais.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixedExpenses;
