"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock auth delay
    await new Promise(r => setTimeout(r, 1200));
    localStorage.setItem("dr-crop-auth", "true");
    router.push("/diagnosis");
  };

  return (
    <div className="bg-surface text-on-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex">
      {/* Left Split: Atmospheric Image & Branding (Sticky to prevent resizing) */}
      <div className="hidden lg:flex lg:w-1/2 lg:h-screen lg:sticky lg:top-0 relative bg-surface-container-low p-8 lg:p-12 overflow-hidden flex-col">
        {/* Fixed Rounded Container for Image */}
        <div className="relative flex-1 w-full rounded-2xl overflow-hidden group shadow-2xl border border-outline-variant/15">
          {/* Background Image with Hover Zoom */}
          <img 
            alt="Lush field at sunrise" 
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-110 cursor-pointer" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhGJYBgsNh4pZ7Khu4XAcz8a2D8hUJES_7ao_Kq5E9XPsfSUpitWJNBkT8NHTSLKCGMQ7NLqUwsrICo_lgnkr9sCpqVxEDBE_4mgpStC_mixx19qQ-w5-CEDorWT8HYspwgcW0GpNKS6cVeVKQVU8xzT0jXOJEbeNfjCT-_FJIAISgrn_zv9Yz-7llq7UPzOz3VP2ttgNgQ6WnLasPd_WbOEUuzYocGJ6WRCpAxWIGwIYtMFbtVst9-z50VUaA6po_TACGPPBv4baT" 
          />
          {/* Gradient Overlay for high contrast text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none"></div>
          
          {/* Content positioned over image */}
          <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full h-full pointer-events-none">
            {/* Brand Logo Space */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
              <span className="font-headline font-black text-3xl tracking-tighter text-white">drCrop</span>
            </div>
            {/* Typography Anchor */}
            <div className="max-w-xl">
              <h1 className="font-headline text-5xl xl:text-6xl font-black text-white tracking-tighter leading-[1] mb-6 drop-shadow-2xl">
                Precision Farming.<br/>Absolute Clarity.
              </h1>
              <p className="font-body text-lg text-white/90 font-bold leading-relaxed max-w-sm drop-shadow-md">
                Harness diagnostic intelligence to cultivate vitality at scale. Welcome back to the laboratory.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Split: Minimalist Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 bg-surface">
        {/* Mobile Logo (hidden on desktop) */}
        <div className="flex items-center gap-2 mb-12 lg:hidden">
          <span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
          <span className="font-headline font-black text-2xl tracking-tighter text-on-surface">drCrop</span>
        </div>
        
        {/* Form Canvas Area */}
        <div className="w-full max-w-[440px]">
          {/* Contextual Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="font-headline text-4xl font-black tracking-tight text-on-surface mb-3">
              {isLogin ? "Access Portal" : "Enrollment"}
            </h2>
            <p className="font-body text-on-surface-variant font-medium text-lg">
              {isLogin ? "Continue your diagnostic journey." : "Join the frontier of agricultural science."}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-2xl border border-outline-variant/15 relative overflow-hidden">
            {/* Toggle Segment */}
            <div className="flex bg-surface-container-low rounded-full p-1.5 mb-10 border border-outline-variant/10">
              <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-full font-headline font-black text-sm transition-all text-center ${isLogin ? "bg-surface-container-lowest shadow-md text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                LogIN
              </button>
              <button 
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-full font-headline font-black text-sm transition-all text-center ${!isLogin ? "bg-surface-container-lowest shadow-md text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Register
              </button>
            </div>

            {/* Form Fields */}
            <form className="space-y-6" onSubmit={handleAuth}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary px-1" htmlFor="email text">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl py-4 pl-12 pr-4 text-on-surface font-medium placeholder:text-outline-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest focus:border-transparent transition-all" 
                    id="email" 
                    placeholder="investigator@farm.co" 
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="password">Password</label>
                  {isLogin && <a className="text-[10px] font-bold text-primary hover:text-primary-dim uppercase tracking-widest" href="#">Forgot?</a>}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl py-4 pl-12 pr-4 text-on-surface font-medium placeholder:text-outline-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest focus:border-transparent transition-all" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary px-1" htmlFor="confirmPassword">Verify Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">verified_user</span>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl py-4 pl-12 pr-4 text-on-surface font-medium placeholder:text-outline-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest focus:border-transparent transition-all" 
                      id="confirmPassword" 
                      placeholder="••••••••" 
                      type="password"
                    />
                  </div>
                </div>
              )}

              <button 
                disabled={isLoading}
                className="w-full mt-10 bg-primary text-on-primary font-black text-xl py-5 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-dim hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                type="submit"
              >
                {isLoading ? (
                   <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                ) : (
                   isLogin ? "LogIN" : "Get Started"
                )}
              </button>
            </form>

            <div className="relative flex items-center py-10">
              <div className="flex-grow border-t border-outline-variant/20"></div>
              <span className="flex-shrink-0 mx-4 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest bg-surface-container-lowest px-2">Secure Gateway</span>
              <div className="flex-grow border-t border-outline-variant/20"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => alert("Google Identity initiation...")}
                className="flex-1 flex items-center justify-center gap-3 bg-surface-container-low hover:bg-surface-container border border-outline-variant/15 text-on-surface font-bold py-4 px-4 rounded-full transition-colors"
                type="button"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
                Google
              </button>
              <button 
                onClick={() => alert("LinkedIn Identity initiation...")}
                className="flex-1 flex items-center justify-center gap-3 bg-surface-container-low hover:bg-surface-container border border-outline-variant/15 text-on-surface font-bold py-4 px-4 rounded-full transition-colors"
                type="button"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0A66C2"></path></svg>
                LinkedIn
              </button>
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-on-surface-variant font-medium leading-relaxed">
            Authorized access only. By proceeding, you agree to drCrop&apos;s <a className="text-primary font-black hover:underline" href="#">Terms</a> and <a className="text-primary font-black hover:underline" href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
