
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Resumo de Despesas Fixas</h3>
          <p className="text-slate-500 text-sm">Limite recomendado: {formatKz(settings.fixedExpensesLimit)}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black ${isOverLimit ? 'text-rose-600' : 'text-slate-800'}`}>
            {formatKz(totalFixed)}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Mensal Ativo</p>
        </div>
      </div>

      {isOverLimit && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-700">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">O total das suas despesas fixas ultrapassou o limite sugerido de {formatKz(settings.fixedExpensesLimit)}.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-bold text-slate-700">Listagem de Despesas</h4>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-md shadow-indigo-100"
          >
            <Plus size={18} />
            Adicionar Despesa
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.fixedExpenses.map(expense => (
                <tr key={expense.id} className={`hover:bg-slate-50 transition-colors ${!expense.active ? 'opacity-50 grayscale' : ''}`}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleExpense(expense.id)} className="text-indigo-600">
                      {expense.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{expense.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-800">{formatKz(expense.value)}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => deleteExpense(expense.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {state.fixedExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Nenhuma despesa fixa registada. Comece por adicionar uma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Nova Despesa Fixa</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome da Despesa</label>
                <input 
                  type="text" 
                  value={newExpense.name}
                  onChange={e => setNewExpense({...newExpense, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Aluguel"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor (Kz)</label>
                  <input 
                    type="number" 
                    value={newExpense.value || ''}
                    onChange={e => setNewExpense({...newExpense, value: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoria</label>
                  <select 
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value as FixedCategory})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    {Object.values(FixedCategory).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
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
