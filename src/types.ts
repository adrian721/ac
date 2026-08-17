export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'TEKNISI' 
  | 'PELANGGAN_UMUM' 
  | 'PELANGGAN_KANTOR';

export type UserAccountStatus = 'AKTIF' | 'DITANGGUHKAN' | 'TERKUNCI' | 'NONAKTIF';

export type AppFeatureId = 
  | 'dashboard_view'            // Melihat dashboard & metrik utama
  | 'services_view'             // Melihat daftar order & riwayat servis
  | 'services_booking'          // Membuat pemesanan / order servis baru
  | 'services_dispatch'         // Menugaskan/disposisi teknisi ke order
  | 'services_status_update'    // Mengubah status pengerjaan servis
  | 'services_technical_report' // Mengisi laporan teknis & foto unit
  | 'services_payment_invoice'  // Memproses pembayaran & unduh invoice
  | 'inventory_view'            // Melihat daftar stok sparepart
  | 'inventory_manage'          // Menambah, edit, dan restock sparepart
  | 'attendance_view'           // Melihat catatan absensi tim
  | 'attendance_clockin'        // Melakukan absensi masuk/keluar geotag
  | 'technician_earnings_view'  // Melihat rekap penghasilan harian pribadi
  | 'payroll_manage'            // Mengatur skema gaji & payroll komisi
  | 'finance_reports'           // Mengakses laporan keuangan & laba rugi
  | 'accounts_view'             // Melihat daftar akun anggota & pelanggan
  | 'accounts_manage'           // Membuat, mengedit, reset password & blokir akun
  | 'feature_control_manage';   // Mengatur pembatasan fitur & matrix izin (Super Admin)

export interface FeatureDefinition {
  id: AppFeatureId;
  name: string;
  description: string;
  category: 'OPERASIONAL' | 'TEKNIK' | 'FINANSIAL' | 'SISTEM';
  minRecommendedRole: UserRole;
}

export type RoleDefaultPermissions = Record<UserRole, Record<AppFeatureId, boolean>>;

export interface User {
  id: string;
  username?: string;
  password?: string; // Standard or hashed credential
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  status: UserAccountStatus;
  address?: string;
  companyName?: string; // For PELANGGAN_KANTOR
  taxIdentificationNumber?: string; // For PELANGGAN_KANTOR
  specialization?: string[]; // For TEKNISI (e.g. ['Inverter', 'Cassette', 'VRV'])
  technicianSalaryConfig?: SalaryConfig; // Custom salary config per technician
  rating?: number;
  totalJobsCompleted?: number;
  joinDate: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  isPasswordTemporary?: boolean;
  customPermissions?: Partial<Record<AppFeatureId, boolean>>; // Per-user overrides
}

export type SalaryType = 'KEHADIRAN' | 'KOMISI' | 'GAJI_POKOK';

export interface SalaryConfig {
  enableBaseSalary: boolean;
  baseSalaryAmount: number; // e.g. 2,500,000 / month or 100,000 / day
  baseSalaryPeriod: 'BULANAN' | 'HARIAN';
  
  enableAttendanceAllowance: boolean;
  attendanceAllowancePerDay: number; // e.g. 50,000 / day
  
  enableCommission: boolean;
  commissionType: 'NOMINAL_PER_SERVICE' | 'PERCENTAGE_OF_ORDER';
  defaultCommissionPercentage: number; // e.g. 30%
  serviceCommissions: {
    serviceCategoryId: string;
    serviceCategoryName: string;
    commissionAmount: number; // e.g. Cuci AC: 25,000, Tambah Freon: 40,000
  }[];
}

export interface ACUnit {
  id: string;
  customerId: string;
  locationName: string; // e.g. "Kamar Utama", "Ruang Meeting Lt. 2", "Server Room"
  brand: string; // Daikin, Panasonic, Sharp, Gree, Mitsubishi, LG, Aux
  model?: string;
  type: 'SPLIT_WALL' | 'CASSETTE' | 'FLOOR_STANDING' | 'CENTRAL' | 'PORTABLE';
  capacityPK: '0.5 PK' | '0.75 PK' | '1 PK' | '1.5 PK' | '2 PK' | '2.5 PK' | '3 PK' | '5 PK';
  freonType: 'R32' | 'R410A' | 'R22' | 'R134a';
  installationYear?: number;
  lastServiceDate?: string;
  nextServiceDate?: string;
  notes?: string;
}

export type ServiceStatus = 
  | 'MENUNGGU_KONFIRMASI' 
  | 'DITUGASKAN' 
  | 'DALAM_PERJALANAN' 
  | 'SEDANG_DIKERJAKAN' 
  | 'SELESAI' 
  | 'DIBATALKAN';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  defaultCommission: number;
  estimatedMinutes: number;
  iconName: string;
}

export interface ServiceItemSelection {
  categoryId: string;
  categoryName: string;
  unitCount: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SparePartUsed {
  inventoryItemId: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface TechnicalReport {
  initialFreonPressurePsi?: number;
  finalFreonPressurePsi?: number;
  ampereReading?: number;
  initialTempCelsius?: number;
  finalTempCelsius?: number;
  cleaningDoneIndoor: boolean;
  cleaningDoneOutdoor: boolean;
  drainageChecked: boolean;
  electricalChecked: boolean;
  notes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  customerSignature?: string;
  completedAt?: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string; // e.g. ORD-2026-001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerType: 'UMUM' | 'KANTOR';
  companyName?: string;
  
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  
  scheduledDate: string; // YYYY-MM-DD
  scheduledTimeSlot: string; // e.g. "09:00 - 11:00", "13:00 - 15:00"
  
  serviceItems: ServiceItemSelection[];
  acUnitsDetails?: {
    acUnitId?: string;
    location: string;
    brand: string;
    capacity: string;
  }[];
  
  totalServicePrice: number;
  sparePartsUsed: SparePartUsed[];
  totalSparePartsPrice: number;
  discountAmount: number;
  grandTotal: number;
  
  status: ServiceStatus;
  paymentStatus: 'BELUM_BAYAR' | 'LUNAS' | 'DP';
  paymentMethod?: 'TUNAI' | 'TRANSFER_BANK' | 'QRIS' | 'TEMPO_KANTOR';
  
  customerNotes?: string;
  technicalReport?: TechnicalReport;
  
  createdAt: string;
  updatedAt: string;
  
  // Commission for this job calculated for the technician
  technicianCommissionEarned?: number;
  
  // Customer Review
  review?: CustomerReview;
}

export interface CustomerReview {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  rating: number; // 1 to 5
  cleanlinessRating: number; // 1 to 5
  punctualityRating: number; // 1 to 5
  politenessRating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  code: string; // e.g. SPR-FRN-R32, SPR-CAP-35UF
  name: string;
  category: 'FREON' | 'KAPASITOR' | 'PIPA_INSULASI' | 'MOTOR_FAN' | 'ELEKTRONIK' | 'CHEMICAL' | 'TOOLS_AKSESORIS';
  stock: number;
  minStockThreshold: number;
  unit: string; // kg, pcs, meter, kaleng, botol, roll
  purchasePrice: number; // Harga Beli / Modal
  sellingPrice: number; // Harga Jual
  compatibleUnits?: string;
  supplier?: string;
  lastRestockedAt: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'MASUK' | 'KELUAR' | 'PENYESUAIAN';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  referenceOrderId?: string;
  referenceOrderNumber?: string;
  notes: string;
  performedBy: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  technicianId: string;
  technicianName: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:mm:ss
  clockInLocation?: {
    latitude: number;
    longitude: number;
    addressName: string;
    accuracyMeters?: number;
  };
  clockInPhoto?: string;
  
  clockOutTime?: string;
  clockOutLocation?: {
    latitude: number;
    longitude: number;
    addressName: string;
  };
  
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPA';
  allowanceEarned: number; // Attendance allowance for this day
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  transactionNumber: string; // TRX-2026-001
  date: string; // YYYY-MM-DD HH:mm
  type: 'PEMASUKAN' | 'PENGELUARAN';
  category: 
    | 'PENDAPATAN_SERVIS' 
    | 'PENJUALAN_SPAREPART' 
    | 'KONTRAK_KANTOR' 
    | 'GAJI_TEKNISI' 
    | 'PEMBELIAN_STOK' 
    | 'OPERASIONAL_BBM' 
    | 'ALAT_PERALATAN' 
    | 'LAINNYA';
  amount: number;
  paymentMethod: 'TUNAI' | 'TRANSFER_BANK' | 'QRIS';
  referenceOrderId?: string;
  referenceOrderNumber?: string;
  description: string;
  recordedBy: string;
}

export interface TechnicianDailyEarnings {
  date: string;
  attendanceAllowance: number;
  jobsCompletedCount: number;
  totalJobCommissions: number;
  dailyBaseSalaryPortion: number;
  totalEarningsToday: number;
  jobBreakdown: {
    orderId: string;
    orderNumber: string;
    customerName: string;
    serviceNames: string;
    orderAmount: number;
    commissionEarned: number;
  }[];
}
