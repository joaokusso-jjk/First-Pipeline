
import React, { useState, useEffect } from 'react';
import { AppState, AppSettings } from '../types';
import { Save, Shield, AlertTriangle, Percent, LogOut, TrendingUp, Target, User, Info, ExternalLink, Github, Globe } from 'lucide-react';
import { formatKz } from '../utils';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ state, updateState, onLogout }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(state.settings);
  const [localUser, setLocalUser] = useState({
    name: state.user?.name || '',
    email: state.user?.email || '',
    avatar: state.user?.avatar || ''
  });

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
      user: prev.user ? { ...prev.user, ...localUser } : null
    }));
    alert("Definições guardadas com sucesso!");
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
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Definições</h2>
          <p className="text-slate-500 font-bold mt-2 text-sm md:text-base">Gerencie sua conta e diretrizes financeiras.</p>
        </div>
        <button 
          onClick={handleSave}
          className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 md:py-5 rounded-2xl md:rounded-[28px] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          <Save size={18} />
          Guardar
        </button>
      </div>

      {/* Account Info Section */}
      <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4 text-slate-900">
          <User size={28} />
          <h3 className="text-xl md:text-2xl font-black">Informações da Conta</h3>
        </div>
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 p-6 md:p-10 bg-slate-50 rounded-[40px] border border-slate-100">
          <div className="relative group self-center lg:self-auto">
            <img 
              src={localUser.avatar || 'https://picsum.photos/seed/user/200/200'} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[48px] shadow-2xl object-cover border-4 border-white" 
              alt="avatar" 
            />
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  value={localUser.name}
                  onChange={e => setLocalUser({...localUser, name: e.target.value})}
                  className="w-full bg-white border-none px-6 py-4 rounded-2xl font-black text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                <input 
                  type="email" 
                  value={localUser.email}
                  onChange={e => setLocalUser({...localUser, email: e.target.value})}
                  className="w-full bg-white border-none px-6 py-4 rounded-2xl font-black text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL do Avatar</label>
              <input 
                type="text" 
                value={localUser.avatar}
                onChange={e => setLocalUser({...localUser, avatar: e.target.value})}
                className="w-full bg-white border-none px-6 py-4 rounded-2xl font-black text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-50"
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-100 shadow-sm space-y-8 md:space-y-10">
          <div className="flex items-center gap-4 text-indigo-600">
            <TrendingUp size={28} />
            <h3 className="text-xl md:text-2xl font-black">Renda e Regras</h3>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Salário Líquido Mensal (Kz)</label>
              <input 
                type="number" 
                value={localSettings.monthlySalary}
                onChange={e => handleChange('monthlySalary', Number(e.target.value))}
                className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 text-lg md:text-xl focus:ring-4 focus:ring-indigo-50"
              />
            </div>
            
            <div className="p-6 md:p-8 bg-indigo-50/50 rounded-2xl md:rounded-[40px] border border-indigo-50">
              <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 md:mb-4">Alocação de Poupança (%)</label>
              <div className="flex items-center gap-4">
                <Percent className="text-indigo-400" size={24} />
                <input 
                  type="number" 
                  value={localSettings.savingsPercentageRule}
                  onChange={e => handleChange('savingsPercentageRule', Number(e.target.value))}
                  className="w-full bg-white border-none px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-indigo-600"
                />
              </div>
              <p className="text-[10px] font-bold text-indigo-400 mt-4">
                Meta de poupança mensal calculada: {formatKz(localSettings.mandatorySavings)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-100 shadow-sm space-y-8 md:space-y-10">
          <div className="flex items-center gap-4 text-emerald-600">
            <Shield size={28} />
            <h3 className="text-xl md:text-2xl font-black">Segurança Financeira</h3>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Meta do Fundo de Emergência (Kz)</label>
              <input 
                type="number" 
                value={localSettings.emergencyFundTarget}
                onChange={e => handleChange('emergencyFundTarget', Number(e.target.value))}
                className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 text-lg md:text-xl focus:ring-4 focus:ring-emerald-50"
              />
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Recomendado: 6x despesas mensais</p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Limite Orçamental Mensal (Kz)</label>
              <input 
                type="number" 
                value={localSettings.monthlyBudgetLimit}
                onChange={e => handleChange('monthlyBudgetLimit', Number(e.target.value))}
                className="w-full bg-slate-50 border-none px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-[32px] font-black text-slate-900 text-lg md:text-xl focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4 text-slate-900">
          <Info size={28} />
          <h3 className="text-xl md:text-2xl font-black">Sobre o KwanzaPlan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <p className="text-slate-600 font-bold leading-relaxed">
              O KwanzaPlan é uma ferramenta de organização financeira estruturada, desenhada para ajudar utilizadores a gerir o seu fluxo de caixa, planear atividades futuras e alcançar metas de poupança com precisão.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                <Globe size={14} /> Website Oficial
              </a>
              <a href="#" className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:underline">
                <Github size={14} /> Repositório
              </a>
              <a href="#" className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:underline">
                <ExternalLink size={14} /> Termos de Uso
              </a>
            </div>
          </div>
          <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Versão Atual</p>
            <p className="text-3xl font-black text-slate-900">v2.4.0</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-widest">Sistema Estável</p>
          </div>
        </div>
      </div>

      <div className="bg-rose-50 p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="p-4 bg-white rounded-2xl md:rounded-3xl text-rose-600 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-rose-900">Zona de Perigo</h3>
            <p className="text-rose-700 font-bold text-sm">Estas ações são irreversíveis e apagam o histórico.</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={resetAllData}
            className="flex-1 bg-rose-600 text-white px-8 py-4 md:py-5 rounded-2xl md:rounded-[28px] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:scale-105 transition-all"
          >
            Limpar Todos os Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
