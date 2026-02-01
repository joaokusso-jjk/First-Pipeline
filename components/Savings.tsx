
import React, { useState, useEffect } from 'react';
import { AppState, SavingsLog, Account } from '../types';
import { formatKz, formatEur, getCurrentMonthStr } from '../utils';
import { Shield, Globe, Plus, Trash2, History, Coins, Banknote, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Savings: React.FC<Props> = ({ state, updateState }) => {
  const [kzValue, setKzValue] = useState<number>(state.settings.mandatorySavings);
  const [eurValue, setEurValue] = useState<number>(0);
  
  const [kzReserveAccountId, setKzReserveAccountId] = useState<string>('');
  const [kzSurplusAccountId, setKzSurplusAccountId] = useState<string>('');
  const [eurAccountId, setEurAccountId] = useState<string>('');
  
  const currentMonth = getCurrentMonthStr();
  const { settings, accounts } = state;

  const kzAccounts = accounts.filter(a => a.currency === 'Kz');
  const eurAccounts = accounts.filter(a => a.currency === 'EUR');

  const remainingForEmergency = Math.max(0, settings.emergencyFundTarget - state.emergencyFundCurrent);
  const allocatedToEmergency = Math.min(kzValue, remainingForEmergency);
  const surplusValue = Math.max(0, kzValue - allocatedToEmergency);

  useEffect(() => {
    if (kzAccounts.length > 0) {
      if (!kzReserveAccountId) setKzReserveAccountId(kzAccounts[0].id);
      if (!kzSurplusAccountId) setKzSurplusAccountId(kzAccounts[0].id);
    }
    if (eurAccounts.length > 0 && !eurAccountId) {
      setEurAccountId(eurAccounts[0].id);
    }
  }, [kzAccounts, eurAccounts]);

  const confirmKzSavings = () => {
    if (kzValue <= 0) return alert("Insira um valor.");
    if (allocatedToEmergency > 0 && !kzReserveAccountId) return alert("Selecione a conta para a Reserva.");
    if (surplusValue > 0 && !kzSurplusAccountId) return alert("Selecione a conta para o Excedente.");

    updateState(prev => {
      let newAccounts = [...prev.accounts];
      if (allocatedToEmergency > 0) {
        newAccounts = newAccounts.map(acc => acc.id === kzReserveAccountId ? { ...acc, balance: acc.balance + allocatedToEmergency } : acc);
      }
      if (surplusValue > 0) {
        newAccounts = newAccounts.map(acc => acc.id === kzSurplusAccountId ? { ...acc, balance: acc.balance + surplusValue } : acc);
      }
      const newLog: SavingsLog = {
        id: Math.random().toString(36).substr(2, 9),
        month: currentMonth,
        amountPoured: kzValue,
        currency: 'Kz',
        allocatedToEmergency,
        targetAccountId: kzReserveAccountId,
        surplusAccountId: surplusValue > 0 ? kzSurplusAccountId : undefined
      };
      return {
        ...prev,
        emergencyFundCurrent: prev.emergencyFundCurrent + allocatedToEmergency,
        accounts: newAccounts,
        savings: [newLog, ...prev.savings]
      };
    });
    setKzValue(settings.mandatorySavings);
    alert("Poupança registada!");
  };

  const confirmEurSavings = () => {
    if (eurValue <= 0) return alert("Insira um valor.");
    if (!eurAccountId) return alert("Selecione a conta.");
    updateState(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc => acc.id === eurAccountId ? { ...acc, balance: acc.balance + eurValue } : acc),
      savings: [{
        id: Math.random().toString(36).substr(2, 9),
        month: currentMonth,
        amountPoured: eurValue,
        currency: 'EUR',
        allocatedToEmergency: 0,
        targetAccountId: eurAccountId
      }, ...prev.savings]
    }));
    setEurValue(0);
    alert("Poupança EUR registada!");
  };

  const deleteLog = (logId: string) => {
    if (!confirm("Reverter saldos?")) return;
    updateState(prev => {
      const log = prev.savings.find(s => s.id === logId);
      if (!log) return prev;
      let newAccounts = [...prev.accounts];
      if (log.currency === 'Kz') {
        const surplusAmt = log.amountPoured - log.allocatedToEmergency;
        if (log.allocatedToEmergency > 0) {
          newAccounts = newAccounts.map(acc => acc.id === log.targetAccountId ? { ...acc, balance: acc.balance - log.allocatedToEmergency } : acc);
        }
        if (surplusAmt > 0 && log.surplusAccountId) {
          newAccounts = newAccounts.map(acc => acc.id === log.surplusAccountId ? { ...acc, balance: acc.balance - surplusAmt } : acc);
        }
      } else {
        newAccounts = newAccounts.map(acc => acc.id === log.targetAccountId ? { ...acc, balance: acc.balance - log.amountPoured } : acc);
      }
      return {
        ...prev,
        emergencyFundCurrent: prev.emergencyFundCurrent - log.allocatedToEmergency,
        accounts: newAccounts,
        savings: prev.savings.filter(s => s.id !== logId)
      };
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kwanza */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Coins className="text-amber-500" size={24} />
            <h3 className="text-lg font-black text-slate-800">Poupança Kz</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Montante (Kz)</label>
              <input 
                type="number" 
                value={kzValue || ''}
                onChange={e => setKzValue(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-black text-xl text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border ${allocatedToEmergency > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 opacity-50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <Shield size={14} className="text-emerald-600" />
                  <span className="text-[9px] font-black uppercase text-emerald-700">Reserva</span>
                </div>
                <p className="text-sm font-black">{formatKz(allocatedToEmergency)}</p>
                {allocatedToEmergency > 0 && (
                  <select 
                    value={kzReserveAccountId}
                    onChange={e => setKzReserveAccountId(e.target.value)}
                    className="mt-2 w-full bg-white border border-emerald-100 text-[10px] py-1 px-1 rounded-lg"
                  >
                    {kzAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                )}
              </div>

              <div className={`p-4 rounded-2xl border ${surplusValue > 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 opacity-50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <ArrowRight size={14} className="text-indigo-600" />
                  <span className="text-[9px] font-black uppercase text-indigo-700">Excedente</span>
                </div>
                <p className="text-sm font-black">{formatKz(surplusValue)}</p>
                {surplusValue > 0 && (
                  <select 
                    value={kzSurplusAccountId}
                    onChange={e => setKzSurplusAccountId(e.target.value)}
                    className="mt-2 w-full bg-white border border-indigo-100 text-[10px] py-1 px-1 rounded-lg"
                  >
                    {kzAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                )}
              </div>
            </div>

            <button 
              onClick={confirmKzSavings}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg"
            >
              Lançar Kz
            </button>
          </div>
        </div>

        {/* Euro */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="text-blue-500" size={24} />
            <h3 className="text-lg font-black text-slate-800">Poupança €</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Montante (€)</label>
              <input 
                type="number" 
                value={eurValue || ''}
                onChange={e => setEurValue(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-black text-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Destino (€)</label>
              <select 
                value={eurAccountId}
                onChange={e => setEurAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold"
              >
                {eurAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>

            <button 
              onClick={confirmEurSavings}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg"
            >
              Lançar EUR
            </button>
          </div>
        </div>
      </div>

      {/* Histórico Simplificado Mobile */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center gap-2">
          <History size={18} className="text-slate-400" />
          <h4 className="font-bold text-slate-800">Histórico</h4>
        </div>
        
        <div className="divide-y divide-slate-50">
          {state.savings.map(log => (
            <div key={log.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{log.month}</p>
                <p className={`font-black ${log.currency === 'Kz' ? 'text-amber-600' : 'text-blue-600'}`}>
                  {log.currency === 'Kz' ? formatKz(log.amountPoured) : formatEur(log.amountPoured)}
                </p>
              </div>
              <button onClick={() => deleteLog(log.id)} className="p-2 text-rose-300">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {state.savings.length === 0 && <p className="py-8 text-center text-slate-400 text-xs italic">Sem registos.</p>}
        </div>
      </div>
    </div>
  );
};

export default Savings;
