'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart2, 
  MessageSquare, 
  FileText, 
  Settings,
  LogOut,
  Users,
  Megaphone
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // If on login page, don't show the layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/admin/queries', label: 'Queries', icon: MessageSquare },
    { href: '/admin/teams', label: 'Teams', icon: Users },
    { href: '/admin/submissions', label: 'Project Submissions', icon: FileText },
    { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/admin/faq', label: 'Manage FAQ', icon: FileText },
    { href: '/admin/logs', label: 'System Logs', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen w-full text-white font-mono">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-white/5 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-orange-500 uppercase tracking-widest">
            Admin<span className="text-white">Panel</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                  isActive 
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="uppercase text-sm tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
             onClick={async () => {
               try {
                 await fetch('/api/admin/logout', { method: 'POST' });
                 window.location.href = '/admin/login';
               } catch (error) {
                 console.error('Logout failed:', error);
                 // Fallback to client-side redirect if API fails
                 window.location.href = '/admin/login';
               }
             }}
             className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/60 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
          >
            <LogOut size={18} />
            <span className="uppercase text-sm tracking-wider">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

