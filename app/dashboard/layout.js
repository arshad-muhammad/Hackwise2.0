'use client';
import Background from '@/app/components/Background';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-blue-500/30">
      <Background />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
