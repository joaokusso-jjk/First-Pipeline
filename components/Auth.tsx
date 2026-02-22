
import React, { useState } from 'react';
import { User } from '../types';
import { TrendingUp, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulando delay de rede para experiência real
    setTimeout(() => {
      const usersKey = 'kwanza_plan_users';
      const savedUsers: User[] = JSON.parse(localStorage.getItem(usersKey) || '[]');
      
      if (isLogin) {
        const existingUser = savedUsers.find(u => u.email === formData.email);
        if (existingUser) {
          onLogin(existingUser);
        } else {
          alert('Esta conta não existe. Por favor, crie uma conta primeiro.');
          setIsLogin(false);
        }
      } else {
        // Registro
        const userExists = savedUsers.some(u => u.email === formData.email);
        if (userExists) {
          alert('Este e-mail já está registado. Faça login.');
          setIsLogin(true);
        } else {
          const newUser: User = {
            id: formData.email.replace(/[^a-zA-Z0-9]/g, '_'),
            name: formData.name || formData.email.split('@')[0],
            email: formData.email,
            avatar: `https://ui-avatars.com/api/?name=${formData.name || formData.email}&background=6366f1&color=fff`
          };
          
          const updatedUsers = [...savedUsers, newUser];
          localStorage.setItem(usersKey, JSON.stringify(updatedUsers));
          onLogin(newUser);
        }
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100 mb-4 animate-bounce">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">KwanzaPlan</h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isLogin ? 'Bem-vindo de volta! Faça login na sua conta.' : 'Comece hoje a sua jornada financeira.'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="João Kusso"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="exemplo@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isLogin ? 'Não tem conta? Registe-se' : 'Já tem conta? Faça Login'}
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-[10px] text-slate-400 uppercase font-black tracking-widest">
          &copy; 2024 KwanzaPlan • Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default Auth;
