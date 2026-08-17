import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Boxes, 
  Coins, 
  MapPin, 
  TrendingUp, 
  Users, 
  Star, 
  AirVent, 
  PlusCircle, 
  Receipt,
  UserCog,
  Building2,
  CalendarCheck,
  Shield,
  Sliders,
  Lock
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBookingModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenBookingModal }) => {
  const { currentUser, hasPermission, serviceOrders, inventory } = useApp();

  const role = currentUser.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isTechnician = role === 'TEKNISI';
  const isCustomer = role.startsWith('PELANGGAN');

  const pendingOrders = serviceOrders.filter(o => o.status === 'MENUNGGU_KONFIRMASI').length;
  const techAssignedOrders = serviceOrders.filter(o => o.technicianId === currentUser.id && o.status !== 'SELESAI' && o.status !== 'DIBATALKAN').length;
  const lowStockCount = inventory.filter(i => i.stock <= i.minStockThreshold).length;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Permission checks
  const canViewDashboard = hasPermission('dashboard_view');
  const canViewServices = hasPermission('services_view');
  const canViewInventory = hasPermission('inventory_view');
  const canViewAttendance = hasPermission('attendance_view') || hasPermission('attendance_clockin');
  const canViewEarnings = hasPermission('technician_earnings_view');
  const canViewPayroll = hasPermission('payroll_manage');
  const canViewFinance = hasPermission('finance_reports');
  const canViewAccounts = hasPermission('accounts_view');
  const canManageFeatureControl = hasPermission('feature_control_manage');

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-6 text-white select-none">
      {/* Brand header */}
      <div className="mb-6 pb-5 border-b border-white/10">
        <h1 className="text-2xl font-black tracking-tighter leading-none mb-1 flex items-center gap-1">
          <span>KOOL</span><span className="text-cyan-400">FIX</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold flex items-center justify-between">
          <span>AC System Pro</span>
          {isSuperAdmin && (
            <span className="text-purple-400 font-bold lowercase bg-purple-500/10 px-1 rounded border border-purple-500/20 text-[8px]">
              superadmin
            </span>
          )}
        </p>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        
        {/* SUPER ADMIN SECURITY CONTROL (Highlighted) */}
        {canManageFeatureControl && (
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-2.5 space-y-1">
            <p className="text-[9px] uppercase tracking-[0.2em] text-purple-300 font-bold px-2 py-0.5 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Otorisasi & Keamanan</span>
            </p>
            <button
              id="sidebar-nav-feature-control"
              onClick={() => setActiveTab('feature_control')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer text-xs font-bold ${
                activeTab === 'feature_control'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Hak Akses & Fitur</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40">
                17 Modul
              </span>
            </button>
          </div>
        )}

        {/* OPERATIONAL SECTION */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2.5 font-bold">
            Operasional
          </p>
          <ul className="space-y-1 font-bold text-xs">
            {canViewDashboard && (
              <li>
                <button
                  id="sidebar-nav-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard Utama</span>
                  </div>
                </button>
              </li>
            )}

            {canViewServices && (
              <li>
                <button
                  id="sidebar-nav-services"
                  onClick={() => setActiveTab('services')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isTechnician ? <CalendarCheck className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                    <span>{isTechnician ? 'Tugas Servis' : isCustomer ? 'Riwayat Servis' : 'Jadwal Servis'}</span>
                  </div>
                  {!isCustomer && pendingOrders > 0 && (
                    <span className="text-[9px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full">
                      {pendingOrders}
                    </span>
                  )}
                  {isTechnician && techAssignedOrders > 0 && (
                    <span className="text-[9px] font-black bg-white text-black px-2 py-0.5 rounded-full">
                      {techAssignedOrders}
                    </span>
                  )}
                </button>
              </li>
            )}

            {canViewInventory && (
              <li>
                <button
                  id="sidebar-nav-inventory"
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Boxes className="w-4 h-4" />
                    <span>Inventaris Part</span>
                  </div>
                  {lowStockCount > 0 && (
                    <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              </li>
            )}

            {canViewAttendance && (
              <li>
                <button
                  id="sidebar-nav-attendance"
                  onClick={() => setActiveTab('attendance')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeTab === 'attendance'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4" />
                    <span>Absensi Geotag</span>
                  </div>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* FINANCIAL SECTION */}
        {(canViewEarnings || canViewPayroll || canViewFinance) && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2.5 font-bold">
              Keuangan & Gaji
            </p>
            <ul className="space-y-1 font-bold text-xs">
              {canViewEarnings && isTechnician && (
                <li>
                  <button
                    id="sidebar-nav-earnings"
                    onClick={() => setActiveTab('technician_earnings')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                      activeTab === 'technician_earnings'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Coins className="w-4 h-4" />
                      <span>Penghasilan Harian</span>
                    </div>
                  </button>
                </li>
              )}

              {canViewPayroll && (
                <li>
                  <button
                    id="sidebar-nav-payroll"
                    onClick={() => setActiveTab('payroll')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                      activeTab === 'payroll'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Coins className="w-4 h-4" />
                      <span>Skema Gaji & Komisi</span>
                    </div>
                  </button>
                </li>
              )}

              {canViewFinance && (
                <li>
                  <button
                    id="sidebar-nav-finance"
                    onClick={() => setActiveTab('finance')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                      activeTab === 'finance'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>Arus Kas & Laba</span>
                    </div>
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* ACCOUNTS & MANAGEMENT */}
        {canViewAccounts && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2.5 font-bold">
              Pengguna
            </p>
            <ul className="space-y-1 font-bold text-xs">
              <li>
                <button
                  id="sidebar-nav-accounts"
                  onClick={() => setActiveTab('accounts')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeTab === 'accounts'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCog className="w-4 h-4" />
                    <span>Daftar Anggota & Akun</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* User profile info at bottom matching design */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md">
            {getInitials(currentUser.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-white/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="truncate">{currentUser.role.replace(/_/g, ' ')}</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

