import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Shield, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Key, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  Building2, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info,
  Smartphone,
  Check
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { 
    login, 
    quickLoginAs, 
    registerUser, 
    users, 
    roleDefaultPermissions,
    systemFeatureDefinitions 
  } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'QUICK_PERSONA' | 'REGISTER'>('LOGIN');
  
  // Login form state
  const [identifier, setIdentifier] = useState('budi.santoso@koolfix.co.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    role: 'PELANGGAN_UMUM' as UserRole,
    companyName: '',
    taxIdentificationNumber: '',
    address: '',
  });
  const [regError, setRegError] = useState('');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Harap isi identitas (email/username/No HP) dan kata sandi.');
      return;
    }

    const result = login(identifier, password);
    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regData.name.trim() || !regData.email.trim() || !regData.phone.trim() || !regData.password.trim()) {
      setRegError('Harap lengkapi semua kolom wajib bertanda bintang (*)');
      return;
    }

    if (regData.role === 'PELANGGAN_KANTOR' && !regData.companyName.trim()) {
      setRegError('Harap isi nama instansi / perusahaan untuk akun pelanggan kantor.');
      return;
    }

    const res = registerUser(regData);
    if (!res.success) {
      setRegError(res.message);
    }
  };

  // Group users for quick persona selection
  const superAdminUser = users.find(u => u.role === 'SUPER_ADMIN') || users[0];
  const adminUser = users.find(u => u.role === 'ADMIN');
  const technicians = users.filter(u => u.role === 'TEKNISI');
  const clientGeneral = users.find(u => u.role === 'PELANGGAN_UMUM');
  const clientOffice = users.find(u => u.role === 'PELANGGAN_KANTOR');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background glowing ambient effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Shield className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                KOOL<span className="text-cyan-400">FIX</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium">
                  RBAC Enterprise
                </span>
              </h1>
              <p className="text-xs text-slate-400">Sistem Manajemen Servis AC & Kontrol Akses Terpusat</p>
            </div>
          </div>
        </div>

        {/* Card Frame */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Nav Mode Switcher */}
          <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/60 p-1.5">
            <button
              id="tab-btn-login-form"
              onClick={() => { setMode('LOGIN'); setErrorMessage(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                mode === 'LOGIN' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Login Mandiri</span>
            </button>
            <button
              id="tab-btn-quick-demo"
              onClick={() => { setMode('QUICK_PERSONA'); setErrorMessage(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                mode === 'QUICK_PERSONA' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Simulasi 5 Role</span>
            </button>
            <button
              id="tab-btn-register"
              onClick={() => { setMode('REGISTER'); setRegError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                mode === 'REGISTER' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Pelanggan</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* MODE 1: STANDARD FORM LOGIN */}
            {mode === 'LOGIN' && (
              <div className="max-w-md mx-auto space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-white">Masuk ke Portal KoolFix</h2>
                  <p className="text-xs text-slate-400">
                    Gunakan kredensial resmi akun Anda untuk mengakses fitur sistem sesuai hak akses.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">{errorMessage}</div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email / Username / No WhatsApp
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-identifier-input"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="contoh: budi.santoso@koolfix.co.id atau 081288991122"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Kata Sandi</label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Lupa sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span>Ingat sesi di perangkat ini</span>
                    </label>
                    <span className="text-slate-500">Default sandi demo: <code className="text-cyan-400">password123</code></span>
                  </div>

                  <button
                    id="btn-submit-login"
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Sistem</span>
                  </button>
                </form>

                {/* Quick Hint Card */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-2 text-slate-400 font-semibold">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Sparkles className="w-3.5 h-3.5" /> Akun Demo Siap Pakai:
                    </span>
                    <button 
                      onClick={() => setMode('QUICK_PERSONA')}
                      className="text-cyan-400 hover:underline"
                    >
                      Pilih Cepat &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => { setIdentifier('budi.santoso@koolfix.co.id'); setPassword('password123'); }}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-left transition-colors truncate"
                    >
                      <span className="font-semibold text-purple-400 block">Super Admin</span>
                      budi.santoso@...
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIdentifier('agus.teknisi@koolfix.co.id'); setPassword('password123'); }}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-left transition-colors truncate"
                    >
                      <span className="font-semibold text-emerald-400 block">Teknisi Lapangan</span>
                      agus.teknisi@...
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: QUICK PERSONA SELECTOR (Simulasi 5 Role) */}
            {mode === 'QUICK_PERSONA' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      Pilih Profil Peran (Demo 1-Klik)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Uji batasan hak akses fitur yang dikontrol oleh Super Admin dengan masuk langsung sebagai profil berikut:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  
                  {/* 1. Super Admin */}
                  {superAdminUser && (
                    <div className="bg-slate-950/90 border-2 border-purple-500/40 hover:border-purple-500 rounded-xl p-4 flex flex-col justify-between transition-all group">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            SUPER ADMIN (PENGENDALI PENUH)
                          </span>
                          <Shield className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <img src={superAdminUser.avatar} alt={superAdminUser.name} className="w-11 h-11 rounded-full object-cover border-2 border-purple-400" />
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{superAdminUser.name}</h3>
                            <p className="text-[11px] text-slate-400 truncate">{superAdminUser.email}</p>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
                          <p className="font-semibold text-purple-300">Wewenang Eksklusif:</p>
                          <p>• Mengatur Matrix Pembatasan Semua Fitur</p>
                          <p>• Mengunci / Menonaktifkan Akun Siapapun</p>
                          <p>• Reset Password & Gaji Teknisi</p>
                        </div>
                      </div>
                      <button
                        id="quick-login-superadmin"
                        onClick={() => quickLoginAs(superAdminUser.id)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Masuk Sebagai Super Admin
                      </button>
                    </div>
                  )}

                  {/* 2. Admin Operasional */}
                  {adminUser && (
                    <div className="bg-slate-950/90 border border-blue-500/30 hover:border-blue-400 rounded-xl p-4 flex flex-col justify-between transition-all group">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            ADMIN OPERASIONAL
                          </span>
                          <UserIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <img src={adminUser.avatar} alt={adminUser.name} className="w-11 h-11 rounded-full object-cover border-2 border-blue-400" />
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{adminUser.name}</h3>
                            <p className="text-[11px] text-slate-400 truncate">{adminUser.email}</p>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
                          <p className="font-semibold text-blue-300">Wewenang Operasional:</p>
                          <p>• Dispatch & Penugasan Teknisi</p>
                          <p>• Kelola Stok Inventaris & Validasi Nota</p>
                          <p className="text-rose-400">• Fitur Keuangan & Payroll Dibatasi</p>
                        </div>
                      </div>
                      <button
                        id="quick-login-admin"
                        onClick={() => quickLoginAs(adminUser.id)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Masuk Sebagai Admin Ops
                      </button>
                    </div>
                  )}

                  {/* 3. Teknisi Lapangan (Agus) */}
                  {technicians[0] && (
                    <div className="bg-slate-950/90 border border-emerald-500/30 hover:border-emerald-400 rounded-xl p-4 flex flex-col justify-between transition-all group">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            TEKNISI LAPANGAN
                          </span>
                          <Wrench className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <img src={technicians[0].avatar} alt={technicians[0].name} className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400" />
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{technicians[0].name}</h3>
                            <p className="text-[11px] text-slate-400 truncate">{technicians[0].email}</p>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
                          <p className="font-semibold text-emerald-300">Akses Teknisi Khusus:</p>
                          <p>• Presensi Absensi GPS Geotag</p>
                          <p>• Form Laporan Servis & Foto Unit</p>
                          <p>• Rincian Komisi Harian Pribadi</p>
                        </div>
                      </div>
                      <button
                        id="quick-login-technician"
                        onClick={() => quickLoginAs(technicians[0].id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Masuk Sebagai Teknisi
                      </button>
                    </div>
                  )}

                  {/* 4. Pelanggan Umum (Ibu Ratna) */}
                  {clientGeneral && (
                    <div className="bg-slate-950/90 border border-amber-500/30 hover:border-amber-400 rounded-xl p-4 flex flex-col justify-between transition-all group">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            PELANGGAN UMUM (RESIDENSIAL)
                          </span>
                          <UserIcon className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <img src={clientGeneral.avatar} alt={clientGeneral.name} className="w-11 h-11 rounded-full object-cover border-2 border-amber-400" />
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{clientGeneral.name}</h3>
                            <p className="text-[11px] text-slate-400 truncate">{clientGeneral.email}</p>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
                          <p className="font-semibold text-amber-300">Akses Mandiri:</p>
                          <p>• Booking Cuci & Servis AC Rumah</p>
                          <p>• Tracking Status Teknisi Datang</p>
                          <p>• Unduh Kwitansi Digital & Beri Ulasan</p>
                        </div>
                      </div>
                      <button
                        id="quick-login-customer-umum"
                        onClick={() => quickLoginAs(clientGeneral.id)}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Masuk Sebagai Pelanggan
                      </button>
                    </div>
                  )}

                  {/* 5. Pelanggan Kantor B2B (PT Samudera) */}
                  {clientOffice && (
                    <div className="bg-slate-950/90 border border-indigo-500/30 hover:border-indigo-400 rounded-xl p-4 flex flex-col justify-between transition-all group md:col-span-2 lg:col-span-2">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            PELANGGAN KORPORAT / KANTOR B2B
                          </span>
                          <Building2 className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <img src={clientOffice.avatar} alt={clientOffice.name} className="w-11 h-11 rounded-full object-cover border-2 border-indigo-400" />
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{clientOffice.name}</h3>
                            <p className="text-[11px] text-slate-400 truncate">{clientOffice.email} • NPWP Terdaftar</p>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
                          <p className="font-semibold text-indigo-300">Fitur Fasilitas Perusahaan:</p>
                          <p>• Manajemen Pemeliharaan Rutin Multi-Unit AC Gedung</p>
                          <p>• Pembayaran Invoice Tempo Korporat & Laporan Servis Teknis</p>
                        </div>
                      </div>
                      <button
                        id="quick-login-customer-kantor"
                        onClick={() => quickLoginAs(clientOffice.id)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Masuk Sebagai Akun Korporat / Kantor
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* MODE 3: REGISTER NEW CUSTOMER */}
            {mode === 'REGISTER' && (
              <div className="max-w-xl mx-auto space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-white">Registrasi Akun Pelanggan Baru</h2>
                  <p className="text-xs text-slate-400">
                    Daftar untuk memesan servis AC rumah atau kelola kontrak perawatan AC kantor Anda.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, role: 'PELANGGAN_UMUM' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        regData.role === 'PELANGGAN_UMUM'
                          ? 'bg-cyan-950/40 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <UserIcon className="w-5 h-5 text-cyan-400 mb-1" />
                      <div className="text-xs font-bold">Pelanggan Rumah / Umum</div>
                      <div className="text-[10px] text-slate-400">Pribadi / Residensial</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, role: 'PELANGGAN_KANTOR' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        regData.role === 'PELANGGAN_KANTOR'
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-indigo-400 mb-1" />
                      <div className="text-xs font-bold">Instansi / Kantor B2B</div>
                      <div className="text-[10px] text-slate-400">Perusahaan / Multi-Unit</div>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nama Lengkap Penanggung Jawab *
                      </label>
                      <input
                        type="text"
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        placeholder="contoh: Hendra Setiawan"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        No WhatsApp Aktif *
                      </label>
                      <input
                        type="text"
                        value={regData.phone}
                        onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                        placeholder="contoh: 081299887766"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {regData.role === 'PELANGGAN_KANTOR' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-indigo-950/20 border border-indigo-900/50 rounded-xl">
                      <div>
                        <label className="block text-xs font-semibold text-indigo-200 mb-1">
                          Nama Perusahaan / Gedung *
                        </label>
                        <input
                          type="text"
                          value={regData.companyName}
                          onChange={(e) => setRegData({ ...regData, companyName: e.target.value })}
                          placeholder="contoh: PT. Samudera Digital"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-indigo-200 mb-1">
                          NPWP Perusahaan (Opsional)
                        </label>
                        <input
                          type="text"
                          value={regData.taxIdentificationNumber}
                          onChange={(e) => setRegData({ ...regData, taxIdentificationNumber: e.target.value })}
                          placeholder="contoh: 01.234.567.8-901.000"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Login *
                      </label>
                      <input
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        placeholder="contoh: nama@email.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kata Sandi *
                      </label>
                      <input
                        type="password"
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        placeholder="Buat sandi aman..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alamat Lokasi Unit AC *
                    </label>
                    <textarea
                      value={regData.address}
                      onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                      placeholder="Masukkan alamat lengkap penanganan servis..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar & Langsung Masuk</span>
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Footer Security Notice */}
          <div className="border-t border-slate-800/80 bg-slate-950/90 px-6 py-3 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hak akses dan otorisasi seluruh fitur dikontrol penuh oleh <strong>Super Admin</strong>.</span>
            </div>
            <div className="text-slate-400">
              KoolFix AC Engineering v3.2
            </div>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pemulihan Kata Sandi</h3>
                <p className="text-xs text-slate-400">Prosedur Keamanan Terpusat</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              Dalam sistem terintegrasi KoolFix, pemulihan dan reset kata sandi dikelola secara tersentralisasi oleh <strong>Super Admin</strong> atau <strong>Admin Operasional</strong> untuk mencegah penyalahgunaan.
              <br /><br />
              Silakan hubungi Super Admin di hotline kantor (<strong>0812-8899-1122</strong>) atau minta admin melakukan <em>Reset Password</em> dari menu Manajemen Akun.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
