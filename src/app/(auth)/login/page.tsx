"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/actions/auth";
import { toast } from "sonner";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    studioName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await loginUser({ email: form.email, password: form.password });
        if (result.success) {
          toast.success("Welcome back!");
          router.push("/dashboard");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await registerUser(form);
        if (result.success) {
          toast.success("Account created! Please sign in.");
          setIsLogin(true);
        } else {
          toast.error(result.error);
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950 p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-200/30 dark:bg-violet-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 mb-4">
            <Camera className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            <span className="studio-gradient-text">Botadi</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Camera Studio Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {isLogin ? "Sign in to your studio dashboard" : "Set up your studio management"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Studio Name
                  </label>
                  <input
                    type="text"
                    value={form.studioName}
                    onChange={(e) => setForm({ ...form, studioName: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Botadi Studio"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="admin@botadi.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all duration-200 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
