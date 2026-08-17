import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserCheck, 
  MapPin, 
  Clock, 
  Camera, 
  Calendar, 
  Compass, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AttendanceView: React.FC = () => {
  const { 
    currentUser, 
    attendanceRecords, 
    clockIn, 
    clockOut, 
    showNotification 
  } = useApp();

  const isTechnician = currentUser.role === 'TEKNISI';
  const todayStr = new Date().toISOString().split('T')[0];

  const todayAttendance = attendanceRecords.find(
    a => a.technicianId === currentUser.id && a.date === todayStr
  );

  const [currentTime, setCurrentTime] = useState(new Date());
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: -6.2088,
    lng: 106.8456,
    accuracy: 8,
  });
  const [address, setAddress] = useState('Jl. Jend. Sudirman No. 45, Jakarta Selatan');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selfiePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  );

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Request actual geolocation if supported
  const fetchLiveGPS = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        position => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
          });
          setAddress(`Lat: ${position.coords.latitude.toFixed(5)}, Lng: ${position.coords.longitude.toFixed(5)} (Akurat)`);
          setIsGettingLocation(false);
          showNotification('Lokasi GPS & Geotag berhasil diperbarui!', 'success');
        },
        () => {
          setIsGettingLocation(false);
          showNotification('Menggunakan koordinat stasiun operasional (GPS simulasi aktif)', 'info');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  const handleClockIn = () => {
    clockIn(
      currentUser.id,
      {
        latitude: coords.lat,
        longitude: coords.lng,
        addressName: address,
        accuracyMeters: coords.accuracy,
      },
      selfiePhoto
    );

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe
    }
  };

  const handleClockOut = () => {
    clockOut(currentUser.id, {
      latitude: coords.lat,
      longitude: coords.lng,
      addressName: address,
      accuracyMeters: coords.accuracy,
    });
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header with Bold Typography */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-500 font-bold mb-1">
            Real-time GPS & Field Verification
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none text-white">
            ABSENSI GEOTAG
          </h2>
        </div>

        <button
          onClick={fetchLiveGPS}
          disabled={isGettingLocation}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
          <span>Perbarui GPS</span>
        </button>
      </div>

      {/* Technician Clock In / Out Panel */}
      {isTechnician && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big Digital Clock Card */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                  Waktu Presensi Server
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GPS Live Active
                </span>
              </div>

              <div className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums text-white my-4">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                <span className="text-xl sm:text-2xl font-bold text-white/40 ml-2">WIB</span>
              </div>

              <p className="text-xs text-white/60 font-bold">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Geotag & Accuracy info */}
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">{address}</p>
                  <p className="text-white/40 text-[10px] font-mono">
                    Koordinat: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} (Radius: ±{coords.accuracy}m)
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {!todayAttendance ? (
                <button
                  onClick={handleClockIn}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  Clock In Masuk (Presensi GPS)
                </button>
              ) : !todayAttendance.clockOutTime ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold block uppercase">Jam Masuk Hari Ini</span>
                      <span className="text-lg font-black text-white">{todayAttendance.clockInTime} WIB</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                      AKTIF BERTUGAS
                    </span>
                  </div>

                  <button
                    onClick={handleClockOut}
                    className="py-3 px-6 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-red-600/30"
                  >
                    Clock Out Pulang
                  </button>
                </div>
              ) : (
                <div className="w-full p-4 bg-white/10 rounded-2xl border border-white/10 text-center">
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    ✓ Presensi Selesai ({todayAttendance.clockInTime} - {todayAttendance.clockOutTime} WIB)
                  </p>
                  <p className="text-[11px] text-white/60 mt-0.5">Uang kehadiran hari ini otomatis masuk ke slip gaji.</p>
                </div>
              )}
            </div>
          </div>

          {/* Selfie Preview & Rule Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-2">
                Verifikasi Foto Lapangan
              </span>
              <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 bg-black">
                <img
                  src={selfiePhoto}
                  alt="Selfie"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-mono text-emerald-400">
                  📍 Verified Geotag
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-white/60">
              <p className="font-bold text-white">Ketentuan Presensi GPS:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Presensi dilakukan di lokasi pengerjaan atau stasiun depot.</li>
                <li>Uang kehadiran otomatis dihitung ke laporan komisi bulanan.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History Log Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-black text-white tracking-tight">Log Riwayat Presensi & Geotag Seluruh Tim</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/70 font-black uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Nama Teknisi</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Jam Keluar</th>
                <th className="py-3 px-4">Lokasi Geotag</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attendanceRecords.map(record => (
                <tr key={record.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 font-bold text-white">{record.technicianName}</td>
                  <td className="py-3 px-4 font-mono text-white/70">{record.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{record.clockInTime} WIB</td>
                  <td className="py-3 px-4 font-mono text-white/60">{record.clockOutTime ? `${record.clockOutTime} WIB` : 'Bertugas'}</td>
                  <td className="py-3 px-4 text-white/60 max-w-xs truncate">{record.clockInLocation.addressName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      TERVALIDASI
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
