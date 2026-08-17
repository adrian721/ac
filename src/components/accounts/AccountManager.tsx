import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, UserAccountStatus } from '../../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  LogIn,
  Shield,
  Key,
  Sliders,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';

interface AccountManagerProps {
  onNavigateToPermissions?: () => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({ onNavigateToPermissions }) => {
  const { 
    currentUser, 
    users, 
    addUser, 
    switchRole, 
    setUserAccountStatus, 
    resetUserPassword,
    hasPermission 
  } = useApp();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('TEKNISI');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [initialPassword, setInitialPassword] = useState('password123');

  // Password reset modal state
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [tempPasswordResult, setTempPasswordResult] = useState('');

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  let filteredUsers = [...users];
  if (roleFilter !== 'ALL') {
    filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      (u.companyName && u.companyName.toLowerCase().includes(q))
    );
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addUser({
      name,
      email,
      phone,
      role,
      address,
      companyName: role === 'PELANGGAN_KANTOR' ? companyName : undefined,
      taxIdentificationNumber: role === 'PELANGGAN_KANTOR' ? taxId : undefined,
      avatar: `https://images.unsplash.com/photo-${role === 'TEKNISI' ? '1507003211169-0a1dd7228f2d' : '1494790108377-be9c29b29330'}?w=150&auto=format&fit=crop&q=80`,
      rating: role === 'TEKNISI' ? 5.0 : undefined,
      status: 'AKTIF',
      password: initialPassword || 'password123',
    });

    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCompanyName('');
    setInitialPassword('password123');
  };

  const handleResetPasswordSubmit = () => {
    if (!resetTargetUser) return;
    const res = resetUserPassword(resetTargetUser.id, customPassword || undefined);
    if (res.temporaryPassword) {
      setTempPasswordResult(res.temporaryPassword);
    }
    setCustomPassword('');
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black text-[9px] uppercase tracking-wider">SUPER ADMIN</span>;
      case 'ADMIN':
        return <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-black text-[9px] uppercase tracking-wider">ADMIN OPERASIONAL</span>;
      case 'TEKNISI':
        return <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-[9px] uppercase tracking-wider">TEKNISI LAPANGAN</span>;
      case 'PELANGGAN_KANTOR':
        return <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black text-[9px] uppercase tracking-wider">PELANGGAN KANTOR / B2B</span>;
      case 'PELANGGAN_UMUM':
        return <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-[9px] uppercase tracking-wider">PELANGGAN UMUM</span>;
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header with Bold Typography */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold mb-1">
            Manajemen Pengguna & Keamanan
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none text-white">
            DAFTAR ANGGOTA & AKUN
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {isSuperAdmin && onNavigateToPermissions && (
            <button
              onClick={onNavigateToPermissions}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Kontrol Hak Akses Fitur</span>
            </button>
          )}

          {hasPermission('accounts_manage') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'SEMUA ROLE' },
              { id: 'SUPER_ADMIN', label: 'SUPER ADMIN' },
              { id: 'ADMIN', label: 'ADMIN' },
              { id: 'TEKNISI', label: 'TEKNISI' },
              { id: 'PELANGGAN_KANTOR', label: 'KANTOR / B2B' },
              { id: 'PELANGGAN_UMUM', label: 'PELANGGAN' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  roleFilter === tab.id ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, telp..."
              className="w-full sm:w-64 pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(u => {
          const isSelf = u.id === currentUser.id;

          return (
            <div
              key={u.id}
              className="bg-white/5 border border-white/10 hover:border-white/20 rounded-3xl p-6 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  {getRoleBadge(u.role)}
                  
                  {/* Status badge with Super Admin Control */}
                  {isSuperAdmin && !isSelf ? (
                    <select
                      value={u.status}
                      onChange={(e) => setUserAccountStatus(u.id, e.target.value as UserAccountStatus)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                        u.status === 'AKTIF'
                          ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400'
                          : u.status === 'DITANGGUHKAN'
                          ? 'bg-amber-950/50 border-amber-500/50 text-amber-400'
                          : 'bg-rose-950/50 border-rose-500/50 text-rose-400'
                      }`}
                    >
                      <option value="AKTIF">🟢 AKTIF</option>
                      <option value="DITANGGUHKAN">🟡 DITANGGUHKAN</option>
                      <option value="TERKUNCI">🔴 TERKUNCI</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      u.status === 'AKTIF'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      {u.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/20"
                  />
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight">{u.name}</h3>
                    {u.companyName ? (
                      <p className="text-[11px] text-cyan-400 font-bold">{u.companyName}</p>
                    ) : (
                      <p className="text-[11px] text-white/50">{u.username || u.email.split('@')[0]}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-1.5 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-white/40" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-white/40" />
                    <span>{u.phone}</span>
                  </div>
                  {u.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span className="truncate">{u.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => switchRole(u.role, u.id)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk Sebagai Profil Ini
                </button>

                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setResetTargetUser(u);
                      setTempPasswordResult('');
                      setCustomPassword('');
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Key className="w-3 h-3 text-cyan-400" />
                    <span>Reset Kata Sandi</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] rounded-3xl p-6 max-w-lg w-full border border-white/15 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-white">Tambah Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-black uppercase tracking-wider text-white/60 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Rian Gunawan"
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase tracking-wider text-white/60 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rian@koolfix.co.id"
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-black uppercase tracking-wider text-white/60 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase tracking-wider text-white/60 mb-1">Peran Akses (Role)</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white font-bold"
                  >
                    <option value="TEKNISI">TEKNISI LAPANGAN</option>
                    <option value="ADMIN">ADMIN OPERASIONAL</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                    <option value="PELANGGAN_KANTOR">PELANGGAN KANTOR / B2B</option>
                    <option value="PELANGGAN_UMUM">PELANGGAN UMUM (RUMAH)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black uppercase tracking-wider text-white/60 mb-1">Kata Sandi Awal</label>
                  <input
                    type="text"
                    value={initialPassword}
                    onChange={e => setInitialPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {role === 'PELANGGAN_KANTOR' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black uppercase tracking-wider text-white/60 mb-1">Nama Perusahaan / Gedung</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="PT. Inovasi Prima Sentosa"
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black uppercase tracking-wider text-white/60 mb-1">NPWP Perusahaan</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={e => setTaxId(e.target.value)}
                      placeholder="01.234.567.8-901.000"
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-black uppercase tracking-wider text-white/60 mb-1">Alamat Domisili / Lokasi Kantor</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Gedung Cyber 2 Lantai 12, Jl. Rasuna Said, Jakarta"
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-black uppercase tracking-wider"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] rounded-3xl p-6 max-w-md w-full border border-white/15 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Reset Sandi: {resetTargetUser.name}</h3>
                <p className="text-xs text-slate-400">{resetTargetUser.email}</p>
              </div>
            </div>

            {tempPasswordResult ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl space-y-2 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-white">Kata Sandi Baru Telah Ditetapkan</h4>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm font-bold text-cyan-400 tracking-wider">
                  {tempPasswordResult}
                </div>
                <p className="text-[10px] text-slate-400">Pengguna dapat login dengan password ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Tentukan kata sandi baru atau biarkan kosong untuk menghasilkan sandi sementara otomatis.
                </p>
                <input
                  type="text"
                  value={customPassword}
                  onChange={e => setCustomPassword(e.target.value)}
                  placeholder="Contoh: koolfix2026 atau kosongkan"
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetTargetUser(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
              >
                {tempPasswordResult ? 'Tutup' : 'Batal'}
              </button>
              {!tempPasswordResult && (
                <button
                  type="button"
                  onClick={handleResetPasswordSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold"
                >
                  Eksekusi Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

