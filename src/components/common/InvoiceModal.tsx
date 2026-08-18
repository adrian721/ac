import React, { useRef } from 'react';
import { ServiceOrder } from '../../types';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Phone, MapPin, Mail, Wrench } from 'lucide-react';

interface InvoiceModalProps {
  order: ServiceOrder;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Modal Actions Bar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">Faktur & Berita Acara Pengerjaan Servis AC</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} className="p-8 bg-white text-slate-800 text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  ❄
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">KoolFix Indonesia</h1>
                  <p className="text-xs text-slate-500 font-medium">Jasa Servis & Pemeliharaan AC Profesional</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-600" /> Jl. Raya Casablanca No. 88, Tebet, Jakarta Selatan</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-600" /> (021) 8899-2345 / 0812-8899-1122</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-600" /> support@koolfix.co.id | www.koolfix.co.id</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200 uppercase tracking-wide">
                FAKTUR RESMI
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">{order.orderNumber}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tanggal: {order.scheduledDate}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Status: {order.paymentStatus === 'LUNAS' ? 'LUNAS (PAID)' : 'BELUM LUNAS'}
              </div>
            </div>
          </div>

          {/* Customer & Technician Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">PELANGGAN</p>
              <h4 className="font-bold text-slate-900 text-base mt-1">{order.customerName}</h4>
              {order.companyName && (
                <p className="text-xs font-medium text-blue-600">{order.companyName}</p>
              )}
              <p className="text-xs text-slate-600 mt-1">{order.customerAddress}</p>
              <p className="text-xs text-slate-600 mt-0.5">Telp/WA: {order.customerPhone}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">TEKNISI BERTUGAS</p>
              {order.assignedTechnicians && order.assignedTechnicians.length > 0 ? (
                <div className="mt-1 space-y-1">
                  {order.assignedTechnicians.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
                      <span>• {t.technicianName}</span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        ({t.roleInJob === 'LEAD' ? 'Lead' : 'Asisten'})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <h4 className="font-bold text-slate-900 text-base mt-1">{order.technicianName || 'Tim KoolFix'}</h4>
              )}
              <p className="text-xs text-slate-600 mt-1">Kontak Teknisi: {order.technicianPhone || '-'}</p>
              <p className="text-xs text-slate-600 mt-0.5">Waktu Servis: {order.scheduledTimeSlot}</p>
              {order.paymentMethod && (
                <p className="text-xs text-slate-600 mt-0.5">Metode Bayar: <span className="font-semibold">{order.paymentMethod}</span></p>
              )}
            </div>
          </div>

          {/* Technical Diagnostics (If available) */}
          {order.technicalReport && (
            <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50/50">
              <h4 className="text-xs font-bold uppercase text-blue-900 tracking-wider flex items-center gap-1.5 mb-2.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                Laporan Hasil Pengecekan & Parameter Teknis
              </h4>
              <div className="grid grid-cols-4 gap-3 text-xs mb-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px]">Tekanan Freon</span>
                  <span className="font-bold text-slate-900">
                    {order.technicalReport.initialFreonPressurePsi || '-'} → {order.technicalReport.finalFreonPressurePsi || '-'} PSI
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px]">Arus Listrik (Ampere)</span>
                  <span className="font-bold text-slate-900">
                    {order.technicalReport.ampereReading ? `${order.technicalReport.ampereReading} A` : '-'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px]">Suhu Hembusan</span>
                  <span className="font-bold text-slate-900">
                    {order.technicalReport.initialTempCelsius || '-'}°C → {order.technicalReport.finalTempCelsius || '-'}°C
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px]">Flushing Drainase</span>
                  <span className="font-bold text-emerald-600">
                    {order.technicalReport.drainageChecked ? '✓ Lancar & Bersih' : '-'}
                  </span>
                </div>
              </div>
              {order.technicalReport.notes && (
                <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900">Catatan Teknisi: </span>
                  {order.technicalReport.notes}
                </p>
              )}
            </div>
          )}

          {/* Service Items Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Rincian Jasa & Pekerjaan</h4>
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Deskripsi Layanan Servis</th>
                    <th className="py-2.5 px-3 text-center">Jumlah</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.serviceItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.categoryName}</td>
                      <td className="py-2.5 px-3 text-center">{item.unitCount} unit</td>
                      <td className="py-2.5 px-3 text-right">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        Rp {item.totalPrice.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                  {order.sparePartsUsed && order.sparePartsUsed.map((part, idx) => (
                    <tr key={`part-${idx}`} className="bg-amber-50/40">
                      <td className="py-2.5 px-3 text-slate-500">{order.serviceItems.length + idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        [Suku Cadang] {part.name} ({part.code})
                      </td>
                      <td className="py-2.5 px-3 text-center">{part.quantity} {part.unit}</td>
                      <td className="py-2.5 px-3 text-right">Rp {part.unitPrice.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        Rp {part.totalPrice.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="flex justify-between items-start mb-6">
            <div className="max-w-xs text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                Garansi Pengerjaan 30 Hari
              </div>
              <p>Garansi berlaku untuk jenis pengerjaan dan suku cadang yang tertera di faktur ini. Simpan bukti faktur ini untuk klaim garansi.</p>
            </div>

            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Jasa:</span>
                <span className="font-semibold text-slate-800">Rp {order.totalServicePrice.toLocaleString('id-ID')}</span>
              </div>
              {order.totalSparePartsPrice > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Suku Cadang:</span>
                  <span className="font-semibold text-slate-800">Rp {order.totalSparePartsPrice.toLocaleString('id-ID')}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon / Potongan:</span>
                  <span>- Rp {order.discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="border-t border-slate-300 pt-2 flex justify-between text-base font-bold text-slate-900">
                <span>Total Pembayaran:</span>
                <span className="text-blue-700">Rp {order.grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Stamps */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center text-xs">
            <div>
              <p className="text-slate-500 font-medium">Pelanggan,</p>
              <div className="h-16 flex items-center justify-center my-1">
                {order.technicalReport?.customerSignature ? (
                  <img
                    src={order.technicalReport.customerSignature}
                    alt="Tanda Tangan Pelanggan"
                    className="max-h-14 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 italic text-[11px]">(Telah Menyetujui Pengerjaan)</div>
                )}
              </div>
              <p className="font-bold text-slate-800 border-t border-slate-300 pt-1 inline-block min-w-40">
                {order.customerName}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Teknisi KoolFix,</p>
              <div className="h-16 flex items-center justify-center my-1">
                <div className="w-16 h-16 rounded-full border border-blue-400 bg-blue-50/50 flex flex-col items-center justify-center text-[10px] font-bold text-blue-700 leading-tight">
                  <span>KOOLFIX</span>
                  <span>VERIFIED</span>
                </div>
              </div>
              <p className="font-bold text-slate-800 border-t border-slate-300 pt-1 inline-block min-w-40">
                {order.technicianName || 'Tim Lapangan KoolFix'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
