import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceOrder } from '../../types';
import { InvoiceModal } from '../common/InvoiceModal';
import { QuickDispatchModal } from './QuickDispatchModal';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Printer, 
  Wrench, 
  Gauge, 
  Boxes, 
  Camera, 
  CheckCircle2,
  AlertCircle,
  Users,
  Crown,
  UserCheck,
  UserPlus
} from 'lucide-react';

interface ServiceOrderDetailModalProps {
  order: ServiceOrder;
  onClose: () => void;
  onOpenExecution?: () => void;
}

export const ServiceOrderDetailModal: React.FC<ServiceOrderDetailModalProps> = ({ 
  order, 
  onClose,
  onOpenExecution
}) => {
  const { currentUser, users } = useApp();
  const [showInvoice, setShowInvoice] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const isSuperOrAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';
  const isAssignedTech = order.technicianId === currentUser.id || 
    order.assignedTechnicians?.some(t => t.technicianId === currentUser.id);

  // Active technicians on this order
  const assignedList = order.assignedTechnicians && order.assignedTechnicians.length > 0
    ? order.assignedTechnicians
    : (order.technicianId ? [{
        technicianId: order.technicianId,
        technicianName: order.technicianName || 'Teknisi Utama',
        technicianPhone: order.technicianPhone || '',
        roleInJob: 'LEAD' as const,
        commissionSharePercent: 100,
        commissionEarned: order.technicianCommissionEarned || 0,
      }] : []);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-3xl bg-[#0F0F0F] rounded-3xl shadow-2xl overflow-hidden my-6 border border-white/15 text-white">
          {/* Header with Bold Typography */}
          <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-400">{order.orderNumber}</span>
                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded ${
                  order.status === 'SELESAI' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : order.status === 'SEDANG_DIKERJAKAN'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="font-black text-2xl tracking-tight text-white mt-1">DETAIL ORDER SERVIS</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoice(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Faktur
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs text-white/80">
            {/* Customer & Technician Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Box */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Data Pelanggan</p>
                <h4 className="font-black text-white text-base">{order.customerName}</h4>
                {order.companyName && <p className="text-blue-400 font-bold">{order.companyName}</p>}
                <p className="text-white/60">{order.customerAddress}</p>
                <p className="font-mono text-white/50">Telp/WA: {order.customerPhone}</p>
              </div>

              {/* Schedule Box */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Jadwal & Pembayaran</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white text-sm">{order.scheduledDate}</span>
                  <span className="text-white/50">({order.scheduledTimeSlot} WIB)</span>
                </div>
                <p className="text-emerald-400 font-bold">Status Pembayaran: {order.paymentStatus}</p>
                {order.customerNotes && (
                  <p className="text-white/70 italic text-[11px] bg-black/40 p-2 rounded-lg border border-white/5">
                    "{order.customerNotes}"
                  </p>
                )}
              </div>
            </div>

            {/* Assigned Technicians Team (Multi-Technician Support) */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/70">
                    Tim Teknisi Bertugas ({assignedList.length} Teknisi)
                  </p>
                </div>

                {isSuperOrAdmin && order.status !== 'SELESAI' && order.status !== 'DIBATALKAN' && (
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Atur / Tambah Teknisi
                  </button>
                )}
              </div>

              {assignedList.length === 0 ? (
                <div className="text-center py-4 bg-black/30 rounded-xl border border-white/5">
                  <p className="text-white/40 text-xs">Belum ada teknisi yang ditugaskan ke order ini.</p>
                  {isSuperOrAdmin && (
                    <button
                      onClick={() => setShowDispatchModal(true)}
                      className="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                    >
                      Tugaskan Teknisi Sekarang
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {assignedList.map((tech, idx) => {
                    const userObj = users.find(u => u.id === tech.technicianId);
                    const isLead = tech.roleInJob === 'LEAD';

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={tech.avatar || userObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={tech.technicianName}
                            className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-black text-white text-xs truncate">{tech.technicianName}</h5>
                              {isLead ? (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5" />
                                  LEAD
                                </span>
                              ) : (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  ASISTEN
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-white/50 font-mono mt-0.5">{tech.technicianPhone || userObj?.phone}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-white/40 block">Porsi Komisi</span>
                          <span className="text-[11px] font-black text-emerald-400 tabular-nums">
                            {tech.commissionSharePercent || 100}% {typeof tech.commissionEarned === 'number' && `(Rp ${tech.commissionEarned.toLocaleString('id-ID')})`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Services & Parts Table */}
            <div className="bg-black/40 rounded-2xl border border-white/10 p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Rincian Pekerjaan & Biaya</p>
              <div className="divide-y divide-white/5 text-xs">
                {order.serviceItems.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <div>
                      <span className="font-bold text-white">{item.categoryName}</span>
                      <span className="text-white/40 ml-2">x{item.unitCount} unit</span>
                    </div>
                    <span className="font-black text-white tabular-nums">Rp {(item.totalPrice || 0).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              {order.sparePartsUsed && order.sparePartsUsed.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Suku Cadang Terpakai:</p>
                  <div className="divide-y divide-white/5">
                    {order.sparePartsUsed.map((part, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between text-white/70">
                        <span>{part.name} ({part.quantity}x {part.unit})</span>
                        <span className="font-bold tabular-nums">Rp {(part.totalPrice || 0).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm font-black text-white">
                <span>Total Tagihan:</span>
                <span className="text-xl text-emerald-400 tabular-nums">
                  Rp {(order.grandTotal || order.totalServicePrice || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Technical Report if completed */}
            {order.technicalReport && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Laporan Hasil Uji Teknis</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-black/40 rounded-xl">
                    <span className="text-white/40 block text-[9px]">Tekanan Freon</span>
                    <span className="font-black text-white">{order.technicalReport.initialFreonPressurePsi} → {order.technicalReport.finalFreonPressurePsi} PSI</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-xl">
                    <span className="text-white/40 block text-[9px]">Arus Listrik</span>
                    <span className="font-black text-white">{order.technicalReport.ampereReading} A</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-xl">
                    <span className="text-white/40 block text-[9px]">Suhu Suplai</span>
                    <span className="font-black text-emerald-400">{order.technicalReport.finalTempCelsius}°C</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-xl">
                    <span className="text-white/40 block text-[9px]">Total Komisi Tim</span>
                    <span className="font-black text-amber-400">Rp {(order.technicianCommissionEarned || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                {order.technicalReport.technicianNotes && (
                  <p className="text-white/70 italic text-[11px] mt-2">"{order.technicalReport.technicianNotes}"</p>
                )}
              </div>
            )}
          </div>

          {/* Footer with actions */}
          <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase text-xs cursor-pointer"
            >
              Tutup
            </button>

            {(isSuperOrAdmin || isAssignedTech) && order.status !== 'SELESAI' && onOpenExecution && (
              <button
                onClick={() => {
                  onClose();
                  onOpenExecution();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Buka Lembar Eksekusi Servis
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}

      {/* Quick Dispatch Modal (Edit / Assign Multi-Technicians) */}
      {showDispatchModal && (
        <QuickDispatchModal
          order={order}
          onClose={() => setShowDispatchModal(false)}
        />
      )}
    </>
  );
};
