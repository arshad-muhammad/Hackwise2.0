'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  LogOut,
  Send,
  Plus,
  Crown,
  CheckCircle2,
  Upload,
  Edit2,
  Trash2,
  Bell,
  Save,
  CreditCard,
  Building,
  GraduationCap,
  Calendar,
  Phone,
  QrCode,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DecryptedText from '@/app/components/DecryptedText';

import ProjectSubmissionTab from './components/ProjectSubmissionTab';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  
  // Forms state
  const [msgInput, setMsgInput] = useState('');
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({});
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', role: 'MEMBER', phone: '', college: '', branch: '', year: '' });
  
  // Member Edit State
  const [editingMember, setEditingMember] = useState(null);
  const [editMemberForm, setEditMemberForm] = useState({});

  // Chat scroll
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDashboard();
    const storedIdentity = localStorage.getItem('hw_team_identity');
    if (storedIdentity) {
      setIdentity(JSON.parse(storedIdentity));
    } else {
      setShowIdentityModal(true);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
      const interval = setInterval(fetchDashboard, 5000); 
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/team/dashboard');
      if (res.status === 401) {
        router.push('/dashboard/login');
        return;
      }
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoin = async (role) => {
    const nameInput = document.getElementById('join-name').value;
    if (!nameInput) return;

    if (role === 'LEAD') {
       if (data.team.lead_name && data.team.lead_name !== nameInput) {
         if (!confirm('Lead name does not match records. Continue anyway?')) return;
       }
    }

    const newIdentity = { name: nameInput, role };
    setIdentity(newIdentity);
    localStorage.setItem('hw_team_identity', JSON.stringify(newIdentity));
    setShowIdentityModal(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    await fetch('/api/team/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_name: identity.name,
        message: msgInput
      })
    });
    setMsgInput('');
    fetchDashboard(); 
  };

  const openEditTeam = () => {
    setTeamForm({
      team_name: data.team.team_name,
      lead_name: data.team.lead_name,
      lead_email: data.team.lead_email,
      lead_phone: data.team.lead_phone,
      lead_college: data.team.lead_college,
      lead_branch: data.team.lead_branch,
      lead_year: data.team.lead_year,
      logo_url: data.team.logo_url
    });
    setIsEditingTeam(true);
  };

  const saveTeam = async (e) => {
    // If e is an event (from button click without logo upload), prevent default.
    // If called from file upload logic, we might not have 'e'.
    if (e?.preventDefault) e.preventDefault();

    try {
      let logoUrl = teamForm.logo_url;

      // Handle logo upload if a file is selected
      const logoInput = document.getElementById('team-logo-upload');
      if (logoInput?.files?.length > 0) {
        const formData = new FormData();
        formData.append('file', logoInput.files[0]);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error('Logo upload failed');
        const { url } = await uploadRes.json();
        logoUrl = url;
      }

      const res = await fetch('/api/team/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...teamForm, logo_url: logoUrl })
      });
      if (res.ok) {
        setIsEditingTeam(false);
        fetchDashboard();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update team details');
    }
  };

  const submitPayment = async (transaction_id, file) => {
    if (!transaction_id || !file) return alert('Please enter Transaction ID and upload a screenshot');
    
    setLoading(true); // Show global loading or handle locally
    try {
      // 1. Upload File
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { url } = await uploadRes.json();
      
      // 2. Update Team
      await fetch('/api/team/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transaction_id, 
          payment_screenshot_url: url 
        })
      });
      
      fetchDashboard();
    } catch (error) {
      console.error(error);
      alert('Failed to submit payment proof');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm)
      });
      if (res.ok) {
        setIsAddingMember(false);
        setMemberForm({ name: '', email: '', role: 'MEMBER', phone: '', college: '', branch: '', year: '' });
        fetchDashboard();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add member');
      }
    } catch (error) {
      console.error(error);
      alert('Error adding member');
    }
  };

  const deleteMember = async (id) => {
    if (!confirm('Remove this member?')) return;
    try {
      await fetch(`/api/team/members?id=${id}`, { method: 'DELETE' });
      fetchDashboard();
    } catch (error) {
      console.error(error);
    }
  };

  // Edit Member Functions
  const startEditMember = (member) => {
    setEditingMember(member.id);
    setEditMemberForm({ ...member });
  };

  const cancelEditMember = () => {
    setEditingMember(null);
    setEditMemberForm({});
  };

  const saveMember = async () => {
    try {
        const res = await fetch('/api/team/members', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editMemberForm)
        });
        if (res.ok) {
            setEditingMember(null);
            fetchDashboard();
        } else {
            alert('Failed to update member');
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/team/logout', { method: 'POST' });
    router.push('/dashboard/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-white"><div className="animate-spin text-4xl">C</div></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'project', label: 'Project', icon: FileText },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center w-full px-4 md:px-8 py-8 md:py-12">
      
      {/* Header / Nav */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"/>
                <span className="font-mono text-xs text-orange-500 uppercase tracking-widest">
                Team Dashboard
                </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tight text-white leading-none">
                {data?.team?.team_name || 'HackWise'}
            </h1>
          </div>

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-1 rounded-none backdrop-blur-md overflow-x-auto max-w-full"
             style={{
                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
             }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 transition-all text-sm font-bold font-mono uppercase tracking-wider ${
                activeTab === tab.id 
                  ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={{
                clipPath: activeTab === tab.id ? "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" : "none"
              }}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
          <div className="h-8 w-px bg-white/10 mx-2"></div>
          <button 
            onClick={handleLogout}
            className="p-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto flex-1 relative min-h-[600px]">
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Announcements Column */}
              <div className="lg:col-span-2 space-y-8">
                {data.announcements.length > 0 ? (
                  <div className="relative bg-white/10 p-[1px] backdrop-blur-md group overflow-hidden"
                       style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                  >
                    <div className="relative h-full w-full bg-black/80 p-8"
                         style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                    >
                         {/* Tech Background Grid */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                         
                         {/* Decorative Corners */}
                         <div className="absolute top-0 left-0 w-2 h-2 bg-orange-500 z-10 shadow-[0_0_10px_rgba(249,115,22,0.8)]"/>
                         <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500 z-10 shadow-[0_0_10px_rgba(249,115,22,0.8)]"/>
                         
                         <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Bell size={120} />
                         </div>
                         <h3 className="font-display text-3xl font-bold mb-8 flex items-center gap-4 text-white uppercase tracking-wide relative z-10">
                           <span className="text-orange-500 text-4xl">#</span> 
                           <DecryptedText text="SYSTEM_ANNOUNCEMENTS" sequential speed={30} />
                         </h3>
                         <div className="space-y-4 relative z-10">
                            {data.announcements.map(ann => (
                              <div key={ann.id} className="relative bg-white/5 border-l-2 border-orange-500 p-6 hover:bg-white/10 transition-colors group/item">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-bold text-orange-100 font-mono uppercase tracking-tight group-hover/item:text-orange-400 transition-colors">{ann.title}</h4>
                                    <span className="text-[10px] font-mono text-orange-500/60 bg-black/40 px-2 py-1 border border-orange-500/20 rounded">
                                        {new Date(ann.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-white/70 leading-relaxed text-sm font-sans pl-4 border-l border-white/10">{ann.message}</p>
                              </div>
                            ))}
                         </div>
                    </div>
                  </div>
                ) : (
                    <div className="relative bg-white/10 p-[1px] backdrop-blur-md opacity-50 hover:opacity-100 transition-opacity"
                         style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                    >
                        <div className="relative h-full w-full bg-black/80 p-12 flex flex-col items-center justify-center text-center"
                             style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                        >
                            <Bell size={48} className="text-white/20 mb-4" />
                            <p className="font-mono text-white/40 uppercase tracking-widest">No Active Announcements</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team Card */}
                  <div className="relative bg-white/10 p-[1px] backdrop-blur-md group overflow-hidden"
                       style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                  >
                    <div className="relative h-full w-full bg-black/80 p-8"
                         style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                        <div className="absolute top-0 left-0 w-2 h-2 bg-orange-500 z-10"/>
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <h3 className="font-mono text-xs text-orange-500 font-bold uppercase tracking-[0.2em]">
                            :: TEAM_DATA
                          </h3>
                          {identity?.role === 'LEAD' && (
                            <button onClick={openEditTeam} className="text-white/40 hover:text-orange-500 transition-colors">
                              <Edit2 size={16} />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-6 relative z-10">
                          <div>
                            <div className="text-3xl lg:text-4xl font-display font-bold text-white mb-1 uppercase break-words leading-none">
                                {data.team.lead_name || 'N/A'}
                            </div>
                            <div className="text-white/40 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                Team Lead
                            </div>
                            <div className="text-white/60 font-mono text-xs mt-2 pl-4 border-l border-white/10">{data.team.lead_email}</div>
                          </div>
                          
                          <div className="pt-6 border-t border-white/10">
                            <div className="text-white/40 font-mono text-[10px] uppercase tracking-wider mb-2">Access Key</div>
                            <div className="flex items-center gap-3">
                               <div className="bg-orange-500/5 border border-orange-500/30 px-4 py-2 text-orange-500 font-mono text-xl font-bold tracking-[0.2em] w-full text-center relative overflow-hidden group-hover:bg-orange-500/10 transition-colors">
                                 <span className="relative z-10">{data.team.access_key}</span>
                                 <div className="absolute inset-0 bg-orange-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                               </div>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>

                  {/* Payment Status Summary */}
                  <div className="relative bg-white/10 p-[1px] backdrop-blur-md flex flex-col items-center justify-center text-center group overflow-hidden"
                       style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                  >
                    <div className="relative h-full w-full bg-black/80 p-8 flex flex-col items-center justify-center"
                         style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500 z-10"/>
                        
                        <div className={`w-24 h-24 flex items-center justify-center mb-6 relative z-10`}>
                            <div className={`absolute inset-0 opacity-20 blur-2xl rounded-full ${data.team.payment_status === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                            <div className={`w-full h-full border-2 ${data.team.payment_status === 'PAID' ? 'border-green-500/50' : 'border-yellow-500/50'} rounded-full flex items-center justify-center bg-black/50`}>
                                {data.team.payment_status === 'PAID' 
                                    ? <CheckCircle2 size={40} className="text-green-400" /> 
                                    : <CreditCard size={40} className="text-yellow-400" />
                                }
                            </div>
                        </div>
                        <h3 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-2 relative z-10">Registration</h3>
                        <p className={`font-display text-3xl font-bold uppercase tracking-tight relative z-10 ${
                            data.team.payment_status === 'PAID' 
                                ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' 
                                : 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                        }`}>
                            <DecryptedText text={data.team.payment_status} sequential speed={50} />
                        </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info Column */}
              <div className="space-y-6">
                <div className="h-full relative bg-white/10 p-[1px] backdrop-blur-md flex flex-col overflow-hidden"
                     style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                >
                  <div className="relative h-full w-full bg-black/80 p-8 flex flex-col"
                       style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                  >
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                      <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 z-10"/>
                      
                      <h3 className="font-mono text-xs text-orange-500 font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                        Identity_Matrix
                      </h3>
                      
                      <div className="flex flex-col items-center text-center mb-8 relative z-10">
                        <div className="w-28 h-28 bg-linear-to-br from-orange-500 to-red-600 p-0.5 mb-6 shadow-[0_0_20px_rgba(249,115,22,0.3)]" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}>
                            <div className="w-full h-full bg-black flex items-center justify-center text-5xl font-bold text-white uppercase" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}>
                                {identity?.name?.[0]}
                            </div>
                        </div>
                        <p className="font-display text-2xl font-bold text-white uppercase tracking-wide">{identity?.name}</p>
                        <div className="inline-block mt-3 px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 text-[10px] font-mono text-orange-500 uppercase tracking-[0.2em]">
                            {identity?.role}
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-8 border-t border-white/10 relative z-10">
                        <div className="flex justify-between items-center text-[10px] text-white/30 font-mono uppercase tracking-widest">
                            <span>Session Active</span>
                            <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="w-full h-0.5 bg-white/5 mt-2 overflow-hidden">
                            <div className="h-full bg-orange-500/50 w-1/3 animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PROJECT TAB */}
          {activeTab === 'project' && (
            <motion.div 
               key="project"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="w-full h-full flex flex-col items-center justify-center min-h-[500px]"
            >
               <ProjectSubmissionTab identity={identity} />
            </motion.div>
          )}

          {/* PAYMENT TAB */}
          {activeTab === 'payment' && (
            <motion.div 
               key="payment"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="w-full h-full flex flex-col items-center justify-center min-h-[500px]"
            >
               <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* QR Code Section */}
                  <div className="relative bg-white/10 p-[1px] backdrop-blur-md flex flex-col items-center justify-center text-center group transition-all"
                       style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                  >
                     <div className="relative h-full w-full bg-black/80 p-8 flex flex-col items-center justify-center"
                          style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                     >
                         <div className="absolute top-0 left-0 w-2 h-2 bg-orange-500 z-10"/>
                         
                         <h2 className="text-3xl font-display font-bold mb-2 uppercase text-white tracking-wide">SCAN & PAY</h2>
                         <p className="text-white/50 mb-8 font-mono text-sm">Use any UPI App (GPay, PhonePe, Paytm)</p>
                         
                         <div className="bg-white p-4 mb-6 relative group-hover:scale-105 transition-transform duration-300">
                            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20"></div>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=muhammadarshadra2-1@okaxis&pn=HackWise&tn=RegistrationFee`}
                              alt="Payment QR Code"
                              className="w-64 h-64 object-contain relative z-10"
                            />
                         </div>
                         <p className="font-mono bg-white/5 border border-white/10 px-6 py-3 text-orange-500 select-all tracking-wider text-sm hover:bg-orange-500/10 cursor-pointer transition-colors">
                            muhammadarshadra2-1@okaxis
                         </p>
                     </div>
                  </div>

                  {/* Submission Section */}
                  <div className="relative bg-white/10 p-[1px] backdrop-blur-md flex flex-col group transition-all"
                       style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                  >
                     <div className="relative h-full w-full bg-black/80 p-8 flex flex-col"
                          style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                     >
                         <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500 z-10"/>
                         
                         <h2 className="text-3xl font-display font-bold mb-8 uppercase text-white tracking-wide">SUBMIT PROOF</h2>
                         
                         <div className="flex-1 flex flex-col justify-center">
                         {data.team.payment_status === 'PAID' ? (
                           <div className="flex flex-col items-center justify-center text-green-400 space-y-4">
                              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-pulse">
                                <CheckCircle2 size={40} />
                              </div>
                              <h3 className="text-2xl font-bold font-display uppercase tracking-widest">PAYMENT VERIFIED</h3>
                              <p className="text-center text-white/50 font-mono text-sm border-t border-white/10 pt-4 w-full">Your registration is confirmed.</p>
                           </div>
                         ) : data.team.transaction_id ? (
                           <div className="flex flex-col items-center justify-center text-yellow-400 space-y-4">
                              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center animate-pulse">
                                 <CreditCard size={40} />
                              </div>
                              <h3 className="text-xl font-bold font-display uppercase tracking-widest text-center">VERIFICATION PENDING</h3>
                              <p className="text-center text-white/50 font-mono text-sm mb-4">Admin is reviewing your payment.</p>
                              <div className="bg-white/5 border border-white/10 w-full p-4 text-left">
                                <p className="text-xs text-white/40 mb-1 font-mono uppercase">Transaction ID</p>
                                <p className="font-mono text-white text-lg tracking-widest">{data.team.transaction_id}</p>
                              </div>
                           </div>
                         ) : (
                           <div className="space-y-6">
                              <div>
                                <label className="block text-xs font-mono text-orange-500 mb-2 uppercase tracking-widest font-bold">Transaction ID</label>
                                <input 
                                  id="payment-tid"
                                  type="text" 
                                  placeholder="e.g. T1234567890"
                                  className="w-full bg-black/20 border border-white/20 px-6 py-4 text-white focus:outline-none focus:border-orange-500 font-mono transition-colors placeholder:text-white/10"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-mono text-orange-500 mb-2 uppercase tracking-widest font-bold">Screenshot Upload</label>
                                <input 
                                  id="payment-file"
                                  type="file" 
                                  accept="image/*"
                                  className="w-full bg-black/20 border border-white/20 px-4 py-3 text-white/70 font-mono file:mr-4 file:py-2 file:px-4 file:bg-orange-500 file:text-black file:font-bold file:border-0 hover:file:bg-orange-600 transition-colors cursor-pointer"
                                />
                              </div>
                              
                              {identity?.role === 'LEAD' ? (
                                <button 
                                  onClick={() => {
                                    const tid = document.getElementById('payment-tid').value;
                                    const fileInput = document.getElementById('payment-file');
                                    const file = fileInput.files[0];
                                    submitPayment(tid, file);
                                  }}
                                  className="w-full bg-orange-500 text-black py-4 font-bold font-mono text-lg uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] mt-4"
                                  style={{
                                      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                                  }}
                                >
                                  <DecryptedText text="SUBMIT FOR APPROVAL" sequential speed={40} />
                                </button>
                              ) : (
                                <div className="bg-white/5 border-l-2 border-red-500 p-4 text-center text-sm text-white/40 font-mono mt-4">
                                  Only Team Lead can submit payment proof.
                                </div>
                              )}
                           </div>
                         )}
                         </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <motion.div 
               key="members"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Lead Card (Static/Editable via Team Edit) */}
              <div className="relative bg-white/10 p-[1px] backdrop-blur-md group transition-all"
                   style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
              >
                  <div className="relative h-full w-full bg-black/80 p-8 flex flex-col"
                       style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                  >
                     <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500/50 rounded-tr-lg group-hover:border-orange-500 transition-colors" />
                     
                     <div className="flex justify-between items-start mb-6 relative z-10">
                       <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-red-600 p-0.5" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}>
                            <div className="w-full h-full bg-black flex items-center justify-center text-2xl font-bold text-white uppercase" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}>
                                {data.team.lead_name?.[0]}
                            </div>
                       </div>
                       <div className="bg-orange-500/10 border border-orange-500/30 p-2">
                            <Crown size={20} className="text-orange-500" />
                       </div>
                     </div>
                     
                     <div className="mb-6">
                        <h3 className="font-display text-2xl font-bold text-white uppercase tracking-tight">{data.team.lead_name}</h3>
                        <p className="text-white/50 text-sm font-mono truncate">{data.team.lead_email}</p>
                     </div>
                     
                     <div className="mt-auto space-y-3 pt-6 border-t border-white/10 text-xs text-white/60 font-mono">
                        <div className="flex items-center gap-3">
                          <Phone size={14} className="text-orange-500" /> 
                          <span className="uppercase tracking-wider">{data.team.lead_phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Building size={14} className="text-orange-500" /> 
                          <span className="uppercase tracking-wider">{data.team.lead_college || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <GraduationCap size={14} className="text-orange-500" /> 
                          <span className="uppercase tracking-wider">{data.team.lead_branch || 'N/A'} • {data.team.lead_year || 'N/A'}</span>
                        </div>
                     </div>
                     
                     <div className="absolute top-4 right-14">
                        <span className="text-[10px] text-orange-500 font-bold font-mono bg-orange-500/10 border border-orange-500/20 px-2 py-1 uppercase tracking-widest">Team Lead</span>
                     </div>
                  </div>
              </div>

              {/* Members List */}
              {data.members.map((member, i) => (
                <div key={member.id} className="relative bg-white/10 p-[1px] backdrop-blur-md group transition-all"
                     style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                >
                   <div className="relative h-full w-full bg-black/80 p-8 flex flex-col"
                        style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                   >
                       {editingMember === member.id ? (
                            // Edit Mode
                            <div className="space-y-4 font-mono text-sm relative z-10">
                                <input 
                                    value={editMemberForm.name || ''} 
                                    onChange={e => setEditMemberForm({...editMemberForm, name: e.target.value})}
                                    className="w-full bg-black/20 border border-orange-500/50 px-4 py-2 text-white focus:outline-none"
                                    placeholder="Name"
                                />
                                <input 
                                    value={editMemberForm.email || ''} 
                                    onChange={e => setEditMemberForm({...editMemberForm, email: e.target.value})}
                                    className="w-full bg-black/20 border border-orange-500/50 px-4 py-2 text-white focus:outline-none"
                                    placeholder="Email"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input 
                                        value={editMemberForm.phone || ''} 
                                        onChange={e => setEditMemberForm({...editMemberForm, phone: e.target.value})}
                                        className="bg-black/20 border border-orange-500/50 px-3 py-2 text-xs text-white focus:outline-none"
                                        placeholder="Phone"
                                    />
                                    <input 
                                        value={editMemberForm.college || ''} 
                                        onChange={e => setEditMemberForm({...editMemberForm, college: e.target.value})}
                                        className="bg-black/20 border border-orange-500/50 px-3 py-2 text-xs text-white focus:outline-none"
                                        placeholder="College"
                                    />
                                    <input 
                                        value={editMemberForm.branch || ''} 
                                        onChange={e => setEditMemberForm({...editMemberForm, branch: e.target.value})}
                                        className="bg-black/20 border border-orange-500/50 px-3 py-2 text-xs text-white focus:outline-none"
                                        placeholder="Branch"
                                    />
                                    <input 
                                        value={editMemberForm.year || ''} 
                                        onChange={e => setEditMemberForm({...editMemberForm, year: e.target.value})}
                                        className="bg-black/20 border border-orange-500/50 px-3 py-2 text-xs text-white focus:outline-none"
                                        placeholder="Year"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={cancelEditMember} className="p-2 hover:bg-white/10 text-white/50 hover:text-white transition-colors"><X size={18}/></button>
                                    <button onClick={saveMember} className="p-2 bg-orange-500 text-black font-bold hover:brightness-110 transition-all"><Save size={18}/></button>
                                </div>
                            </div>
                       ) : (
                            // View Mode
                            <>
                               <div className="absolute top-0 left-0 w-2 h-2 bg-white/20 group-hover:bg-white/50 transition-colors z-10"/>
                               
                               <div className="flex justify-between items-start mb-6 relative z-10">
                                 <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white/80 font-mono">
                                   {member.name[0]}
                                 </div>
                                 {/* Action Buttons for Lead */}
                                 {identity?.role === 'LEAD' && (
                                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={() => startEditMember(member)} className="p-2 text-white/40 hover:text-orange-500 hover:bg-white/5 transition-colors">
                                       <Edit2 size={16} />
                                     </button>
                                     <button onClick={() => deleteMember(member.id)} className="p-2 text-white/40 hover:text-red-500 hover:bg-white/5 transition-colors">
                                       <Trash2 size={16} />
                                     </button>
                                   </div>
                                 )}
                               </div>
                               
                               <div className="mb-6">
                                   <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight">{member.name}</h3>
                                   <p className="text-white/50 text-sm font-mono truncate">{member.email || 'No email'}</p>
                               </div>
                               
                               <div className="mt-auto space-y-3 pt-6 border-t border-white/10 text-xs text-white/40 font-mono group-hover:text-white/60 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <Phone size={14} /> <span className="uppercase tracking-wider">{member.phone || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Building size={14} /> <span className="uppercase tracking-wider">{member.college || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <GraduationCap size={14} /> <span className="uppercase tracking-wider">{member.branch || 'N/A'} • {member.year || 'N/A'}</span>
                                  </div>
                               </div>
                            </>
                       )}
                   </div>
                </div>
              ))}

              {identity?.role === 'LEAD' && data.members.length < 3 && (
                <button 
                  onClick={() => setIsAddingMember(true)}
                  className="group relative bg-white/5 border border-dashed border-white/20 hover:border-orange-500/50 hover:bg-orange-500/5 p-8 backdrop-blur-sm transition-all flex flex-col items-center justify-center gap-6 min-h-[300px]"
                  style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                >
                  <div className="w-16 h-16 rounded-full border border-white/20 group-hover:border-orange-500 group-hover:scale-110 flex items-center justify-center transition-all duration-500">
                      <Plus size={32} className="text-white/40 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <span className="font-mono text-sm font-bold uppercase tracking-widest text-white/40 group-hover:text-orange-500 transition-colors">Add Team Member</span>
                </button>
              )}
            </motion.div>
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <motion.div 
               key="chat"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="h-[70vh] bg-white/10 p-[1px] backdrop-blur-md relative"
               style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
            >
               <div className="h-full w-full bg-black/80 flex flex-col relative overflow-hidden"
                    style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
               >
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500/50 z-20 pointer-events-none" />
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500/50 z-20 pointer-events-none" />
    
                   <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10">
                     {data.chat.map((msg) => {
                       const isMe = msg.sender_name === identity?.name;
                       return (
                         <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                             <div className={`px-6 py-4 text-sm md:text-base border ${
                               isMe 
                                 ? 'bg-orange-500/20 border-orange-500/50 text-white rounded-tl-xl rounded-bl-xl rounded-tr-xl' 
                                 : 'bg-white/10 border-white/20 text-white/90 rounded-tr-xl rounded-br-xl rounded-tl-xl'
                             }`}>
                               {msg.message}
                             </div>
                             <div className={`flex items-center gap-2 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                               {!isMe && <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{msg.sender_name}</span>}
                               <span className="text-[10px] font-mono text-white/30">
                                 {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </span>
                             </div>
                           </div>
                         </div>
                       );
                     })}
                     <div ref={chatEndRef} />
                   </div>
                   <div className="p-4 md:p-6 bg-black/60 border-t border-white/10 relative z-10">
                     <form onSubmit={sendMessage} className="flex gap-4">
                       <input
                         type="text"
                         value={msgInput}
                         onChange={(e) => setMsgInput(e.target.value)}
                         placeholder="TYPE MESSAGE..."
                         className="flex-1 bg-black/40 border border-white/20 px-6 py-4 focus:outline-none focus:border-orange-500 font-mono text-white placeholder:text-white/20 transition-colors"
                       />
                       <button 
                         type="submit"
                         className="bg-orange-500 text-black px-6 py-4 font-bold hover:brightness-110 transition-all flex items-center justify-center"
                         style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                       >
                         <Send size={20} />
                       </button>
                     </form>
                   </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODALS */}
      {/* Identity Modal */}
      {showIdentityModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A090F] border border-white/10 p-8 rounded-3xl w-full max-w-md">
            <h2 className="text-3xl font-display font-bold mb-2">IDENTIFY YOURSELF</h2>
            <p className="text-white/50 mb-8">Who are you in this team?</p>
            
            <div className="space-y-4">
              <input 
                id="join-name"
                type="text" 
                placeholder="YOUR FULL NAME"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-orange-500 font-bold tracking-wide"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => handleJoin('MEMBER')}
                  className="bg-white/5 hover:bg-white/10 py-4 rounded-xl font-bold transition-colors border border-white/5"
                >
                  MEMBER
                </button>
                <button 
                  onClick={() => handleJoin('LEAD')}
                  className="bg-orange-500 hover:bg-orange-600 py-4 font-bold font-mono transition-colors text-black flex items-center justify-center gap-2"
                  style={{
                      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                  }}
                >
                  <DecryptedText text="TEAM LEAD" sequential speed={40} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Team Modal - Expanded for Lead Details */}
      {isEditingTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A090F] border border-white/10 p-8 rounded-3xl w-full max-w-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-display font-bold mb-6">EDIT TEAM DETAILS</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono text-white/40 uppercase mb-2 block">Team Name</label>
                <input 
                  value={teamForm.team_name || ''} onChange={e => setTeamForm({...teamForm, team_name: e.target.value})}
                  placeholder="Team Name" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                />
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-bold mb-4 text-orange-500">LEAD INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        value={teamForm.lead_name || ''} onChange={e => setTeamForm({...teamForm, lead_name: e.target.value})}
                        placeholder="Lead Name" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                    />
                    <input 
                        value={teamForm.lead_phone || ''} onChange={e => setTeamForm({...teamForm, lead_phone: e.target.value})}
                        placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                    />
                    <input 
                        value={teamForm.lead_email || ''} onChange={e => setTeamForm({...teamForm, lead_email: e.target.value})}
                        placeholder="Email Address" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                    />
                    <div className="md:col-span-2">
                        <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Team Logo</label>
                        <div className="flex gap-4 items-center">
                            {teamForm.logo_url && (
                                <img src={teamForm.logo_url} alt="Logo" className="w-12 h-12 rounded object-cover bg-white/10" />
                            )}
                            <input 
                                id="team-logo-upload"
                                type="file" 
                                accept="image/*"
                                className="flex-1 bg-white/5 border border-white/10 p-2 rounded-xl text-sm font-mono text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-black hover:file:bg-orange-600"
                            />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="md:col-span-3">
                        <input 
                            value={teamForm.lead_college || ''} onChange={e => setTeamForm({...teamForm, lead_college: e.target.value})}
                            placeholder="College Name" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                        />
                    </div>
                    <input 
                        value={teamForm.lead_branch || ''} onChange={e => setTeamForm({...teamForm, lead_branch: e.target.value})}
                        placeholder="Branch" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                    />
                    <input 
                        value={teamForm.lead_year || ''} onChange={e => setTeamForm({...teamForm, lead_year: e.target.value})}
                        placeholder="Year" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                    />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
                <button onClick={() => setIsEditingTeam(false)} className="text-white/50 hover:text-white px-4">Cancel</button>
                <button 
                  onClick={saveTeam} 
                  className="bg-orange-500 text-black px-6 py-3 font-bold font-mono flex items-center gap-2"
                  style={{
                      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                  }}
                >
                  <DecryptedText text="SAVE CHANGES" sequential speed={40} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal - Expanded */}
      {isAddingMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A090F] border border-white/10 p-8 rounded-3xl w-full max-w-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-display font-bold mb-6">ADD MEMBER</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                    placeholder="Member Name" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                  />
                  <input 
                    value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})}
                    placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                  />
                  <input 
                    value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})}
                    placeholder="Email Address" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none md:col-span-2"
                  />
                  <input 
                    value={memberForm.college} onChange={e => setMemberForm({...memberForm, college: e.target.value})}
                    placeholder="College Name" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none md:col-span-2"
                  />
                  <input 
                    value={memberForm.branch} onChange={e => setMemberForm({...memberForm, branch: e.target.value})}
                    placeholder="Branch" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                  />
                  <input 
                    value={memberForm.year} onChange={e => setMemberForm({...memberForm, year: e.target.value})}
                    placeholder="Year" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
                  />
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4">
                <button onClick={() => setIsAddingMember(false)} className="text-white/50 hover:text-white px-4">Cancel</button>
                <button 
                  onClick={addMember} 
                  className="bg-orange-500 text-black px-6 py-3 font-bold font-mono flex items-center gap-2"
                  style={{
                      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                  }}
                >
                  <DecryptedText text="ADD MEMBER" sequential speed={40} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
