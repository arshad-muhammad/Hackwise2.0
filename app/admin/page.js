import pool from '@/lib/db';
import Link from 'next/link';
import RegistrationStatusToggle from './components/RegistrationStatusToggle';
import PaymentWindowToggle from './components/PaymentWindowToggle';

async function getStats() {
  const stats = {
    totalVisitors: 0,
    liveVisitors: 0,
    totalQueries: 0,
    pendingQueries: 0
  };

  try {
    const [visitors] = await pool.query('SELECT COUNT(*) as count FROM `hw-visitors`');
    stats.totalVisitors = visitors[0].count;

    // Live visitors (active in last 5 minutes)
    const [live] = await pool.query('SELECT COUNT(*) as count FROM `hw-visitors` WHERE last_seen > NOW() - INTERVAL 5 MINUTE');
    stats.liveVisitors = live[0].count;

    const [queries] = await pool.query('SELECT COUNT(*) as count FROM `hw-contact`');
    stats.totalQueries = queries[0].count;

    const [pending] = await pool.query('SELECT COUNT(*) as count FROM `hw-contact` WHERE is_resolved = FALSE');
    stats.pendingQueries = pending[0].count;
  } catch (e) {
    console.error('Error fetching stats:', e);
  }

  return stats;
}

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-mono font-bold text-white uppercase mb-8">
        System <span className="text-orange-500">Overview</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Visitors" 
          value={stats.totalVisitors} 
          icon="ri-user-line"
          color="blue"
        />
        <StatCard 
          label="Live Now" 
          value={stats.liveVisitors} 
          icon="ri-pulse-line"
          color="green"
          animate
        />
        <StatCard 
          label="Total Queries" 
          value={stats.totalQueries} 
          icon="ri-message-3-line"
          color="purple"
        />
        <StatCard 
          label="Pending Issues" 
          value={stats.pendingQueries} 
          icon="ri-error-warning-line"
          color="orange"
          href="/admin/queries"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="p-6 border border-white/10 bg-white/5 rounded-lg">
          <h3 className="text-xl font-mono text-white mb-4 uppercase">Quick Actions</h3>
          <div className="space-y-4">
             <Link href="/admin/queries" className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded group">
               <div className="flex items-center justify-between">
                 <span className="text-white/80 group-hover:text-orange-500 font-mono">View Contact Queries</span>
                 <i className="ri-arrow-right-line text-white/40 group-hover:text-orange-500"/>
               </div>
             </Link>
             <Link href="/admin/analytics" className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded group">
               <div className="flex items-center justify-between">
                 <span className="text-white/80 group-hover:text-orange-500 font-mono">Check Analytics Report</span>
                 <i className="ri-arrow-right-line text-white/40 group-hover:text-orange-500"/>
               </div>
             </Link>
          </div>
        </div>
        
        <div className="p-6 border border-white/10 bg-white/5 rounded-lg">
           <h3 className="text-xl font-mono text-white mb-4 uppercase">System Status</h3>
           <div className="space-y-4 font-mono text-sm">
             <div className="flex justify-between items-center py-2 border-b border-white/10">
               <span className="text-white/60">Database</span>
               <span className="text-green-500">Connected</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-white/10">
               <span className="text-white/60">Analytics Engine</span>
               <span className="text-green-500">Active</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-white/10">
               <span className="text-white/60">Security</span>
               <span className="text-green-500">Enforced</span>
             </div>
             <RegistrationStatusToggle />
             <PaymentWindowToggle />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, animate, href }) {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  };

  const content = (
    <div className={`p-6 border rounded-lg ${colors[color]} backdrop-blur-sm transition-transform hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-mono uppercase tracking-wider opacity-80 mb-1">{label}</p>
          <h3 className="text-4xl font-mono font-bold">{value}</h3>
        </div>
        <div className={`text-2xl ${animate ? 'animate-pulse' : ''}`}>
          <i className={icon} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

