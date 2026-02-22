
import React, { useState, useEffect } from 'react';
import { AppState, Account, Transaction, TransactionType, Category, Status } from '../types';
import { formatKz, formatEur, convertToKz } from '../utils';
import { EUR_TO_AOA_RATE } from '../constants';
import { 
  Plus, 
  Minus, 
  ArrowRightLeft, 
  Wallet, 
  CreditCard, 
  ChevronRight, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown,
  X,
  PlusCircle,
  Eye,
  EyeOff,
  Settings2,
  Trash2,
  AlertCircle,
  Coins,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

const Dashboard: React.FC<Props> = ({ state, updateState, onAddTransaction }) => {
  const [showOpModal, setShowOpModal] = useState<TransactionType | null>(null);
  const [showAccModal, setShowAccModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Onboarding: Se não houver contas, abrir modal de criação
  useEffect(() => {
    if (state.accounts.length === 0) {
      const timer = setTimeout(() => setShowAccModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [state.accounts.length]);

  const handleOpClick = (type: TransactionType) => {
    if (state.accounts.length === 0) {
      alert("Crie uma carteira primeiro para poder registar movimentos.");
      setShowAccModal(true);
      return;
    }
    setShowOpModal(type);
  };

  // Balanço Consolidado (Tudo convertido para Kz)
  const totalBalanceKz = state.accounts
    .filter(a => a.includeInTotal)
    .reduce((acc, curr) => acc + convertToKz(curr.balance, curr.currency), 0);

  // Reserva Ativa Consolidada (Kz + EUR convertido)
  const activeReserveKz = state.accounts
    .filter(a => a.isSavingsAccount)
    .reduce((acc, curr) => acc + convertToKz(curr.balance, curr.currency), 0);

  const handleAddAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAcc: Account = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      currency: formData.get('currency') as 'Kz' | 'EUR',
      balance: Number(formData.get('balance')),
      includeInTotal: true,
      isSavingsAccount: false,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    updateState(prev => ({ ...prev, accounts: [...prev.accounts, newAcc] }));
    setShowAccModal(false);
  };

  const handleUpdateAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAccount) return;
    const formData = new FormData(e.currentTarget);
    const updatedBalance = Number(formData.get('balance'));
    
    updateState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === editingAccount.id ? {
        ...a,
        name: formData.get('name') as string,
        currency: formData.get('currency') as 'Kz' | 'EUR',
        balance: updatedBalance,
        includeInTotal: formData.get('includeInTotal') === 'on',
        isSavingsAccount: formData.get('isSavingsAccount') === 'on',
      } : a)
    }));
    setEditingAccount(null);
  };

  const deleteAccount = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta conta? Todos os dados associados serão perdidos.")) {
      updateState(prev => ({
        ...prev,
        accounts: prev.accounts.filter(a => a.id !== id)
      }));
      setEditingAccount(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Top Section: Consolidated Balance */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl md:rounded-[48px] p-6 md:p-14 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[120px] opacity-20 -mr-40 -mt-40"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div>
              <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[3px] mb-2">Património Consolidado (Est.)</p>
              <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter">
                  {isBalanceVisible ? formatKz(totalBalanceKz) : "••••••"}
                </h1>
                <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="text-white/40 hover:text-white transition-colors">
                  {isBalanceVisible ? <Eye size={24} /> : <EyeOff size={24} />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <RefreshCw size={12} /> Câmbio BAI: 1€ = {formatKz(EUR_TO_AOA_RATE)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 md:px-10 py-4 md:py-6 rounded-2xl md:rounded-[40px] border border-white/10 w-full lg:w-auto">
              <p className="text-[10px] font-bold text-white/50 uppercase mb-2 tracking-widest">Reserva Ativa Total</p>
              <p className="text-2xl md:text-3xl font-black text-emerald-400">
                {isBalanceVisible ? formatKz(activeReserveKz) : "••••••"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-12">
            <button onClick={() => handleOpClick(TransactionType.INCOME)} className="flex-1 bg-white text-slate-900 py-4 md:py-5 rounded-2xl md:rounded-[28px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg">
              <Plus size={18} className="text-emerald-500" /> Receita
            </button>
            <button onClick={() => handleOpClick(TransactionType.EXPENSE)} className="flex-1 bg-white text-slate-900 py-4 md:py-5 rounded-2xl md:rounded-[28px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg">
              <Minus size={18} className="text-rose-500" /> Despesa
            </button>
            <button onClick={() => handleOpClick(TransactionType.TRANSFER)} className="flex-1 bg-white/10 text-white py-4 md:py-5 rounded-2xl md:rounded-[28px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
              <ArrowRightLeft size={18} /> Transferir
            </button>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <CreditCard className="text-indigo-600" />
            Minhas Carteiras
          </h3>
          <button onClick={() => setShowAccModal(true)} className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-6 py-3 rounded-2xl hover:bg-indigo-100 transition-all">
            <PlusCircle size={18} /> Nova Conta
          </button>
        </div>
        
        <div className="flex flex-wrap gap-6 pb-6 scrollbar-hide">
          {state.accounts.map(acc => (
            <button 
              key={acc.id} 
              onClick={() => setEditingAccount(acc)}
              className="flex-1 min-w-[280px] md:min-w-[320px] bg-white p-6 md:p-10 rounded-3xl md:rounded-[56px] border border-slate-100 shadow-sm relative group text-left hover:shadow-2xl hover:-translate-y-2 transition-all"
            >
              <div className="absolute top-6 right-6 md:top-8 md:right-8 flex gap-3">
                {acc.isSavingsAccount && (
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-sm" title="Reserva Ativa">
                    <Coins size={18} />
                  </div>
                )}
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${acc.includeInTotal ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                  <ShieldCheck size={18} />
                </div>
              </div>

              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] mb-6 md:mb-8 flex items-center justify-center" style={{ backgroundColor: (acc.color || '#6366f1') + '15', color: acc.color }}>
                <Wallet size={24} md:size={32} />
              </div>
              
              <h4 className="font-black text-slate-800 text-xl md:text-2xl mb-1">{acc.name}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 md:mb-8">{acc.currency === 'Kz' ? 'Kwanza Angolano' : 'Euro Continental'}</p>
              
              <div className="flex items-end justify-between border-t border-slate-50 pt-4 md:pt-6">
                <div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                    {isBalanceVisible ? (acc.currency === 'Kz' ? formatKz(acc.balance) : formatEur(acc.balance)) : "••••••"}
                  </p>
                  {acc.currency === 'EUR' && isBalanceVisible && (
                    <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase">≈ {formatKz(convertToKz(acc.balance, 'EUR'))}</p>
                  )}
                </div>
                <Settings2 size={18} className="text-slate-200 group-hover:text-indigo-600 transition-colors mb-2" />
              </div>
            </button>
          ))}
          {state.accounts.length === 0 && (
            <div className="w-full py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-3xl text-slate-300">
              <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-black text-sm uppercase tracking-widest">Nenhuma carteira ativa</p>
              <button onClick={() => setShowAccModal(true)} className="mt-4 text-indigo-600 font-bold text-xs underline">Criar minha primeira carteira</button>
            </div>
          )}
        </div>
      </section>

      {/* Account Edit/Adjust Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[64px] w-full max-w-xl p-14 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={() => setEditingAccount(null)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"><X size={28} /></button>
            
            <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-20 rounded-[32px] flex items-center justify-center" style={{ backgroundColor: (editingAccount.color || '#6366f1') + '20', color: editingAccount.color }}>
                <Wallet size={40} />
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Gestão de Conta</h3>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Personalização e Reajuste</p>
              </div>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-10">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Nome de Exibição</label>
                <input required name="name" defaultValue={editingAccount.name} className="w-full bg-slate-50 border-none px-8 py-6 rounded-[32px] font-black text-slate-900 text-lg focus:ring-4 focus:ring-indigo-100 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Moeda Principal</label>
                  <select name="currency" defaultValue={editingAccount.currency} className="w-full bg-slate-50 border-none px-8 py-6 rounded-[32px] font-black">
                    <option value="Kz">Kwanza (Kz)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Saldo (Reajuste Direto)</label>
                  <input required name="balance" type="number" step="0.01" defaultValue={editingAccount.balance} className="w-full bg-slate-50 border-none px-8 py-6 rounded-[32px] font-black text-indigo-600 text-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center gap-5 bg-slate-50 p-7 rounded-[40px] cursor-pointer hover:bg-slate-100 transition-all">
                  <input type="checkbox" name="includeInTotal" defaultChecked={editingAccount.includeInTotal} className="w-7 h-7 rounded-xl text-indigo-600 focus:ring-indigo-500" />
                  <div>
                    <p className="font-black text-slate-900 text-sm">Contabilizar</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Soma ao balanço total</p>
                  </div>
                </label>

                <label className="flex items-center gap-5 bg-emerald-50/50 p-7 rounded-[40px] cursor-pointer hover:bg-emerald-50 transition-all border border-emerald-100/50">
                  <input type="checkbox" name="isSavingsAccount" defaultChecked={editingAccount.isSavingsAccount} className="w-7 h-7 rounded-xl text-emerald-600 focus:ring-emerald-500" />
                  <div>
                    <p className="font-black text-emerald-900 text-sm">Poupança</p>
                    <p className="text-[9px] font-bold text-emerald-400 uppercase">Reserva Financeira</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => deleteAccount(editingAccount.id)} className="p-7 bg-rose-50 text-rose-500 rounded-[32px] hover:bg-rose-100 transition-all shadow-sm">
                  <Trash2 size={28} />
                </button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-7 rounded-[32px] font-black text-xs uppercase tracking-[3px] shadow-2xl hover:scale-[1.02] transition-all">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showOpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="bg-white rounded-3xl md:rounded-[64px] w-full max-w-xl p-6 md:p-14 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowOpModal(null)} className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-300 hover:text-slate-900 transition-colors"><X size={28} /></button>
            
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
              <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[32px] flex items-center justify-center ${
                showOpModal === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-500' : 
                showOpModal === TransactionType.EXPENSE ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'
              }`}>
                {showOpModal === TransactionType.INCOME ? <Plus size={32} /> : 
                 showOpModal === TransactionType.EXPENSE ? <Minus size={32} /> : <ArrowRightLeft size={32} />}
              </div>
              <div>
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                  {showOpModal === TransactionType.INCOME ? 'Nova Receita' : 
                   showOpModal === TransactionType.EXPENSE ? 'Nova Despesa' : 'Nova Transferência'}
                </h3>
                <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-widest">Registo de Movimentação</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              onAddTransaction({
                description: formData.get('description') as string,
                amount: Number(formData.get('amount')),
                date: new Date().toISOString(),
                type: showOpModal,
                category: formData.get('category') as Category,
                accountId: formData.get('accountId') as string,
                toAccountId: formData.get('toAccountId') as string || undefined,
                status: Status.CONCLUIDA
              });
              setShowOpModal(null);
            }} className="space-y-6 md:space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 md:mb-4">Descrição</label>
                <input required name="description" className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 text-base md:text-lg focus:ring-4 focus:ring-indigo-100 transition-all" placeholder="Ex: Salário Mensal" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 md:mb-4">Valor</label>
                  <input required name="amount" type="number" step="0.01" className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 text-base md:text-lg" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 md:mb-4">Categoria</label>
                  <select name="category" className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black">
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 md:mb-4">
                    {showOpModal === TransactionType.TRANSFER ? 'Conta de Origem' : 'Conta'}
                  </label>
                  <select required name="accountId" className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black">
                    <option value="">Selecionar...</option>
                    {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                  </select>
                </div>
                {showOpModal === TransactionType.TRANSFER && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 md:mb-4">Conta de Destino</label>
                    <select required name="toAccountId" className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black">
                      <option value="">Selecionar...</option>
                      {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                    </select>
                  </div>
                )}
              </div>

              <button type="submit" className={`w-full py-5 md:py-7 rounded-2xl md:rounded-[32px] font-black text-xs uppercase tracking-[3px] shadow-2xl hover:scale-[1.02] transition-all text-white ${
                showOpModal === TransactionType.INCOME ? 'bg-emerald-600' : 
                showOpModal === TransactionType.EXPENSE ? 'bg-rose-600' : 'bg-indigo-600'
              }`}>
                Confirmar Operação
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Outros modais simplificados para brevity, mantendo estrutura original do user */}
      {showAccModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="bg-white rounded-3xl md:rounded-[56px] w-full max-w-lg p-6 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={() => setShowAccModal(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 md:mb-10 tracking-tight">Criar Nova Carteira</h3>
            <form onSubmit={handleAddAccount} className="space-y-6 md:space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">Nome da Conta / Banco</label>
                <input required name="name" className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black" placeholder="Ex: Conta Corrente" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">Moeda</label>
                  <select name="currency" className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black">
                    <option value="Kz">Kwanza (Kz)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">Saldo Inicial</label>
                  <input required name="balance" type="number" step="0.01" className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black" placeholder="0" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 md:py-6 rounded-2xl md:rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Ativar Carteira</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
