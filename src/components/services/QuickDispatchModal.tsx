import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceOrder, User } from '../../types';
import { 
  X, 
  UserCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Wrench,
  TrendingUp,
  ShieldCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickDispatchModalProps {
  order: ServiceOrder;
  onClose: () => void;
}

export const QuickDispatchModal: React.FC<QuickDispatchModalProps> = ({ order, onClose }) => {
  const { 
    users, 
    serviceOrders, 
    attendanceRecords, 
    assignTechnician, 
    calculateCommissionForOrder,
    updateServiceOrder
  } = useApp();

  const technicians = users.filter(u => u.role === 'TEKNISI');

  const todayStr = new Date().toISOString().split('T')[0];

  // State
  const [selectedTechId, setSelectedTechId] = useState<string>(order.technicianId || technicians[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState<string>(order.scheduledDate || todayStr);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>(order.scheduledTimeSlot || '09:00 - 11:00');
  const [dispatcherNote, setDispatcherNote] = useState<string>('');

  const timeSlots = [
    '08:30 - 10:30',
    '10:30 - 12:30',
    '13:30 - 15:30',
    '15:30 - 17:30',
  ];

  const selectedTech = technicians.find(t => t.id === selectedTechId);

  // Helper to check if technician is on duty today
  const isTechOnDuty = (techId: string) => {
    return attendanceRecords.some(a => a.userId === techId && a.date === todayStr && !a.clockOutTime);
  };

  // Helper to count active jobs assigned to tech on selected date
  const getTechWorkloadOnDate = (techId: string, date: string) => {
    return serviceOrders.filter(
      o => o.technicianId === techId && 
      o.scheduledDate === date && 
      o.status !== 'SELESAI' && 
      o.status !== 'DIBATALKAN' &&
      o.id !== order.id
    ).length;
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;

    assignTechnician(order.id, selectedTechId, scheduledDate, scheduledTimeSlot);

    if (dispatcherNote.trim()) {
      const combinedNotes = order.customerNotes 
        ? `${order.customerNotes}\n[Instruksi Dispatcher]: ${dispatcherNote.trim()}`
        : `[Instruksi Dispatcher]: ${dispatcherNote.trim()}`;
      updateServiceOrder(order.id, { customerNotes: combinedNotes });
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0F0F0F] rounded-3xl shadow-2xl overflow-hidden my-6 border border-white/15 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-blue-400">{order.orderNumber}</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                DISPATCH ORDER
              </span>
            </div>
            <h3 className="font-black text-2xl tracking-tight text-white mt-0.5">
              PILIH & TUGASKAN TEKNISI
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDispatch} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Order Snapshot Card */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Pelanggan</p>
                <p className="font-black text-white text-sm">{order.customerName}</p>
                {order.companyName && <p className="text-blue-400 font-bold">{order.companyName}</p>}
              </div>

              <div className="sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Nilai Servis</p>
                <p className="font-black text-emerald-400 text-sm tabular-nums">
                  Rp {(order.grandTotal || 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-white/60 pt-1 border-t border-white/5">
              <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
              <span>{order.customerAddress}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {order.serviceItems.map((item, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-black/40 border border-white/10 rounded text-[10px] font-bold text-white/80">
                  {item.categoryName} ({item.unitCount} unit)
                </span>
              ))}
            </div>
          </div>

          {/* Technician Selection List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-black uppercase tracking-wider text-white/70 block">
                Pilih Teknisi yang Ditugaskan ({technicians.length} Teknisi Terdaftar)
              </label>
              <span className="text-[10px] text-white/40">Klik salah satu untuk memilih</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {technicians.map(tech => {
                const isSelected = selectedTechId === tech.id;
                const onDuty = isTechOnDuty(tech.id);
                const workload = getTechWorkloadOnDate(tech.id, scheduledDate);
                const estimatedComm = typeof calculateCommissionForOrder === 'function' 
                  ? (calculateCommissionForOrder(order, tech) || 0)
                  : 0;

                return (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTechId(tech.id)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10' 
                        : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative">
                        <img 
                          src={tech.avatar} 
                          alt={tech.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-white/20"
                        />
                        {onDuty && (
                          <span 
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full"
                            title="On-Duty (Presensi GPS Aktif)"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-white text-sm">{tech.name}</h4>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                            ★ {tech.rating || '5.0'}
                          </span>
                          {onDuty ? (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              🟢 On-Duty GPS
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-white/40">
                              ⚪ Belum Presensi
                            </span>
                          )}
                        </div>

                        <p className="text-white/50 text-[11px] mt-0.5">
                          {tech.phone} • {tech.totalJobsCompleted || 0} Servis Tuntas
                        </p>

                        {tech.specialization && tech.specialization.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tech.specialization.map((spec, i) => (
                              <span key={i} className="text-[9px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded font-medium">
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold text-white/40 block">Beban Tanggal Ini:</span>
                        <span className={`font-black text-xs ${workload > 2 ? 'text-amber-400' : 'text-white'}`}>
                          {workload === 0 ? 'Tersedia (0 Job)' : `${workload} Job Terjadwal`}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 block mt-0.5 tabular-nums">
                          Komisi: Rp {(estimatedComm || 0).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition ${
                        isSelected ? 'bg-blue-600 border-blue-400 text-white' : 'border-white/30 text-transparent'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 fill-white text-blue-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule Adjustment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="block font-black uppercase tracking-wider text-white/60 mb-1">Tanggal Kunjungan Servis</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-white font-bold text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-black uppercase tracking-wider text-white/60 mb-1">Slot Waktu Kedatangan</label>
              <select
                value={scheduledTimeSlot}
                onChange={e => setScheduledTimeSlot(e.target.value)}
                className="w-full p-2.5 bg-black border border-white/15 rounded-xl text-white font-bold text-xs focus:ring-2 focus:ring-blue-500"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot} WIB</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dispatcher Notes */}
          <div>
            <label className="block font-black uppercase tracking-wider text-white/60 mb-1">
              Catatan Khusus / Instruksi Dispatcher (Opsional)
            </label>
            <input
              type="text"
              value={dispatcherNote}
              onChange={e => setDispatcherNote(e.target.value)}
              placeholder="Contoh: Bawa tangga lipat 3m dan cek outdoor di lantai 2"
              className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-white/40 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={!selectedTechId}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              Tugaskan ke {selectedTech?.name || 'Teknisi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
