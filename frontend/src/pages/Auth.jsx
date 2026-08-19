// src/pages/Auth.jsx
import { useState } from 'react';
import { Mail, Lock, User, LogIn } from 'lucide-react';

import { authApi } from '../services/api';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(() => new URLSearchParams(window.location.search).get('mode') === 'signup');
  const [forgotMode, setForgotMode] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    role: 'student'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const switchToSignUp = () => {
    setForgotMode(false);
    setResetToken('');
    setError('');
    setIsSignUp(true);
    window.history.replaceState({}, '', '/auth?mode=signup');
  };

  const switchToSignIn = () => {
    setForgotMode(false);
    setResetToken('');
    setError('');
    setIsSignUp(false);
    window.history.replaceState({}, '', '/auth');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (forgotMode) {
      setLoading(true);
      try {
        if (!resetToken) {
          const res = await authApi.forgotPassword({ email: formData.email });
          if (!res.resetToken) {
            setError(res.message || 'If an account exists, reset instructions were created.');
          } else {
            setResetToken(res.resetToken);
            setError('Reset request created. Choose a new password below.');
          }
        } else {
          if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
          }
          if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          await authApi.resetPassword({ token: resetToken, password: formData.password });
          setForgotMode(false);
          setResetToken('');
          setFormData((current) => ({ ...current, password: '', confirmPassword: '' }));
          setError('Password reset successfully. You can now sign in.');
        }
      } catch (err) {
        setError(err?.message || 'Unable to reset password');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        setError('Full Name is required');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      const res = isSignUp
        ? await authApi.register({
            fullName: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            role: formData.role,
          })
        : await authApi.login({ email: formData.email.trim().toLowerCase(), password: formData.password });

      if (res?.token) localStorage.setItem('token', res.token);

      // Full reload so the navbar + nav context pick up the new role/session,
      // landing on the right home screen for the user's role.
      const landing = res?.user?.role === 'landlord' ? '/host-dashboard' : '/listings';
      window.location.assign(landing);
    } catch (err) {
      setError(err?.message || (typeof err === 'string' ? err : 'Failed to authenticate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="relative">
        <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text-primary">
                  {forgotMode ? (resetToken ? 'Choose a new password' : 'Reset your password') : isSignUp ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  {forgotMode ? 'Remembered your password? ' : isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={forgotMode || isSignUp ? switchToSignIn : switchToSignUp}
                    className="font-semibold text-brand-primaryDark underline decoration-brand-primary/40 underline-offset-4 hover:text-brand-primary dark:hover:text-brand-primaryLight focus:outline-none"
                  >
                    {forgotMode || isSignUp ? 'Sign in' : 'Create an account'}
                  </button>
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-error/10 border border-error/30 p-3 text-sm text-error">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {isSignUp && !forgotMode && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
                      Full Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-text-muted" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded-md border-border shadow-sm focus:border-brand-primary focus:ring-blue-500 dark:bg-[#2E4057]"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                {isSignUp && !forgotMode && (
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-text-secondary">
                      Account Type
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-brand-primary focus:ring-blue-500 dark:bg-[#2E4057]"
                    >
                      <option value="student">Student</option>
                      <option value="landlord">Landlord</option>
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-muted" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border-border shadow-sm focus:border-brand-primary focus:ring-blue-500 dark:bg-[#2E4057]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {(!forgotMode || resetToken) && <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-muted" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border-border shadow-sm focus:border-brand-primary focus:ring-blue-500 dark:bg-[#2E4057]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>}

                {(isSignUp || (forgotMode && resetToken)) && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
                      Confirm Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-text-muted" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded-md border-border shadow-sm focus:border-brand-primary focus:ring-blue-500 dark:bg-[#2E4057]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {!forgotMode && <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-brand-primaryDark focus:ring-blue-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                      Remember me
                    </label>
                  </div>

                  {!isSignUp && (
                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotMode(true);
                          setIsSignUp(false);
                          setError('');
                        }}
                        className="font-medium text-brand-primaryDark hover:text-brand-primary dark:hover:text-brand-primaryLight"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}
                </div>}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primaryDark hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    style={{ backgroundColor: 'var(--brand-primary-dark)', color: 'var(--text-inverse)' }}
                  >
                    {loading ? 'Please wait...' : forgotMode ? (resetToken ? 'Reset password' : 'Send reset instructions') : isSignUp ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;