
import React, { useState } from 'react';
import { AppState, FinancialActivity, Category, Priority, Status, TransactionType, Transaction } from '../types';
import { formatKz, formatEur, getCurrentMonthStr, getMonthYear } from '../utils';
import { Plus, Trash2, Calendar, AlertCircle, ChevronDown, CheckCircle, Clock, Wallet, X, Edit2, RotateCcw } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Activities: React.FC<Props> = ({ state, updateState }) => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isAdding, setIsAdding] = useState(false);
  const [editingActivity, setEditingActivity] = useState<FinancialActivity | null>(null);
  
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

  const handleEdit = () => {
    if (!editingActivity || !editingActivity.name || !editingActivity.costEstimate || !editingActivity.accountId) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    updateState(prev => {
      // Se a atividade já estava paga, precisamos atualizar a transação associada
      let updatedTransactions = [...prev.transactions];
      let updatedAccounts = [...prev.accounts];

      if (editingActivity.status === Status.CONCLUIDA && editingActivity.transactionId) {
        const oldActivity = prev.activities.find(a => a.id === editingActivity.id);
        if (oldActivity) {
          updatedTransactions = updatedTransactions.map(t => {
            if (t.id === editingActivity.transactionId) {
              return {
                ...t,
                description: `Pagamento: ${editingActivity.name}`,
                amount: editingActivity.costEstimate,
                category: editingActivity.category,
                accountId: editingActivity.accountId!
              };
            }
            return t;
          });

          // Ajustar saldos se a conta ou valor mudou
          if (oldActivity.accountId !== editingActivity.accountId || oldActivity.costEstimate !== editingActivity.costEstimate) {
            updatedAccounts = updatedAccounts.map(acc => {
              if (acc.id === oldActivity.accountId) {
                return { ...acc, balance: acc.balance + oldActivity.costEstimate };
              }
              return acc;
            });
            updatedAccounts = updatedAccounts.map(acc => {
              if (acc.id === editingActivity.accountId) {
                return { ...acc, balance: acc.balance - editingActivity.costEstimate };
              }
              return acc;
            });
          }
        }
      }

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: updatedTransactions,
        activities: prev.activities.map(a => a.id === editingActivity.id ? editingActivity : a)
      };
    });
    setEditingActivity(null);
  };

  const togglePayment = (activity: FinancialActivity) => {
    const isPaying = activity.status !== Status.CONCLUIDA;
    
    updateState(prev => {
      let updatedTransactions = [...prev.transactions];
      let updatedAccounts = [...prev.accounts];
      let transactionId = activity.transactionId;

      if (isPaying) {
        // Criar transação
        transactionId = Math.random().toString(36).substr(2, 9);
        const newTransaction: Transaction = {
          id: transactionId,
          description: `Pagamento: ${activity.name}`,
          amount: activity.costEstimate,
          date: new Date().toISOString(),
          type: TransactionType.EXPENSE,
          category: activity.category,
          accountId: activity.accountId!,
          status: Status.CONCLUIDA
        };
        updatedTransactions = [newTransaction, ...updatedTransactions];
        
        // Atualizar saldo
        updatedAccounts = updatedAccounts.map(acc => 
          acc.id === activity.accountId ? { ...acc, balance: acc.balance - activity.costEstimate } : acc
        );
      } else {
        // Reverter: Remover transação
        updatedTransactions = updatedTransactions.filter(t => t.id !== activity.transactionId);
        
        // Devolver saldo
        updatedAccounts = updatedAccounts.map(acc => 
          acc.id === activity.accountId ? { ...acc, balance: acc.balance + activity.costEstimate } : acc
        );
        transactionId = undefined;
      }

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: updatedTransactions,
        activities: prev.activities.map(a => a.id === activity.id ? { 
          ...a, 
          status: isPaying ? Status.CONCLUIDA : Status.PLANEADA,
          transactionId
        } : a)
      };
    });
  };

  const deleteActivity = (id: string) => {
    const activity = state.activities.find(a => a.id === id);
    if (!activity) return;

    if(confirm("Eliminar esta atividade? Se estiver paga, a transação também será removida.")) {
      updateState(prev => {
        let updatedTransactions = [...prev.transactions];
        let updatedAccounts = [...prev.accounts];

        if (activity.status === Status.CONCLUIDA && activity.transactionId) {
          updatedTransactions = updatedTransactions.filter(t => t.id !== activity.transactionId);
          updatedAccounts = updatedAccounts.map(acc => 
            acc.id === activity.accountId ? { ...acc, balance: acc.balance + activity.costEstimate } : acc
          );
        }

        return {
          ...prev,
          accounts: updatedAccounts,
          transactions: updatedTransactions,
          activities: prev.activities.filter(a => a.id !== id)
        };
      });
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm">
        <div className="space-y-2 md:space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Atividades</h2>
          <p className="text-slate-500 font-bold max-w-sm text-sm md:text-base">Planeie os seus gastos futuros associados a cada carteira.</p>
        </div>
        
        <div className="flex flex-col gap-2 md:gap-3 w-full md:w-auto">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Mês de Planeamento</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={e => {
              setSelectedMonth(e.target.value);
              setNewActivity(prev => ({ ...prev, plannedMonth: e.target.value }));
            }}
            className="px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[28px] bg-slate-50 border-none font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none text-sm md:text-base"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-4 md:px-6 gap-4">
        <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-[4px]">{getMonthYear(selectedMonth)}</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[28px] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <Plus size={18} md:size={20} />
          Planear Movimento
        </button>
      </div>

      <div className="space-y-4 md:space-y-6">
        {monthActivities.length > 0 ? monthActivities.map(activity => {
          const linkedAccount = state.accounts.find(a => a.id === activity.accountId);
          return (
            <div key={activity.id} className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[48px] border border-slate-50 shadow-sm hover:shadow-2xl transition-all flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 group">
              <div className="flex items-center gap-4 md:gap-8 w-full lg:w-auto">
                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[32px] flex items-center justify-center transition-all ${
                  activity.status === Status.CONCLUIDA ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
                }`}>
                  {activity.status === Status.CONCLUIDA ? <CheckCircle size={24} md:size={32} /> : <Clock size={24} md:size={32} />}
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900">{activity.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{activity.category}</span>
                    {linkedAccount && (
                      <span className="text-[8px] md:text-[9px] font-black bg-indigo-50 text-indigo-500 px-2 md:px-3 py-1 rounded-full flex items-center gap-1">
                        <Wallet size={10} /> {linkedAccount.name}
                      </span>
                    )}
                    <div className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                      activity.priority === Priority.ALTA ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {activity.priority}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-12 w-full lg:w-auto">
                <div className="text-center lg:text-right">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Estimado</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">
                    {linkedAccount?.currency === 'EUR' ? formatEur(activity.costEstimate) : formatKz(activity.costEstimate)}
                  </p>
                </div>

                <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => togglePayment(activity)}
                    className={`flex-1 sm:flex-none px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-[24px] font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activity.status === Status.CONCLUIDA ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white'
                    }`}
                  >
                    {activity.status === Status.CONCLUIDA ? (
                      <><RotateCcw size={14} /> Reverter</>
                    ) : (
                      <><CheckCircle size={14} /> Pagar</>
                    )}
                  </button>
                  <button 
                    onClick={() => setEditingActivity(activity)}
                    className="p-3 md:p-5 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 size={20} md:size={24} />
                  </button>
                  <button onClick={() => deleteActivity(activity.id)} className="p-3 md:p-5 text-slate-200 hover:text-rose-500 transition-colors">
                    <Trash2 size={20} md:size={24} />
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 md:py-40 text-center bg-white border-4 border-dashed border-slate-50 rounded-3xl md:rounded-[56px] text-slate-300">
            <Calendar size={48} md:size={72} className="mx-auto mb-4 md:mb-6 opacity-10" />
            <p className="font-black text-xl uppercase tracking-[4px]">Nenhum gasto planeado</p>
            <p className="mt-2 font-bold text-slate-400 text-sm md:text-base">Tudo sob controlo para este período.</p>
          </div>
        )}
      </div>

      {(isAdding || editingActivity) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="bg-white rounded-3xl md:rounded-[64px] w-full max-w-2xl p-6 md:p-14 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setIsAdding(false); setEditingActivity(null); }} 
              className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={28} />
            </button>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 md:mb-12 tracking-tight">
              {editingActivity ? 'Editar Atividade' : 'Planear Atividade'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-6 md:space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Nome do Plano</label>
                  <input 
                    type="text" 
                    value={editingActivity ? editingActivity.name : newActivity.name}
                    onChange={e => editingActivity 
                      ? setEditingActivity({...editingActivity, name: e.target.value})
                      : setNewActivity({...newActivity, name: e.target.value})
                    }
                    className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 text-sm md:text-base"
                    placeholder="Ex: Consultas Médicas"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">
                    {editingActivity?.status === Status.CONCLUIDA ? 'Valor Pago' : 'Custo Estimado'}
                  </label>
                  <input 
                    type="number" 
                    value={editingActivity ? editingActivity.costEstimate : (newActivity.costEstimate || '')}
                    onChange={e => editingActivity
                      ? setEditingActivity({...editingActivity, costEstimate: Number(e.target.value)})
                      : setNewActivity({...newActivity, costEstimate: Number(e.target.value)})
                    }
                    className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-indigo-600 text-xl md:text-2xl"
                  />
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Categoria</label>
                  <select 
                    value={editingActivity ? editingActivity.category : newActivity.category}
                    onChange={e => editingActivity
                      ? setEditingActivity({...editingActivity, category: e.target.value as Category})
                      : setNewActivity({...newActivity, category: e.target.value as Category})
                    }
                    className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 text-sm md:text-base"
                  >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Fonte de Fundos (Conta)</label>
                  <select 
                    value={editingActivity ? editingActivity.accountId : newActivity.accountId}
                    onChange={e => editingActivity
                      ? setEditingActivity({...editingActivity, accountId: e.target.value})
                      : setNewActivity({...newActivity, accountId: e.target.value})
                    }
                    className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 text-sm md:text-base"
                  >
                    <option value="">Selecionar Conta...</option>
                    {state.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-10">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Prioridade do Gasto</label>
              <div className="flex flex-wrap gap-2 md:gap-4">
                {Object.values(Priority).map(p => (
                  <button 
                    key={p} 
                    onClick={() => editingActivity
                      ? setEditingActivity({...editingActivity, priority: p})
                      : setNewActivity({...newActivity, priority: p})
                    }
                    className={`flex-1 py-4 md:py-5 rounded-xl md:rounded-[24px] font-black text-[9px] md:text-[10px] uppercase tracking-widest border-2 transition-all ${
                      (editingActivity ? editingActivity.priority === p : newActivity.priority === p) 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' 
                        : 'bg-transparent text-slate-400 border-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-8 md:pt-12">
              <button 
                onClick={editingActivity ? handleEdit : handleAdd}
                className="w-full bg-indigo-600 text-white py-5 md:py-7 rounded-2xl md:rounded-[32px] font-black text-xs uppercase tracking-[3px] shadow-2xl hover:scale-105 transition-all"
              >
                {editingActivity ? 'Guardar Alterações' : 'Confirmar Planeamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
