
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

  // Valores calculados para o split de Kz
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
      
      // Adicionar à conta da reserva
      if (allocatedToEmergency > 0) {
        newAccounts = newAccounts.map(acc => 
          acc.id === kzReserveAccountId ? { ...acc, balance: acc.balance + allocatedToEmergency } : acc
        );
      }
      
      // Adicionar à conta do excedente
      if (surplusValue > 0) {
        newAccounts = newAccounts.map(acc => 
          acc.id === kzSurplusAccountId ? { ...acc, balance: acc.balance + surplusValue } : acc
        );
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
    alert("Poupança Kwanza registada com sucesso!");
  };

  const confirmEurSavings = () => {
    if (eurValue <= 0) return alert("Insira um valor.");
    if (!eurAccountId) return alert("Selecione a conta.");

    updateState(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc => 
        acc.id === eurAccountId ? { ...acc, balance: acc.balance + eurValue } : acc
      ),
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
    alert("Poupança Euro registada com sucesso!");
  };

  const deleteLog = (logId: string) => {
    const log = state.savings.find(s => s.id === logId);
    if (!log || !confirm("Eliminar registo e reverter saldos?")) return;

    updateState(prev => {
      let newAccounts = [...prev.accounts];
      
      if (log.currency === 'Kz') {
        const surplusAmt = log.amountPoured - log.allocatedToEmergency;
        
        // Reverter Reserva
        if (log.allocatedToEmergency > 0) {
          newAccounts = newAccounts.map(acc => acc.id === log.targetAccountId ? { ...acc, balance: acc.balance - log.allocatedToEmergency } : acc);
        }
        // Reverter Excedente
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lançamento Kwanza */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Coins size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Poupança Kwanzas</h3>
              <p className="text-slate-400 text-xs">Registo de poupança com divisão de destinos</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quanto quer poupar? (Kz)</label>
              <input 
                type="number" 
                value={kzValue || ''}
                onChange={e => setKzValue(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-4 rounded-2xl font-black text-2xl text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Split Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parcela Reserva */}
              <div className={`p-4 rounded-2xl border transition-all ${allocatedToEmergency > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                <div className="flex justify-between items-center mb-3">
                  <Shield size={16} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Reserva</span>
                </div>
                <p className="text-lg font-black text-slate-800">{formatKz(allocatedToEmergency)}</p>
                {allocatedToEmergency > 0 && (
                  <select 
                    value={kzReserveAccountId}
                    onChange={e => setKzReserveAccountId(e.target.value)}
                    className="mt-3 w-full bg-white border border-emerald-100 text-[10px] font-bold py-2 px-2 rounded-lg outline-none"
                  >
                    <option value="" disabled>Selecionar conta...</option>
                    {kzAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                )}
              </div>

              {/* Parcela Excedente */}
              <div className={`p-4 rounded-2xl border transition-all ${surplusValue > 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                <div className="flex justify-between items-center mb-3">
                  <ArrowRight size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Excedente</span>
                </div>
                <p className="text-lg font-black text-slate-800">{formatKz(surplusValue)}</p>
                {surplusValue > 0 && (
                  <select 
                    value={kzSurplusAccountId}
                    onChange={e => setKzSurplusAccountId(e.target.value)}
                    className="mt-3 w-full bg-white border border-indigo-100 text-[10px] font-bold py-2 px-2 rounded-lg outline-none"
                  >
                    <option value="" disabled>Selecionar conta...</option>
                    {kzAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                )}
              </div>
            </div>

            <button 
              onClick={confirmKzSavings}
              disabled={kzAccounts.length === 0}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
            >
              Confirmar Lançamento Kz
            </button>
          </div>
        </div>

        {/* Lançamento Euro */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Poupança Euros</h3>
              <p className="text-slate-400 text-xs">Registo direto em conta estrangeira</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quanto quer poupar? (€)</label>
              <input 
                type="number" 
                value={eurValue || ''}
                onChange={e => setEurValue(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-4 rounded-2xl font-black text-2xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Conta de Destino (€)</label>
              <select 
                value={eurAccountId}
                onChange={e => setEurAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-4 rounded-2xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Selecionar conta EUR...</option>
                {eurAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
              {eurAccounts.length === 0 && <p className="text-[10px] text-rose-500 mt-2 font-bold">Crie uma conta EUR nas configurações.</p>}
            </div>

            <button 
              onClick={confirmEurSavings}
              disabled={eurAccounts.length === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50"
            >
              Confirmar Lançamento EUR
            </button>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
          <History size={20} className="text-slate-400" />
          <h4 className="font-bold text-slate-800">Histórico de Lançamentos</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4">Destino(s)</th>
                <th className="px-6 py-4">Na Reserva</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.savings.map(log => {
                const acc1 = accounts.find(a => a.id === log.targetAccountId);
                const acc2 = log.surplusAccountId ? accounts.find(a => a.id === log.surplusAccountId) : null;
                
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{log.month}</td>
                    <td className={`px-6 py-4 font-black ${log.currency === 'Kz' ? 'text-amber-600' : 'text-blue-600'}`}>
                      {log.currency === 'Kz' ? formatKz(log.amountPoured) : formatEur(log.amountPoured)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                          <Building2 size={12} className="text-slate-300" />
                          {acc1?.name || '---'} {log.surplusAccountId ? '(Reserva)' : ''}
                        </div>
                        {acc2 && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                            <Building2 size={12} className="text-indigo-200" />
                            {acc2.name} (Excedente)
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-bold text-xs">
                      {log.allocatedToEmergency > 0 ? `+${formatKz(log.allocatedToEmergency)}` : '--'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => deleteLog(log.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {state.savings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">Sem registos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Savings;
