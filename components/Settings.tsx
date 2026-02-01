
import React, { useState, useEffect } from 'react';
import { AppState, AppSettings, Account } from '../types';
import { Save, RefreshCcw, AlertCircle, Shield, RotateCcw, Globe, Plus, Trash2, Building2, Coins, AlertTriangle, Percent, LogOut, ArrowRightLeft, Wallet2 } from 'lucide-react';
import { formatKz, formatEur } from '../utils';
import { 
  MONTHLY_SALARY, 
  EMERGENCY_FUND_TARGET, 
  MONTHLY_BUDGET_LIMIT, 
  FIXED_EXPENSES_LIMIT, 
  HIGH_COST_THRESHOLD
} from '../constants';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ state, updateState, onLogout }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(state.settings);
  const [localEmergencyFund, setLocalEmergencyFund] = useState<number>(state.emergencyFundCurrent);
  const [selectedEmergencyAccountId, setSelectedEmergencyAccountId] = useState<string>('');
  
  const [newAccName, setNewAccName] = useState('');
  const [newAccCurrency, setNewAccCurrency] = useState<'Kz' | 'EUR'>('Kz');
  const [newAccBalance, setNewAccBalance] = useState(0);

  const kzAccounts = state.accounts.filter(a => a.currency === 'Kz');

  // Sync mandatory savings when salary or percentage rule changes
  useEffect(() => {
    const calculatedSavings = (localSettings.monthlySalary * localSettings.savingsPercentageRule) / 100;
    if (calculatedSavings !== localSettings.mandatorySavings) {
      setLocalSettings(prev => ({ ...prev, mandatorySavings: calculatedSavings }));
    }
  }, [localSettings.monthlySalary, localSettings.savingsPercentageRule]);

  // Inicializar conta selecionada se houver contas disponíveis
  useEffect(() => {
    if (kzAccounts.length > 0 && !selectedEmergencyAccountId) {
      setSelectedEmergencyAccountId(kzAccounts[0].id);
    }
  }, [kzAccounts]);

  const handleSave = () => {
    const delta = localEmergencyFund - state.emergencyFundCurrent;
    
    updateState(prev => {
      let updatedAccounts = [...prev.accounts];
      
      // Se houve alteração no valor da reserva e uma conta foi selecionada, ajusta o saldo dela
      if (delta !== 0 && selectedEmergencyAccountId) {
        updatedAccounts = updatedAccounts.map(acc => 
          acc.id === selectedEmergencyAccountId 
            ? { ...acc, balance: acc.balance + delta } 
            : acc
        );
      }

      return {
        ...prev,
        settings: localSettings,
        emergencyFundCurrent: localEmergencyFund,
        accounts: updatedAccounts
      };
    });

    const accountName = kzAccounts.find(a => a.id === selectedEmergencyAccountId)?.name || 'conta';
    const alertMsg = delta !== 0 && selectedEmergencyAccountId
      ? `Configurações guardadas! O saldo da conta "${accountName}" foi ajustado em ${formatKz(delta)}.`
      : "Configurações guardadas com sucesso!";
    
    alert(alertMsg);
  };

  const addAccount = () => {
    if (!newAccName) return;
    const newAccount: Account = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAccName,
      currency: newAccCurrency,
      balance: newAccBalance
    };
    updateState(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount]
    }));
    setNewAccName('');
    setNewAccBalance(0);
  };

  const deleteAccount = (id: string, name: string, balance: number) => {
    const msg = balance !== 0 
      ? `A conta "${name}" tem um saldo de ${balance > 0 ? (state.accounts.find(a => a.id === id)?.currency === 'Kz' ? formatKz(balance) : formatEur(balance)) : balance}. Ao removê-la, este valor deixará de ser contabilizado. Continuar?`
      : `Deseja remover a conta "${name}"?`;

    if (!confirm(msg)) return;

    updateState(prev => ({
      ...prev,
      accounts: prev.accounts.filter(a => a.id !== id)
    }));
  };

  const resetAllData = () => {
    if (confirm("AVISO: Isto apagará TODOS os dados da aplicação deste utilizador. Deseja continuar?")) {
      if (confirm("TEM MESMO A CERTEZA? Esta ação é irreversível.")) {
        const storageKey = `kwanza_plan_data_${state.user?.id}`;
        localStorage.removeItem(storageKey);
        window.location.reload();
      }
    }
  };

  const handleChange = (key: keyof AppSettings, value: number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const deltaValue = localEmergencyFund - state.emergencyFundCurrent;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Perfil e Sessão */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <img src={state.user?.avatar} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border-4 border-indigo-50 shadow-sm" alt="profile" />
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-800">{state.user?.name}</h3>
            <p className="text-slate-500 text-xs md:text-sm">{state.user?.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-6 py-3 rounded-xl hover:bg-rose-100 transition-all font-bold text-xs md:text-sm uppercase tracking-widest"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

      {/* Gestão de Contas */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="text-indigo-600" size={24} />
            Contas
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome da Conta</label>
            <input 
              type="text" 
              value={newAccName}
              onChange={e => setNewAccName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Banco BAI"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Moeda</label>
            <select 
              value={newAccCurrency}
              onChange={e => setNewAccCurrency(e.target.value as 'Kz' | 'EUR')}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="Kz">Kz</option>
              <option value="EUR">€</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Saldo</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={newAccBalance || ''}
                onChange={e => setNewAccBalance(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
              <button 
                onClick={addAccount}
                disabled={!newAccName}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {state.accounts.map(acc => (
            <div key={acc.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl bg-white hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${acc.currency === 'Kz' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                  {acc.currency === 'Kz' ? <Coins size={18} /> : <Globe size={18} />}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{acc.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase">{acc.currency}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-black text-slate-700 text-sm">
                  {acc.currency === 'Kz' ? formatKz(acc.balance) : formatEur(acc.balance)}
                </p>
                <button 
                  onClick={() => deleteAccount(acc.id, acc.name, acc.balance)} 
                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regras e Parâmetros */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="text-emerald-600" size={24} />
              Regras e Reserva
            </h3>
            <p className="text-slate-500 text-xs md:text-sm">Configure os seus limites e fundo de reserva.</p>
          </div>
          <button 
            onClick={handleSave}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
          >
            <Save size={18} />
            Guardar Alterações
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Rendimentos */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Configuração Geral</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">Salário Referência (Kz)</label>
                <input 
                  type="number" 
                  value={localSettings.monthlySalary}
                  onChange={e => handleChange('monthlySalary', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <label className="block text-[10px] font-bold text-indigo-700 uppercase mb-2">Regra de Poupança (%)</label>
                <div className="flex items-center gap-3">
                  <Percent size={18} className="text-indigo-400" />
                  <input 
                    type="number" 
                    value={localSettings.savingsPercentageRule}
                    onChange={e => handleChange('savingsPercentageRule', Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-indigo-200 font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reserva de Emergência Detalhada */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Controlo da Reserva</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">Meta da Reserva (Kz)</label>
                <input 
                  type="number" 
                  value={localSettings.emergencyFundTarget}
                  onChange={e => handleChange('emergencyFundTarget', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-amber-600 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-4 md:p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-amber-200/50 rounded-xl">
                      <Wallet2 size={20} className="text-amber-700" />
                   </div>
                   <h5 className="font-black text-amber-900 text-xs uppercase tracking-tight">Fundo Físico</h5>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 uppercase mb-2">Valor Atual no Contador (Kz)</label>
                    <input 
                      type="number" 
                      value={localEmergencyFund}
                      onChange={e => setLocalEmergencyFund(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white font-black text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 text-lg shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 uppercase mb-2 flex items-center gap-2">
                      Conta onde o valor reside:
                    </label>
                    <select 
                      value={selectedEmergencyAccountId}
                      onChange={e => setSelectedEmergencyAccountId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                    >
                      {kzAccounts.length > 0 ? (
                        kzAccounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name} ({formatKz(acc.balance)})</option>
                        ))
                      ) : (
                        <option value="">Nenhuma conta Kz disponível</option>
                      )}
                    </select>
                  </div>
                </div>

                {deltaValue !== 0 && (
                   <div className="pt-2 border-t border-amber-200/50 animate-in fade-in slide-in-from-top-1">
                      <div className={`text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-2 ${deltaValue > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                         <ArrowRightLeft size={14} />
                         Ajuste de saldo: {deltaValue > 0 ? '+' : ''}{formatKz(deltaValue)}
                      </div>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zona de Perigo */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-rose-100 shadow-sm border-l-8 border-l-rose-500">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-rose-600" size={24} />
          <h3 className="text-lg font-black text-slate-800 uppercase">Zona de Perigo</h3>
        </div>
        
        <div className="bg-rose-50 p-4 md:p-6 rounded-2xl border border-rose-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-rose-600 font-medium text-center md:text-left">
            Apagar permanentemente todos os dados desta conta. Esta ação não pode ser revertida.
          </p>
          <button 
            onClick={resetAllData}
            className="w-full md:w-auto bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100"
          >
            Limpar Tudo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
