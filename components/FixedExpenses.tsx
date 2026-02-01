
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
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Despesas Fixas</h3>
          <p className="text-slate-500 text-sm">Limite: {formatKz(settings.fixedExpensesLimit)}</p>
        </div>
        <div className="text-right w-full sm:w-auto">
          <p className={`text-2xl font-black ${isOverLimit ? 'text-rose-600' : 'text-slate-800'}`}>
            {formatKz(totalFixed)}
          </p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Total Ativo</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-bold text-slate-700">Listagem</h4>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors text-xs font-bold shadow-md"
          >
            <Plus size={16} />
            Nova
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.fixedExpenses.map(expense => (
                <tr key={expense.id} className={`hover:bg-slate-50 ${!expense.active ? 'opacity-50 grayscale' : ''}`}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleExpense(expense.id)}>
                      {expense.active ? <ToggleRight size={28} className="text-indigo-600" /> : <ToggleLeft size={28} className="text-slate-300" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{expense.name}</td>
                  <td className="px-6 py-4 text-xs font-semibold">{expense.category}</td>
                  <td className="px-6 py-4 text-right font-black">{formatKz(expense.value)}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => deleteExpense(expense.id)} className="text-rose-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-slate-100">
          {state.fixedExpenses.map(expense => (
            <div key={expense.id} className={`p-4 flex flex-col gap-3 ${!expense.active ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800">{expense.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{expense.category}</p>
                </div>
                <p className="font-black text-slate-800">{formatKz(expense.value)}</p>
              </div>
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => toggleExpense(expense.id)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500"
                >
                  {expense.active ? <ToggleRight size={24} className="text-indigo-600" /> : <ToggleLeft size={24} className="text-slate-300" />}
                  {expense.active ? 'Ativo' : 'Pausado'}
                </button>
                <button onClick={() => deleteExpense(expense.id)} className="p-2 text-rose-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {state.fixedExpenses.length === 0 && (
          <div className="py-12 text-center text-slate-400 italic text-sm">Nenhuma despesa registada.</div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Nova Despesa Fixa</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome</label>
                <input 
                  type="text" 
                  value={newExpense.name}
                  onChange={e => setNewExpense({...newExpense, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor (Kz)</label>
                  <input 
                    type="number" 
                    value={newExpense.value || ''}
                    onChange={e => setNewExpense({...newExpense, value: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoria</label>
                  <select 
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value as FixedCategory})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                  >
                    {Object.values(FixedCategory).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-full px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAdd}
                  className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedExpenses;
