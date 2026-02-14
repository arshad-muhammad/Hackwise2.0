'use client';
import { useState, useEffect } from 'react';
import { 
  Bed, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Calendar, 
  Users, 
  Mail, 
  Phone, 
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Settings,
  DollarSign,
  TrendingUp,
  Filter,
  X
} from 'lucide-react';

// Format price in Indian Rupees
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const CARD_CLIP = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

export default function AccommodationAdminPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [settings, setSettings] = useState({ enabled: false, price: 0, pricingType: 'per_team' });
  const [saving, setSaving] = useState(false);
  const [priceInput, setPriceInput] = useState('0');
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/accommodation');
      if (res.ok) {
        const data = await res.json();
        setQueries(data);
      }
    } catch (error) {
      console.error('Failed to fetch accommodation queries', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/accommodation/settings');
      const data = await res.json();
      setSettings(data);
      setPriceInput(data.price.toString());
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  const handleToggle = async () => {
    setSaving(true);
    try {
      const newState = !settings.enabled;
      await fetch('/api/accommodation/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enabled: newState, 
          price: parseFloat(priceInput) || 0,
          pricingType: settings.pricingType 
        }),
      });
      setSettings(prev => ({ ...prev, enabled: newState }));
    } catch (error) {
      console.error('Failed to toggle', error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePriceUpdate = async () => {
    setSaving(true);
    try {
      const price = parseFloat(priceInput) || 0;
      await fetch('/api/accommodation/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enabled: settings.enabled, 
          price,
          pricingType: settings.pricingType 
        }),
      });
      setSettings(prev => ({ ...prev, price }));
      alert('Price updated successfully');
    } catch (error) {
      console.error('Failed to update price', error);
      alert('Failed to update price');
    } finally {
      setSaving(false);
    }
  };

  const handlePricingTypeChange = async (newType) => {
    setSaving(true);
    try {
      await fetch('/api/accommodation/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enabled: settings.enabled, 
          price: parseFloat(priceInput) || 0,
          pricingType: newType 
        }),
      });
      setSettings(prev => ({ ...prev, pricingType: newType }));
    } catch (error) {
      console.error('Failed to update pricing type', error);
      alert('Failed to update pricing type');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await fetch('/api/admin/accommodation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchData();
      if (selectedQuery?.id === id) {
        setSelectedQuery(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = 
      query.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.team_lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.team_lead_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || query.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 font-mono text-orange-500 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin mb-4" />
          <p className="text-sm">Loading accommodation queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase flex items-center gap-3">
          <Bed className="text-orange-500" size={28} />
          Accommodation <span className="text-orange-500">Management</span>
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-mono text-sm uppercase transition-colors"
        >
          <Settings size={16} />
          {showSettings ? 'Hide' : 'Show'} Settings
        </button>
      </div>

      {/* Settings Panel - Collapsible */}
      {showSettings && (
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/30 transition-colors duration-300"
              style={{ clipPath: CARD_CLIP }}
            />
            <div
              className="relative bg-[#0A090F] p-4 md:p-6"
              style={{ clipPath: CARD_CLIP }}
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <Settings className="text-orange-500" size={20} />
                <h3 className="text-lg md:text-xl font-mono font-bold text-white uppercase">Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Enable/Disable Toggle */}
                <div className="relative p-4 bg-black/30 rounded border border-white/10">
                  <p className="text-xs font-mono text-white/60 uppercase mb-2">Portal Status</p>
                  <button
                    onClick={handleToggle}
                    disabled={saving}
                    className="flex items-center justify-between w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors disabled:opacity-50"
                  >
                    <span className="text-sm font-mono text-white/80">
                      {settings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {settings.enabled ? (
                      <ToggleRight className="text-orange-500" size={24} />
                    ) : (
                      <ToggleLeft className="text-white/40" size={24} />
                    )}
                  </button>
                  <p className="text-xs font-mono text-white/40 mt-2">
                    {settings.enabled ? 'Portal is open' : 'Portal is closed'}
                  </p>
                </div>

                {/* Price Setting */}
                <div className="relative p-4 bg-black/30 rounded border border-white/10">
                  <p className="text-xs font-mono text-white/60 uppercase mb-2 flex items-center gap-2">
                    <DollarSign size={14} />
                    Accommodation Price
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      min="0"
                      step="0.01"
                      className="flex-1 bg-black/50 border border-white/10 px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-orange-500/60"
                      placeholder="0.00"
                    />
                    <button
                      onClick={handlePriceUpdate}
                      disabled={saving}
                      className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-black font-mono font-bold uppercase text-xs transition-colors disabled:opacity-50"
                    >
                      Update
                    </button>
                  </div>
                  <p className="text-xs font-mono text-white/40">
                    Current: {formatPrice(settings.price)}
                    {settings.pricingType === 'per_person' && ' per person'}
                  </p>
                </div>

                {/* Pricing Type */}
                <div className="relative p-4 bg-black/30 rounded border border-white/10">
                  <p className="text-xs font-mono text-white/60 uppercase mb-2 flex items-center gap-2">
                    <Users size={14} />
                    Pricing Type
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePricingTypeChange('per_team')}
                      disabled={saving}
                      className={`px-3 py-2 rounded font-mono text-xs uppercase transition-colors disabled:opacity-50 ${
                        settings.pricingType === 'per_team'
                          ? 'bg-orange-500 text-black font-bold'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      Per Team
                    </button>
                    <button
                      onClick={() => handlePricingTypeChange('per_person')}
                      disabled={saving}
                      className={`px-3 py-2 rounded font-mono text-xs uppercase transition-colors disabled:opacity-50 ${
                        settings.pricingType === 'per_person'
                          ? 'bg-orange-500 text-black font-bold'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      Per Person
                    </button>
                  </div>
                  <p className="text-xs font-mono text-white/40 mt-2">
                    {settings.pricingType === 'per_person' 
                      ? 'Price × members' 
                      : 'Fixed per team'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="relative p-3 md:p-4 bg-white/5 border border-white/10 rounded group hover:bg-white/10 transition-colors">
          <p className="text-[10px] md:text-xs font-mono text-white/40 uppercase mb-1">Total</p>
          <p className="text-xl md:text-2xl font-bold text-white font-mono">{queries.length}</p>
        </div>
        <div className="relative p-3 md:p-4 bg-yellow-500/10 border border-yellow-500/30 rounded group hover:bg-yellow-500/20 transition-colors">
          <p className="text-[10px] md:text-xs font-mono text-yellow-400/60 uppercase mb-1">Pending</p>
          <p className="text-xl md:text-2xl font-bold text-yellow-400 font-mono">
            {queries.filter(q => q.status === 'PENDING').length}
          </p>
        </div>
        <div className="relative p-3 md:p-4 bg-green-500/10 border border-green-500/30 rounded group hover:bg-green-500/20 transition-colors">
          <p className="text-[10px] md:text-xs font-mono text-green-400/60 uppercase mb-1">Confirmed</p>
          <p className="text-xl md:text-2xl font-bold text-green-400 font-mono">
            {queries.filter(q => q.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="relative p-3 md:p-4 bg-red-500/10 border border-red-500/30 rounded group hover:bg-red-500/20 transition-colors">
          <p className="text-[10px] md:text-xs font-mono text-red-400/60 uppercase mb-1">Cancelled</p>
          <p className="text-xl md:text-2xl font-bold text-red-400 font-mono">
            {queries.filter(q => q.status === 'CANCELLED').length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search queries..."
                className="w-full bg-black/50 border border-white/10 px-10 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-orange-500/60 placeholder:text-white/20 rounded"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded font-mono text-xs uppercase transition-colors ${
                    statusFilter === status
                      ? 'bg-orange-500 text-black font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Query List */}
          <div className="space-y-3 max-h-[calc(100vh-500px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredQueries.map((query) => (
              <div 
                key={query.id}
                onClick={() => setSelectedQuery(query)}
                className={`p-3 md:p-4 border rounded cursor-pointer transition-all ${
                  selectedQuery?.id === query.id 
                    ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/20' 
                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase border ${getStatusColor(query.status)}`}>
                    {query.status}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    {new Date(query.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <h4 className="font-bold text-white mb-1 truncate text-sm md:text-base">{query.team_name}</h4>
                <p className="text-xs text-white/60 truncate">{query.team_lead_name}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                  <Users size={12} />
                  <span className="font-mono">{query.total_members} member{query.total_members !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
            {filteredQueries.length === 0 && (
              <div className="text-white/40 font-mono text-center py-8 text-sm">
                {searchTerm || statusFilter !== 'ALL' ? 'No queries match your filters' : 'No queries found'}
              </div>
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {selectedQuery ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                <div
                  className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/30 transition-colors duration-300"
                  style={{ clipPath: CARD_CLIP }}
                />
                <div
                  className="relative bg-[#0A090F] p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6"
                  style={{ clipPath: CARD_CLIP }}
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{selectedQuery.team_name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-3 py-1 rounded font-mono uppercase border ${getStatusColor(selectedQuery.status)}`}>
                          {selectedQuery.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuery.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedQuery.id, 'CONFIRMED')}
                          className="px-3 py-2 rounded font-mono text-xs uppercase bg-green-500 hover:bg-green-600 text-black font-bold transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 size={14} />
                          Confirm
                        </button>
                      )}
                      {selectedQuery.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedQuery.id, 'CANCELLED')}
                          className="px-3 py-2 rounded font-mono text-xs uppercase bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center gap-2"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      )}
                      {selectedQuery.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedQuery.id, 'PENDING')}
                          className="px-3 py-2 rounded font-mono text-xs uppercase bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                          <Users size={16} />
                          <span className="text-xs font-mono uppercase">Team Lead</span>
                        </div>
                        <p className="text-white font-mono text-sm md:text-base">{selectedQuery.team_lead_name}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                          <Mail size={16} />
                          <span className="text-xs font-mono uppercase">Email</span>
                        </div>
                        <p className="text-white font-mono text-xs md:text-sm break-all">{selectedQuery.team_lead_email}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                          <Phone size={16} />
                          <span className="text-xs font-mono uppercase">Phone</span>
                        </div>
                        <p className="text-white font-mono text-sm md:text-base">{selectedQuery.team_lead_phone}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                          <Users size={16} />
                          <span className="text-xs font-mono uppercase">Total Members</span>
                        </div>
                        <p className="text-white font-mono text-xl md:text-2xl">{selectedQuery.total_members}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                          <Calendar size={16} />
                          <span className="text-xs font-mono uppercase">Check-in</span>
                        </div>
                        <p className="text-white font-mono text-sm md:text-base">
                          {new Date(selectedQuery.check_in_date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                          <Calendar size={16} />
                          <span className="text-xs font-mono uppercase">Check-out</span>
                        </div>
                        <p className="text-white font-mono text-sm md:text-base">
                          {new Date(selectedQuery.check_out_date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  {selectedQuery.special_requirements && (
                    <div>
                      <div className="flex items-center gap-2 text-white/60 mb-2">
                        <FileText size={16} />
                        <span className="text-xs font-mono uppercase">Special Requirements</span>
                      </div>
                      <div className="bg-black/30 p-4 rounded border border-white/5 font-mono text-white/80 whitespace-pre-wrap text-sm">
                        {selectedQuery.special_requirements}
                      </div>
                    </div>
                  )}

                  {/* QR Code */}
                  {selectedQuery.qr_code_data && (
                    <div>
                      <div className="flex items-center gap-2 text-white/60 mb-4">
                        <QrCode size={16} />
                        <span className="text-xs font-mono uppercase">Payment QR Code</span>
                      </div>
                      <div className="bg-white p-3 md:p-4 inline-block rounded">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedQuery.qr_code_data)}`}
                          alt="Payment QR Code"
                          className="w-40 h-40 md:w-48 md:h-48 object-contain"
                        />
                      </div>
                      <p className="text-xs font-mono text-white/40 mt-2">
                        Team name is included in payment note when scanned
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t border-white/10 text-xs font-mono text-white/40 space-y-1">
                    <p>ID: {selectedQuery.id}</p>
                    <p>Submitted: {new Date(selectedQuery.created_at).toLocaleString('en-IN')}</p>
                    {selectedQuery.updated_at && (
                      <p>Last Updated: {new Date(selectedQuery.updated_at).toLocaleString('en-IN')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-white/10 border-dashed rounded bg-white/5 text-white/30 font-mono uppercase min-h-[400px] text-sm md:text-base p-8 text-center">
              Select a query to view details
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
