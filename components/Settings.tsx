
import React, { useState, useEffect } from 'react';
import { AppState, AppSettings } from '../types';
import { Save, Shield, AlertTriangle, Percent, LogOut, TrendingUp, Target } from 'lucide-react';
import { formatKz } from '../utils';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ state, updateState, onLogout }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(state.settings);

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
      settings: localSettings
    }));
    alert("Configurações globais guardadas!");
  };

  const resetAllData = () => {
    if (confirm("AVISO: Isto apagará TODOS os seus dados financeiros (contas, metas, transações). Deseja continuar?")) {
      const storageKey = `kwanza_plan_data_${state.user?.id}`;
      localStorage.removeItem(storageKey);
      window.location.reload();
    }
  };

  const handleChange = (key: keyof AppSettings, value: number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Ajustes</h2>
          <p className="text-slate-500 font-bold">Configure as diretrizes do seu plano financeiro.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Save size={18} />
          Guardar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4 text-indigo-600">
            <TrendingUp size={28} />
            <h3 className="text-xl font-black">Renda e Regras</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Salário Líquido Mensal (Kz)</label>
              <input 
                type="number" 
                value={localSettings.monthlySalary}
                onChange={e => handleChange('monthlySalary', Number(e.target.value))}
                className="w-full bg-slate-50 border-none px-8 py-5 rounded-3xl font-black text-slate-900 text-xl focus:ring-4 focus:ring-indigo-50"
              />
            </div>
            
            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-50">
              <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Alocação de Poupança (%)</label>
              <div className="flex items-center gap-4">
                <Percent className="text-indigo-400" size={24} />
                <input 
                  type="number" 
                  value={localSettings.savingsPercentageRule}
                  onChange={e => handleChange('savingsPercentageRule', Number(e.target.value))}
                  className="w-full bg-white border-none px-6 py-4 rounded-2xl font-black text-indigo-600"
                />
              </div>
              <p className="text-[10px] font-bold text-indigo-400 mt-4">
                Meta de poupança mensal calculada: {formatKz(localSettings.mandatorySavings)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4 text-emerald-600">
            <Shield size={28} />
            <h3 className="text-xl font-black">Segurança Financeira</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Meta do Fundo de Emergência (Kz)</label>
              <input 
                type="number" 
                value={localSettings.emergencyFundTarget}
                onChange={e => handleChange('emergencyFundTarget', Number(e.target.value))}
                className="w-full bg-slate-50 border-none px-8 py-5 rounded-3xl font-black text-slate-900 text-xl focus:ring-4 focus:ring-emerald-50"
              />
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Recomendado: 6x despesas mensais</p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Limite Orçamental Mensal (Kz)</label>
              <input 
                type="number" 
                value={localSettings.monthlyBudgetLimit}
                onChange={e => handleChange('monthlyBudgetLimit', Number(e.target.value))}
                className="w-full bg-slate-50 border-none px-8 py-5 rounded-3xl font-black text-slate-900 text-xl focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-rose-50 p-10 rounded-[48px] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white rounded-3xl text-rose-600 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-rose-900">Zona de Perigo</h3>
            <p className="text-rose-700 font-bold text-sm">Estas ações são irreversíveis e apagam o histórico.</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={resetAllData}
            className="flex-1 bg-rose-600 text-white px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:scale-105 transition-all"
          >
            Limpar Todos os Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
