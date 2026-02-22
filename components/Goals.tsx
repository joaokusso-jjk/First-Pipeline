
import React, { useState } from 'react';
import { AppState, Goal, Category } from '../types';
import { formatKz, formatEur } from '../utils';
import { Plus, Target, Calendar, Trash2, Sparkles, X, Wallet } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Goals: React.FC<Props> = ({ state, updateState }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    category: Category.INVESTIMENTOS,
    accountId: ''
  });

  const handleAdd = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.accountId) {
      alert("Por favor, preencha o nome, o valor alvo e selecione uma conta vinculada.");
      return;
    }
    updateState(prev => ({
      ...prev,
      goals: [...(prev.goals || []), {
        ...newGoal as Goal,
        id: Math.random().toString(36).substr(2, 9),
        color: '#6366f1'
      }]
    }));
    setIsAdding(false);
    setNewGoal({ name: '', targetAmount: 0, currentAmount: 0, deadline: '', category: Category.INVESTIMENTOS, accountId: '' });
  };

  const deleteGoal = (id: string) => {
    if (confirm("Deseja eliminar esta meta permanentemente?")) {
      updateState(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Suas Metas</h2>
          <p className="text-slate-500 font-bold mt-2 text-sm md:text-base">Cada Kwanza guardado tem um destino planeado.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white p-5 md:p-6 rounded-2xl md:rounded-[32px] shadow-2xl hover:scale-110 transition-all active:scale-95 flex items-center justify-center gap-3 font-black text-[10px] md:text-xs uppercase tracking-widest"
        >
          <Plus size={20} md:size={24} /> Novo Objetivo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {state.goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const linkedAccount = state.accounts.find(a => a.id === goal.accountId);
          
          return (
            <div key={goal.id} className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[48px] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div className="p-3 md:p-4 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-[20px]">
                    <Target size={24} md:size={28} />
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="text-slate-200 hover:text-rose-500 transition-colors">
                    <Trash2 size={18} md:size={20} />
                  </button>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-1">{goal.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{goal.category}</span>
                  {linkedAccount && (
                    <span className="text-[8px] md:text-[9px] font-black bg-slate-100 text-slate-500 px-2 md:px-3 py-1 rounded-full flex items-center gap-1">
                      <Wallet size={10} /> {linkedAccount.name}
                    </span>
                  )}
                </div>
                
                <div className="space-y-4 md:space-y-5">
                  <div className="flex justify-between items-end">
                    <p className="text-2xl md:text-3xl font-black text-slate-900">
                      {linkedAccount?.currency === 'EUR' ? formatEur(goal.currentAmount) : formatKz(goal.currentAmount)}
                    </p>
                    <p className="text-xs md:text-sm font-black text-indigo-600">{progress.toFixed(0)}%</p>
                  </div>
                  <div className="h-3 md:h-4 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                    <span>Falta: {linkedAccount?.currency === 'EUR' ? formatEur(goal.targetAmount - goal.currentAmount) : formatKz(goal.targetAmount - goal.currentAmount)}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {goal.deadline || 'Sem data'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {state.goals.length === 0 && (
          <div className="col-span-full py-20 md:py-40 text-center bg-white border-4 border-dashed border-slate-50 rounded-3xl md:rounded-[56px] text-slate-300">
            <Sparkles size={48} md:size={64} className="mx-auto mb-4 md:mb-6 opacity-20" />
            <p className="font-black text-lg md:text-xl uppercase tracking-[4px]">Dê vida aos seus sonhos</p>
            <p className="mt-2 font-bold text-slate-400 text-sm md:text-base">Clique no botão "Novo Objetivo" para começar.</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="bg-white rounded-3xl md:rounded-[64px] w-full max-w-xl p-6 md:p-14 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-300 hover:text-slate-900 transition-colors">
              <X size={28} />
            </button>
            
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 md:mb-12 tracking-tight">Novo Objetivo</h3>
            
            <div className="space-y-6 md:space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Nome da Meta</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newGoal.name}
                  onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                  className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 text-base md:text-lg focus:ring-4 focus:ring-indigo-100 transition-all"
                  placeholder="Ex: Reserva p/ Carro"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Valor Alvo</label>
                  <input 
                    type="number" 
                    value={newGoal.targetAmount || ''}
                    onChange={e => setNewGoal({...newGoal, targetAmount: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Depósito Inicial</label>
                  <input 
                    type="number" 
                    value={newGoal.currentAmount || ''}
                    onChange={e => setNewGoal({...newGoal, currentAmount: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Categoria</label>
                  <select 
                    value={newGoal.category}
                    onChange={e => setNewGoal({...newGoal, category: e.target.value as Category})}
                    className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Conta de Reserva</label>
                  <select 
                    value={newGoal.accountId}
                    onChange={e => setNewGoal({...newGoal, accountId: e.target.value})}
                    className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">Selecionar Conta...</option>
                    {state.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6 md:pt-10">
                <button 
                  onClick={handleAdd}
                  className="w-full bg-slate-900 text-white py-5 md:py-7 rounded-2xl md:rounded-[32px] font-black text-xs uppercase tracking-[3px] shadow-2xl hover:scale-105 transition-all active:scale-95"
                >
                  Confirmar Meta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
