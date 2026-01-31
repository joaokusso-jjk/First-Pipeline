
import React, { useState, useEffect } from 'react';
import { AppState, AppSettings, Account } from '../types';
import { Save, RefreshCcw, AlertCircle, Shield, RotateCcw, Globe, Plus, Trash2, Building2, Coins, AlertTriangle, Percent, LogOut } from 'lucide-react';
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
  
  const [newAccName, setNewAccName] = useState('');
  const [newAccCurrency, setNewAccCurrency] = useState<'Kz' | 'EUR'>('Kz');
  const [newAccBalance, setNewAccBalance] = useState(0);

  // Sync mandatory savings when salary or percentage rule changes
  useEffect(() => {
    const calculatedSavings = (localSettings.monthlySalary * localSettings.savingsPercentageRule) / 100;
    if (calculatedSavings !== localSettings.mandatorySavings) {
      setLocalSettings(prev => ({ ...prev, mandatorySavings: calculatedSavings }));
    }
  }, [localSettings.monthlySalary, localSettings.savingsPercentageRule]);

  const handleSave = () => {
    updateState(prev => ({
      ...prev,
      settings: localSettings,
      emergencyFundCurrent: localEmergencyFund
    }));
    alert("Configurações guardadas com sucesso!");
  };

  const handleRestoreDefaults = () => {
    if (confirm("Deseja restaurar apenas as regras financeiras para os valores de fábrica? Suas contas e histórico não serão apagados.")) {
      const defaults: AppSettings = {
        monthlySalary: MONTHLY_SALARY,
        mandatorySavings: (MONTHLY_SALARY * 40) / 100,
        savingsPercentageRule: 40,
        emergencyFundTarget: EMERGENCY_FUND_TARGET,
        monthlyBudgetLimit: MONTHLY_BUDGET_LIMIT,
        fixedExpensesLimit: FIXED_EXPENSES_LIMIT,
        highCostThreshold: HIGH_COST_THRESHOLD,
        initialEurBalance: 0
      };
      setLocalSettings(defaults);
      alert("Valores de fábrica carregados. Clique em 'Guardar Regras' para confirmar.");
    }
  };

  const applySuggestion = () => {
    setLocalSettings(prev => ({ ...prev, savingsPercentageRule: 40 }));
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Perfil e Sessão */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <img src={state.user?.avatar} className="w-16 h-16 rounded-2xl border-4 border-indigo-50 shadow-sm" alt="profile" />
          <div>
            <h3 className="text-xl font-black text-slate-800">{state.user?.name}</h3>
            <p className="text-slate-500 text-sm">{state.user?.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-rose-50 text-rose-600 px-6 py-3 rounded-xl hover:bg-rose-100 transition-all font-bold text-sm uppercase tracking-widest"
        >
          <LogOut size={18} />
          Terminar Sessão
        </button>
      </div>

      {/* Gestão de Contas */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="text-indigo-600" size={24} />
            Gestão de Contas
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black uppercase">
            {state.accounts.length} Contas Ativas
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome da Conta</label>
            <input 
              type="text" 
              value={newAccName}
              onChange={e => setNewAccName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Banco BAI, Carteira..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Moeda</label>
            <select 
              value={newAccCurrency}
              onChange={e => setNewAccCurrency(e.target.value as 'Kz' | 'EUR')}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="Kz">Kwanza (Kz)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Saldo Inicial</label>
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
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${acc.currency === 'Kz' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                  {acc.currency === 'Kz' ? <Coins size={20} /> : <Globe size={20} />}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{acc.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{acc.currency}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-black text-slate-700 text-right">
                  {acc.currency === 'Kz' ? formatKz(acc.balance) : formatEur(acc.balance)}
                </p>
                <button 
                  onClick={() => deleteAccount(acc.id, acc.name, acc.balance)} 
                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Remover Conta"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regras e Parâmetros */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="text-emerald-600" size={24} />
              Regras do Sistema
            </h3>
            <p className="text-slate-500 text-sm">Configure os limites e metas de cálculo para a sua conta.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleSave}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
            >
              <Save size={18} />
              Guardar Regras
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Rendimentos e Poupança</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-tight">Salário Mensal de Referência (Kz)</label>
                <input 
                  type="number" 
                  value={localSettings.monthlySalary}
                  onChange={e => handleChange('monthlySalary', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-indigo-700 uppercase mb-2 flex justify-between items-center">
                    <span>Regra de Poupança (%)</span>
                  </label>
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
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Reserva e Limites</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-tight">Meta Reserva de Emergência (Kz)</label>
                <input 
                  type="number" 
                  value={localSettings.emergencyFundTarget}
                  onChange={e => handleChange('emergencyFundTarget', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-amber-600 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <label className="block text-xs font-bold text-amber-800 uppercase mb-2 tracking-tight">Valor na Reserva (Kz - Contador)</label>
                <input 
                  type="number" 
                  value={localEmergencyFund}
                  onChange={e => setLocalEmergencyFund(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white font-black text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zona de Perigo */}
      <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm border-l-8 border-l-rose-500">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-rose-600" size={28} />
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Zona de Perigo</h3>
            <p className="text-sm text-slate-500 font-medium">Manutenção drástica de dados.</p>
          </div>
        </div>
        
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h4 className="font-bold text-rose-800 text-lg">Reset Total dos Seus Dados</h4>
            <p className="text-xs text-rose-600 mt-1 leading-relaxed">
              Isto apagará permanentemente tudo associado à sua conta.
            </p>
          </div>
          <button 
            onClick={resetAllData}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-xl hover:bg-rose-700 transition-all font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-100"
          >
            <RefreshCcw size={20} />
            Reset de Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
