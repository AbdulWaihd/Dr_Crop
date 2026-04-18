"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("dr-crop-auth");
    if (!auth) {
      router.replace("/auth");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("dr-crop-auth");
    router.replace("/auth");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-bold text-on-surface-variant animate-pulse">Authenticating...</p>
      </div>
    );
  }
  return (
    <div className="bg-surface text-on-surface font-body antialiased flex h-screen overflow-hidden">
      {/* SideNavBar */}
      <nav className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/15 bg-surface-container-low flex flex-col p-4 gap-2 hidden md:flex z-40 shadow-sm">
        <div className="mb-8 px-2 pt-2">
          <h1 className="text-2xl font-black text-primary tracking-tighter">drCrop</h1>
          <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mt-1">The Living Laboratory</p>
        </div>
        <div className="flex-1 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest text-primary rounded-xl font-semibold shadow-sm transition-all text-sm">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>grid_view</span>
            Dashboard
          </Link>
          <Link href="/diagnosis" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all rounded-xl text-sm">
            <span className="material-symbols-outlined">camera_enhance</span>
            Diagnosis Hub
          </Link>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all rounded-xl text-sm" href="#">
            <span className="material-symbols-outlined">smart_toy</span>
            Farm Copilot
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all rounded-xl text-sm" href="#">
            <span className="material-symbols-outlined">potted_plant</span>
            Crop History
          </a>
        </div>
        <div className="mt-auto">
          <Link href="/diagnosis">
            <button className="w-full py-3 mb-4 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-semibold text-sm shadow-md hover:opacity-90 transition-all">
              Start Diagnosis
            </button>
          </Link>
          <div className="space-y-1 border-t border-outline-variant/15 pt-2">
            <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all rounded-xl text-sm" href="#">
              <span className="material-symbols-outlined text-[20px]">help_outline</span>
              Support
            </a>
            <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all rounded-xl text-sm" href="#">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              Settings
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 relative flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="bg-surface-container-lowest/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm flex justify-between items-center w-full px-6 py-3 border-b border-outline-variant/15">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm font-body text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search fields, crops, or diagnoses..." type="text"/>
            </div>
            <span className="md:hidden text-xl font-bold tracking-tighter text-primary">drCrop</span>
          </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full bg-surface-container-highest text-on-surface text-xs font-bold shadow-sm hover:bg-surface-variant transition-colors whitespace-nowrap"
            >
              Logout
            </button>
        </header>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-surface custom-scrollbar">
          {/* Hero Welcome */}
          <section className="relative rounded-xl overflow-hidden bg-gradient-to-br from-surface to-surface-container-low p-8 border border-outline-variant/10 shadow-sm">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-2">Good morning, Dr. Aris.</h2>
              <p className="text-lg md:text-xl font-body text-on-surface-variant mb-6">Your farm ecosystem is <span className="text-primary font-semibold">94% healthy</span> today. Ideal conditions detected for Sector B.</p>
              <button className="px-6 py-2.5 rounded-full bg-surface-container-highest text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors shadow-sm inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">summarize</span>
                View Daily Report
              </button>
            </div>
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-30 pointer-events-none hidden md:block">
              <img alt="Lush crops" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJxvuJnARaMMp8IHrxGPRy-flXCTfRxVDTSrEXl7N0FoVqcoSgzYL9r9ISw8JMwI_RSYWpNsVgNjLH7WFhWnuB0VKjQkZZLQoKdTlCJcVq2q1DyLIWoTXRD3fxCYpMF9hhAP9aPGXLy-wWseZsTXp8ZCm9lkUmUrmh3ALmmyUf6Q8VVmB5dfIYL1UfeQAz24GuVBQqXkRCIiLuIr-4TMXrtQLEyhQFU1eD0OmRrC7xB1dPlfK_dFoMP1BSCFH3Wnd7Yl8StmoURvNv"/>
            </div>
          </section>

          {/* Metrics Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Health Index */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Overall Health Index</p>
                  <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">94<span className="text-lg text-on-surface-variant font-medium">/100</span></h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                  <span className="material-symbols-outlined">vital_signs</span>
                </div>
              </div>
              <p className="text-xs text-primary font-medium mt-3 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">trending_up</span> +2% from last week</p>
            </div>
            {/* Active Alerts */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/15">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Active Alerts</p>
                  <h3 className="text-3xl font-headline font-bold text-error mt-1">2</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined">warning</span>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <div className="flex items-start gap-3 bg-error-container/10 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-error text-[18px] mt-0.5">pest_control</span>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Aphid presence detected</p>
                    <p className="text-xs text-on-surface-variant">Sector 4 • High Urgency</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Soil Moisture */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Avg Soil Moisture</p>
                  <h3 className="text-3xl font-headline font-bold text-secondary mt-1">42<span className="text-lg text-on-surface-variant font-medium">%</span></h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">water_drop</span>
                </div>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-6">
                <div className="bg-secondary h-full rounded-full" style={{width: '42%'}}></div>
              </div>
            </div>
          </div>

          {/* Past Diagnoses & Chat Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {/* Past Diagnoses */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/15">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-on-surface">Past Diagnoses</h3>
                  <Link href="/diagnosis" className="text-primary text-sm font-semibold hover:underline">New Scan</Link>
               </div>
               <div className="space-y-4">
                  {[
                    { crop: 'Wheat', zone: 'Sector C', date: '2 hours ago', status: 'Yellow Rust', severity: 'High', color: 'text-error' },
                    { crop: 'Soybean', zone: 'Sector A', date: 'Yesterday', status: 'Healthy', severity: 'None', color: 'text-primary' },
                    { crop: 'Corn', zone: 'Sector B', date: '3 days ago', status: 'Leaf Blight', severity: 'Moderate', color: 'text-error-container' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">potted_plant</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-on-surface">{item.crop} - {item.zone}</h4>
                        <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${item.color}`}>{item.status}</p>
                        <p className="text-xs text-on-surface-variant">Severity: {item.severity}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* AI Copilot Chats */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/15">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-on-surface">Recent Copilot Chats</h3>
                  <button className="text-primary text-sm font-semibold hover:underline">All Chats</button>
               </div>
               <div className="space-y-4">
                  {[
                    { title: 'Treatment for Yellow Rust', msg: 'The recommended fungicide is...', date: '10:45 AM' },
                    { title: 'Irrigation Schedule', msg: 'Based on current soil data...', date: '9:20 AM' },
                    { title: 'Pest Alert', msg: 'Aphid population is rising in...', date: 'Yesterday' },
                  ].map((chat, i) => (
                    <div key={i} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{chat.title}</h4>
                        <span className="text-[10px] bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">{chat.date}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant line-clamp-1">{chat.msg}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #acb3b1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
