import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface AdminAuthProps {
  children: React.ReactNode;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ children }) => {
  console.log('[AdminAuth] Component mounting/rendering');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Admin credentials (in production, this should be in a secure backend)
  const ADMIN_EMAIL = 'laurie@inteligenciadm.com';
  const ADMIN_PASSWORD = 'Inteligencia2025!';

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    console.log('[AdminAuth] Checking auth status:', { authStatus });
    if (authStatus === 'true') {
      console.log('[AdminAuth] User already authenticated');
      setIsAuthenticated(true);
    } else {
      console.log('[AdminAuth] User not authenticated, showing login form');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setError('');
    } else {
      setError('Invalid email or password');
      setEmail('');
      setPassword('');
    }
  };

  if (isAuthenticated) {
    console.log('[AdminAuth] User authenticated, rendering children (AdminPanel)');
    return <>{children}</>;
  }

  console.log('[AdminAuth] User not authenticated, rendering login form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-purple-100">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Welcome Back, You Beautiful Bastard! 
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Ready to make some marketing magic? Let's get you logged in.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@example.com"
                required
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
            >
              Let's Fucking Go! 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};