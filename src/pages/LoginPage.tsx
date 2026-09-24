import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Waves, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        setError('Invalid credentials! Use username: admin, password: admin123');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0A192F] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#0B4EAE]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700/50 z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 bg-gradient-to-tr from-[#0B4EAE] to-[#00D2FF] text-white rounded-2xl shadow-lg mb-3">
            <Waves className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">OCEAN CHEF</h1>
          <p className="text-xs text-slate-500 font-medium">Hotel & Restaurant Management System</p>
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
            placeholder="Enter username"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            placeholder="Enter password"
            required
          />

          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">Demo Login Credentials:</p>
            <p>Username: <code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-mono">admin</code></p>
            <p>Password: <code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-mono">admin123</code></p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 bg-[#0B4EAE] hover:bg-[#093D89]"
            isLoading={isLoading}
          >
            Sign In to Terminal
          </Button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-200/80 text-center text-xs text-slate-400">
          Ocean Chef Hotel System © 2026 • Single Admin Portal
        </div>
      </div>
    </div>
  );
};
