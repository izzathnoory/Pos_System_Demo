import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Lock, User as UserIcon, ShieldAlert, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('Admin');
  const [password, setPassword] = useState<string>('admin@123');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      setIsLoading(false);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid credentials! Please use username: Admin and password: admin@123');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#0A192F] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#0B4EAE]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700/50 z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="p-3.5 sm:p-4 bg-gradient-to-tr from-[#0B4EAE] to-[#00D2FF] text-white rounded-2xl shadow-lg mb-3">
            <Sparkles className="w-8 h-8 sm:w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Restaurant POS System</h1>
          <p className="text-xs text-cyan-600 font-bold uppercase tracking-widest mt-0.5">By Nexzoa</p>
          <p className="text-xs text-slate-500 font-medium mt-1">POS System By Nexzoa</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<UserIcon className="w-4 h-4" />}
            placeholder="Enter username (Admin)"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            placeholder="Enter password (admin@123)"
            required
          />

          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-1.5 border border-slate-200">
            <p className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span>Demo Login Credentials:</span>
            </p>
            <div className="flex items-center justify-between">
              <span>Username:</span>
              <code className="bg-white px-2 py-0.5 rounded text-[#0B4EAE] font-mono font-bold border border-slate-200">Admin</code>
            </div>
            <div className="flex items-center justify-between">
              <span>Password:</span>
              <code className="bg-white px-2 py-0.5 rounded text-[#0B4EAE] font-mono font-bold border border-slate-200">admin@123</code>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 bg-[#0B4EAE] hover:bg-[#093D89]"
            isLoading={isLoading}
          >
            Sign In to Dashboard
          </Button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-200/80 text-center text-xs text-slate-400">
          POS System By Nexzoa © 2026 • Terminal Portal
        </div>
      </div>
    </div>
  );
};

