
import React, { useState } from 'react';
import { AppState, Account, TransactionType, Category, Status } from '../types';
import { formatKz, formatEur, convertToKz } from '../utils';
import { EUR_TO_AOA_RATE } from '../constants';
import { Shield, TrendingUp, ArrowRight, Coins, History, CheckCircle2, AlertCircle, Wallet, RefreshCw } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Savings: React.FC<Props> = ({ state, updateState }) => {
  const [amount, setAmount] = useState<number>(0);
  const [targetAccountId, setTargetAccountId] = useState<string>('');
  
  const allAccounts = state.accounts;
  const savingsAccounts = allAccounts.filter(a => a.isSavingsAccount);
  
  // Reserva Consolidada (Somando Kz e EUR convertido)
  const totalReserveKz = savingsAccounts.reduce((acc, curr) => acc + convertToKz(curr.balance, curr.currency), 0);

  const toggleSavingsAccount = (id: string) => {
    updateState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === id ? { ...a, isSavingsAccount: !a.isSavingsAccount } : a)
    }));
  };

  const handleDepositToReserve = () => {
    const account = allAccounts.find(a => a.id === targetAccountId);
    if (!account || amount <= 0) {
      return alert("Selecione uma conta de destino e insira um valor válido.");
    }
    
    updateState(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc => 
        acc.id === targetAccountId 
          ? { ...acc, balance: acc.balance + amount } 
          : acc
      ),
      transactions: [{
        id: Math.random().toString(36).substr(2, 9),
        description: `Reforço Poupança (${account.currency})`,
        amount: amount,
        date: new Date().toISOString(),
        type: TransactionType.INCOME,
        category: Category.INVESTIMENTOS,
        accountId: targetAccountId,
        status: Status.CONCLUIDA
      }, ...prev.transactions]
    }));
    setAmount(0);
    alert(`Aporte de ${account.currency === 'Kz' ? formatKz(amount) : formatEur(amount)} realizado!`);
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Header and Account Selection */}
      <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm flex flex-col lg:flex-row justify-between items-start gap-8 md:gap-12">
        <div className="max-w-xl">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">Fontes de Reserva Multimoeda</h2>
          <p className="text-slate-500 font-bold leading-relaxed mb-6 text-sm md:text-base">
            Pode marcar qualquer uma das suas carteiras como <span className="text-indigo-600">Reserva Financeira</span>. 
            O KwanzaPlan irá consolidar os valores em Kwanzas automaticamente.
          </p>
          <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest">
            <RefreshCw size={14} className="animate-spin-slow" /> Câmbio de Referência: 1€ = {formatKz(EUR_TO_AOA_RATE)}
          </div>
        </div>
        
        <div className="w-full lg:w-[450px] space-y-4">
          <div className="bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-[40px] border border-slate-100">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 md:mb-6">Todas as suas Carteiras</label>
            <div className="space-y-2 md:space-y-3">
              {allAccounts.map(acc => (
                <button 
                  key={acc.id}
                  onClick={() => toggleSavingsAccount(acc.id)}
                  className={`w-full flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-[24px] border transition-all ${
                    acc.isSavingsAccount 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet size={18} md:size={20} className={acc.isSavingsAccount ? 'text-white/80' : 'text-slate-300'} />
                    <span className="font-black text-xs md:text-sm">{acc.name}</span>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className={`text-[9px] md:text-[10px] font-black ${acc.isSavingsAccount ? 'text-white/70' : 'text-slate-400'}`}>
                      {acc.currency === 'Kz' ? formatKz(acc.balance) : formatEur(acc.balance)}
                    </span>
                    {acc.isSavingsAccount ? <CheckCircle2 size={18} md:size={20} /> : <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-slate-200 rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {/* Consolidated Progress Card */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl md:rounded-[56px] p-6 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-[140px] opacity-20 -mr-40 -mt-40"></div>
          
          <div className="relative z-10 space-y-8 md:space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[3px] mb-3">Total Consolidado de Reservas (Est. Kz)</p>
                <h3 className="text-4xl md:text-6xl font-black tracking-tighter">
                  {formatKz(totalReserveKz)}
                </h3>
              </div>
              <div className="p-4 md:p-6 bg-white/10 rounded-2xl md:rounded-[32px] backdrop-blur-md border border-white/10">
                <Shield className="text-emerald-400" size={32} md:size={40} />
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[9px] md:text-[10px] font-black text-white/50 uppercase tracking-widest">Meta de Segurança de {formatKz(state.settings.emergencyFundTarget)}</span>
                <span className="text-2xl md:text-4xl font-black text-emerald-400">
                  {Math.min((totalReserveKz / state.settings.emergencyFundTarget) * 100, 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-4 md:h-6 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 p-1">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_35px_rgba(16,185,129,0.5)]"
                  style={{ width: `${Math.min((totalReserveKz / state.settings.emergencyFundTarget) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-4">
              <div className="bg-white/5 p-4 md:p-7 rounded-2xl md:rounded-[32px] border border-white/5">
                <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase mb-2 md:mb-3 tracking-widest">Fontes</p>
                <p className="text-lg md:text-2xl font-black">{savingsAccounts.length} Carteiras</p>
              </div>
              <div className="bg-white/5 p-4 md:p-7 rounded-2xl md:rounded-[32px] border border-white/5">
                <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase mb-2 md:mb-3 tracking-widest">Meta Mensal</p>
                <p className="text-lg md:text-2xl font-black">{formatKz(state.settings.mandatorySavings)}</p>
              </div>
              <div className="hidden lg:block bg-white/5 p-4 md:p-7 rounded-2xl md:rounded-[32px] border border-white/5">
                <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase mb-2 md:mb-3 tracking-widest">Moedas</p>
                <p className="text-lg md:text-2xl font-black">Kz + EUR</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Account Deposit Card */}
        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-100 shadow-sm space-y-8 md:space-y-10">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-[28px] flex items-center justify-center">
              <Coins size={24} md:size={32} />
            </div>
            <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Reforçar Fundo</h4>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">Carteira de Destino</label>
              <select 
                value={targetAccountId}
                onChange={e => setTargetAccountId(e.target.value)}
                className="w-full bg-slate-50 border-none px-4 md:px-6 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-slate-800 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-sm md:text-base"
              >
                <option value="">Selecione...</option>
                {savingsAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">
                Valor do Aporte {targetAccountId ? `(${allAccounts.find(a => a.id === targetAccountId)?.currency})` : ''}
              </label>
              <input 
                type="number" 
                step="0.01"
                value={amount || ''}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-2xl md:text-4xl text-slate-900 focus:ring-4 focus:ring-indigo-50"
                placeholder="0.00"
              />
            </div>
            
            <button 
              onClick={handleDepositToReserve}
              className="w-full bg-slate-900 text-white py-5 md:py-7 rounded-2xl md:rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              Confirmar Depósito <ArrowRight size={18} />
            </button>
            
            <p className="text-center text-[9px] md:text-[10px] font-bold text-slate-300 uppercase leading-relaxed tracking-widest">
              * O saldo será atualizado na moeda nativa da carteira.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <section>
        <div className="flex items-center justify-between mb-6 md:mb-8 px-4 md:px-6">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
            <History className="text-indigo-600" />
            Movimentos de Reserva
          </h3>
        </div>
        
        <div className="bg-white rounded-3xl md:rounded-[56px] border border-slate-100 p-6 md:p-12 shadow-sm">
          <div className="space-y-6 md:space-y-8">
            {state.transactions.filter(t => t.category === Category.INVESTIMENTOS).slice(0, 5).map(t => {
              const account = allAccounts.find(a => a.id === t.accountId);
              return (
                <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between group p-4 hover:bg-slate-50 rounded-2xl md:rounded-[32px] transition-all gap-4">
                  <div className="flex items-center gap-4 md:gap-7">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-500 rounded-xl md:rounded-[28px] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <TrendingUp size={24} md:size={28} />
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-black text-slate-900">{t.description}</p>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[2px] mt-1">
                        {new Date(t.date).toLocaleDateString()} • {account?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-xl md:text-2xl font-black text-emerald-500">
                      +{account?.currency === 'Kz' ? formatKz(t.amount) : formatEur(t.amount)}
                    </p>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest">Liquidez Confirmada</p>
                  </div>
                </div>
              );
            })}
            {state.transactions.filter(t => t.category === Category.INVESTIMENTOS).length === 0 && (
              <p className="text-center text-slate-400 italic text-sm">Nenhum movimento registado.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Savings;
