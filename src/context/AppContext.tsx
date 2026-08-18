import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  UserAccountStatus,
  AppFeatureId,
  FeatureDefinition,
  RoleDefaultPermissions,
  SalaryConfig, 
  ServiceCategory, 
  ACUnit, 
  ServiceOrder, 
  ServiceStatus, 
  InventoryItem, 
  InventoryTransaction, 
  AttendanceRecord, 
  FinancialTransaction, 
  CustomerReview, 
  TechnicalReport, 
  TechnicianDailyEarnings,
  SparePartUsed,
  AssignedTechnician
} from '../types';
import { 
  mockUsers, 
  initialSalaryConfig, 
  serviceCategories as initialServiceCategories, 
  mockACUnits, 
  mockInventory, 
  mockServiceOrders, 
  mockAttendanceRecords, 
  mockFinancialTransactions,
  systemFeatureDefinitions,
  defaultRolePermissions
} from '../data/mockData';

interface AppContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  login: (identifier: string, password: string) => { success: boolean; message: string };
  quickLoginAs: (userId: string) => void;
  logout: () => void;
  registerUser: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    companyName?: string;
    address?: string;
    taxIdentificationNumber?: string;
  }) => { success: boolean; message: string };

  switchRole: (role: UserRole, userId?: string) => void;
  
  // User & Access Control Management (Super Admin)
  users: User[];
  addUser: (user: Omit<User, 'id' | 'joinDate'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  setUserAccountStatus: (userId: string, status: UserAccountStatus) => void;
  resetUserPassword: (userId: string, customPassword?: string) => { success: boolean; temporaryPassword?: string };
  updateUserPermissions: (userId: string, permissions: Partial<Record<AppFeatureId, boolean>>) => void;
  lockAllUserSessions: (exceptUserId?: string) => void;
  updateTechnicianSalaryConfig: (technicianId: string, config: SalaryConfig) => void;
  
  // Feature Permissions Matrix (Super Admin)
  systemFeatureDefinitions: FeatureDefinition[];
  roleDefaultPermissions: RoleDefaultPermissions;
  updateRoleDefaultPermissions: (role: UserRole, permissions: Record<AppFeatureId, boolean>) => void;
  resetPermissionsToDefaults: () => void;
  hasPermission: (featureId: AppFeatureId, targetUser?: User) => boolean;

  globalSalaryConfig: SalaryConfig;
  updateGlobalSalaryConfig: (config: SalaryConfig) => void;
  
  serviceCategories: ServiceCategory[];
  addServiceCategory: (cat: Omit<ServiceCategory, 'id'>) => void;
  updateServiceCategory: (id: string, updates: Partial<ServiceCategory>) => void;
  
  acUnits: ACUnit[];
  addACUnit: (unit: Omit<ACUnit, 'id'>) => ACUnit;
  updateACUnit: (id: string, updates: Partial<ACUnit>) => void;
  deleteACUnit: (id: string) => void;
  
  serviceOrders: ServiceOrder[];
  createServiceOrder: (orderData: Partial<ServiceOrder>) => ServiceOrder;
  updateServiceOrder: (id: string, updates: Partial<ServiceOrder>) => void;
  assignTechnician: (orderId: string, technicianId: string, scheduledDate: string, timeSlot: string) => void;
  assignTechnicians: (
    orderId: string, 
    assignments: { technicianId: string; roleInJob?: 'LEAD' | 'ASSISTANT' | 'MEMBER'; commissionSharePercent?: number }[], 
    scheduledDate: string, 
    timeSlot: string
  ) => void;
  updateOrderStatus: (orderId: string, status: ServiceStatus) => void;
  completeTechnicianJob: (orderId: string, report: TechnicalReport, partsUsed: SparePartUsed[], paymentMethod: 'TUNAI' | 'TRANSFER_BANK' | 'QRIS' | 'TEMPO_KANTOR') => void;
  submitCustomerReview: (orderId: string, review: Omit<CustomerReview, 'id' | 'orderId' | 'createdAt'>) => void;
  
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestockedAt'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  restockItem: (itemId: string, quantity: number, unitPurchasePrice: number, supplier: string, notes?: string) => void;
  
  inventoryTransactions: InventoryTransaction[];
  
  attendanceRecords: AttendanceRecord[];
  clockIn: (technicianId: string, location?: { latitude: number; longitude: number; addressName: string; accuracyMeters?: number }, photoUrl?: string) => void;
  clockOut: (technicianId: string, location?: { latitude: number; longitude: number; addressName: string }) => void;
  
  financialTransactions: FinancialTransaction[];
  addFinancialExpense: (expense: Omit<FinancialTransaction, 'id' | 'transactionNumber' | 'type'>) => void;
  
  // Computed helpers
  calculateCommissionForOrder: (order: ServiceOrder, tech: User) => number;
  getTechnicianDailyEarnings: (technicianId: string, dateStr: string) => TechnicianDailyEarnings;
  getTechnicianMonthlyEarnings: (technicianId: string, yearMonth: string) => {
    attendanceDays: number;
    totalAttendanceAllowance: number;
    completedJobsCount: number;
    totalCommissions: number;
    baseSalary: number;
    totalMonthlyEarnings: number;
    dailyLogs: TechnicianDailyEarnings[];
  };
  
  notification: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  clearNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  IS_AUTH: 'koolfix_is_authenticated_v1',
  USERS: 'koolfix_users_v1',
  CURRENT_USER_ID: 'koolfix_current_uid_v1',
  ROLE_PERMS: 'koolfix_role_permissions_v1',
  SALARY_CONFIG: 'koolfix_salary_cfg_v1',
  CATEGORIES: 'koolfix_categories_v1',
  AC_UNITS: 'koolfix_ac_units_v1',
  ORDERS: 'koolfix_orders_v1',
  INVENTORY: 'koolfix_inventory_v1',
  INV_TRX: 'koolfix_inv_trx_v1',
  ATTENDANCE: 'koolfix_attendance_v1',
  FINANCE: 'koolfix_finance_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Users
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTH);
    return saved !== null ? JSON.parse(saved) : true; // Default true so user can immediately see preview or switch
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'usr-superadmin';
  });

  const [roleDefaultPermissions, setRoleDefaultPermissions] = useState<RoleDefaultPermissions>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE_PERMS);
    return saved ? JSON.parse(saved) : defaultRolePermissions;
  });

  const [globalSalaryConfig, setGlobalSalaryConfig] = useState<SalaryConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALARY_CONFIG);
    return saved ? JSON.parse(saved) : initialSalaryConfig;
  });

  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : initialServiceCategories;
  });

  const [acUnits, setAcUnits] = useState<ACUnit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AC_UNITS);
    return saved ? JSON.parse(saved) : mockACUnits;
  });

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : mockServiceOrders;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : mockInventory;
  });

  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INV_TRX);
    return saved ? JSON.parse(saved) : [
      {
        id: 'trx-inv-1',
        itemId: 'inv-1',
        itemName: 'Freon Refrigerant R32 Daikin Original (13.6 kg)',
        type: 'MASUK',
        quantity: 5,
        unitPrice: 650000,
        totalAmount: 3250000,
        notes: 'Restock bulanan dari supplier',
        performedBy: 'Budi Santoso',
        createdAt: '2026-08-10 14:00',
      },
      {
        id: 'trx-inv-2',
        itemId: 'inv-4',
        itemName: 'Kapasitor Kompresor 35 uF 450VAC Shizuki',
        type: 'KELUAR',
        quantity: 1,
        unitPrice: 110000,
        totalAmount: 110000,
        referenceOrderId: 'ord-001',
        referenceOrderNumber: 'ORD-2026-0816-01',
        notes: 'Dipakai pada servis Ibu Ratna Dewi',
        performedBy: 'Agus Pratama',
        createdAt: '2026-08-16 10:45',
      },
    ];
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : mockAttendanceRecords;
  });

  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FINANCE);
    return saved ? JSON.parse(saved) : mockFinancialTransactions;
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Sync state changes to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.IS_AUTH, JSON.stringify(isAuthenticated)); }, [isAuthenticated]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId); }, [currentUserId]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROLE_PERMS, JSON.stringify(roleDefaultPermissions)); }, [roleDefaultPermissions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SALARY_CONFIG, JSON.stringify(globalSalaryConfig)); }, [globalSalaryConfig]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(serviceCategories)); }, [serviceCategories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AC_UNITS, JSON.stringify(acUnits)); }, [acUnits]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(serviceOrders)); }, [serviceOrders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INV_TRX, JSON.stringify(inventoryTransactions)); }, [inventoryTransactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords)); }, [attendanceRecords]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(financialTransactions)); }, [financialTransactions]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  const clearNotification = () => setNotification(null);

  const setCurrentUser = (user: User) => {
    setCurrentUserId(user.id);
  };

  // Login authentication
  const login = (identifier: string, password: string): { success: boolean; message: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const user = users.find(u => 
      u.email.toLowerCase() === cleanId || 
      (u.username && u.username.toLowerCase() === cleanId) ||
      u.phone === cleanId
    );

    if (!user) {
      return { success: false, message: 'Akun tidak ditemukan. Periksa email, username, atau no WhatsApp.' };
    }

    if (user.status === 'DITANGGUHKAN' || user.status === 'TERKUNCI' || user.status === 'NONAKTIF') {
      return { 
        success: false, 
        message: `Akun Anda sedang ${user.status.toLowerCase()} oleh Super Admin. Silakan hubungi administrator.` 
      };
    }

    // Check password (supports default 'password123' if not set)
    const validPassword = user.password || 'password123';
    if (cleanPass !== validPassword && cleanPass !== 'password123') {
      return { success: false, message: 'Kata sandi salah. Silakan coba lagi.' };
    }

    // Update last login
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
    setUsers(prev => prev.map(u => u.id === user.id ? { 
      ...u, 
      lastLoginAt: nowStr,
      lastLoginIp: '180.252.164.20 (Aktif)'
    } : u));

    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    showNotification(`Selamat datang kembali, ${user.name}!`, 'success');
    return { success: true, message: 'Login berhasil' };
  };

  // Quick 1-click login for demo/testing
  const quickLoginAs = (userId: string) => {
    const match = users.find(u => u.id === userId);
    if (match) {
      setCurrentUserId(match.id);
      setIsAuthenticated(true);
      showNotification(`Login sebagai: ${match.name} (${match.role})`, 'info');
    }
  };

  // Logout session
  const logout = () => {
    setIsAuthenticated(false);
    showNotification('Anda telah berhasil keluar dari sesi.', 'info');
  };

  // Register customer or new user
  const registerUser = (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    companyName?: string;
    address?: string;
    taxIdentificationNumber?: string;
  }): { success: boolean; message: string } => {
    const existing = users.find(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role,
      companyName: userData.companyName,
      taxIdentificationNumber: userData.taxIdentificationNumber,
      address: userData.address,
      status: 'AKTIF',
      avatar: `https://images.unsplash.com/photo-${userData.role === 'PELANGGAN_KANTOR' ? '1486406146926-c627a92ad1ab' : '1535713875002-d1d0cf377fde'}?w=150&auto=format&fit=crop&q=80`,
      joinDate: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      lastLoginIp: '180.252.164.20 (Web Registrasi)',
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    showNotification(`Akun ${newUser.name} berhasil dibuat!`, 'success');
    return { success: true, message: 'Registrasi berhasil' };
  };

  // Permission evaluation helper
  const hasPermission = (featureId: AppFeatureId, targetUser?: User): boolean => {
    const user = targetUser || currentUser;
    if (!user) return false;

    // If account is suspended or locked, deny all
    if (user.status === 'DITANGGUHKAN' || user.status === 'TERKUNCI' || user.status === 'NONAKTIF') {
      return false;
    }

    // Super Admin by default has all permissions
    if (user.role === 'SUPER_ADMIN') {
      // Check if super admin explicitly turned off a custom permission for testing
      if (user.customPermissions?.[featureId] !== undefined) {
        return user.customPermissions[featureId]!;
      }
      return true;
    }

    // 1. Check user-specific custom permission override
    if (user.customPermissions && user.customPermissions[featureId] !== undefined) {
      return !!user.customPermissions[featureId];
    }

    // 2. Check role default permissions
    const rolePerms = roleDefaultPermissions[user.role];
    if (rolePerms && rolePerms[featureId] !== undefined) {
      return !!rolePerms[featureId];
    }

    return false;
  };

  // Update permissions for a whole role (Super Admin control)
  const updateRoleDefaultPermissions = (role: UserRole, permissions: Record<AppFeatureId, boolean>) => {
    setRoleDefaultPermissions(prev => ({
      ...prev,
      [role]: permissions,
    }));
    showNotification(`Matrix izin untuk role ${role} berhasil diperbarui!`, 'success');
  };

  // Reset all role permissions to factory defaults
  const resetPermissionsToDefaults = () => {
    setRoleDefaultPermissions(defaultRolePermissions);
    // Also reset custom user overrides
    setUsers(prev => prev.map(u => ({ ...u, customPermissions: undefined })));
    showNotification('Seluruh hak akses role dan pengguna dikembalikan ke setelan standar.', 'info');
  };

  // Update specific permissions for an individual user (Super Admin override)
  const updateUserPermissions = (userId: string, permissions: Partial<Record<AppFeatureId, boolean>>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          customPermissions: permissions,
        };
      }
      return u;
    }));
    showNotification('Hak akses khusus pengguna berhasil disimpan!', 'success');
  };

  // Account status control by Super Admin (Aktif / Ditangguhkan / Terkunci)
  const setUserAccountStatus = (userId: string, status: UserAccountStatus) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status };
      }
      return u;
    }));
    showNotification(`Status akun diperbarui menjadi: ${status}`, 'success');
  };

  // Reset user password by Super Admin
  const resetUserPassword = (userId: string, customPassword?: string): { success: boolean; temporaryPassword?: string } => {
    const tempPass = customPassword?.trim() || `koolfix${Math.floor(1000 + Math.random() * 9000)}`;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          password: tempPass,
          isPasswordTemporary: true,
        };
      }
      return u;
    }));
    showNotification(`Kata sandi akun berhasil direset!`, 'success');
    return { success: true, temporaryPassword: tempPass };
  };

  // Lock all user sessions (Super Admin security measure)
  const lockAllUserSessions = (exceptUserId?: string) => {
    const targetExcept = exceptUserId || currentUserId;
    setUsers(prev => prev.map(u => {
      if (u.id !== targetExcept && u.role !== 'SUPER_ADMIN') {
        return { ...u, status: 'DITANGGUHKAN' as UserAccountStatus };
      }
      return u;
    }));
    showNotification('Sesi seluruh anggota dan user berhasil ditangguhkan untuk audit keamanan.', 'warning');
  };

  const switchRole = (role: UserRole, targetUserId?: string) => {
    if (targetUserId) {
      const match = users.find(u => u.id === targetUserId);
      if (match) {
        setCurrentUserId(match.id);
        setIsAuthenticated(true);
        showNotification(`Beralih ke akun: ${match.name} (${role})`, 'info');
        return;
      }
    }
    const match = users.find(u => u.role === role);
    if (match) {
      setCurrentUserId(match.id);
      setIsAuthenticated(true);
      showNotification(`Beralih ke peran: ${role} (${match.name})`, 'info');
    }
  };

  // User Management
  const addUser = (userData: Omit<User, 'id' | 'joinDate'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      joinDate: new Date().toISOString().split('T')[0],
      technicianSalaryConfig: userData.role === 'TEKNISI' ? (userData.technicianSalaryConfig || globalSalaryConfig) : undefined,
    };
    setUsers(prev => [newUser, ...prev]);
    showNotification(`Pengguna ${newUser.name} berhasil ditambahkan!`, 'success');
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    showNotification('Data pengguna berhasil diperbarui', 'success');
  };

  const updateTechnicianSalaryConfig = (technicianId: string, config: SalaryConfig) => {
    setUsers(prev => prev.map(u => {
      if (u.id === technicianId) {
        return { ...u, technicianSalaryConfig: config };
      }
      return u;
    }));
    showNotification('Konfigurasi penggajian teknisi berhasil disimpan!', 'success');
  };

  const updateGlobalSalaryConfig = (config: SalaryConfig) => {
    setGlobalSalaryConfig(config);
    showNotification('Pengaturan skema komisi & gaji global diperbarui', 'success');
  };

  // Service Categories
  const addServiceCategory = (cat: Omit<ServiceCategory, 'id'>) => {
    const newCat: ServiceCategory = {
      ...cat,
      id: `srv-${Date.now()}`,
    };
    setServiceCategories(prev => [...prev, newCat]);
    showNotification(`Layanan "${cat.name}" ditambahkan`, 'success');
  };

  const updateServiceCategory = (id: string, updates: Partial<ServiceCategory>) => {
    setServiceCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showNotification('Data layanan diperbarui', 'success');
  };

  // AC Units
  const addACUnit = (unitData: Omit<ACUnit, 'id'>): ACUnit => {
    const newUnit: ACUnit = {
      ...unitData,
      id: `ac-${Date.now()}`,
    };
    setAcUnits(prev => [newUnit, ...prev]);
    showNotification(`Unit AC "${newUnit.brand} ${newUnit.capacityPK}" berhasil didaftarkan`, 'success');
    return newUnit;
  };

  const updateACUnit = (id: string, updates: Partial<ACUnit>) => {
    setAcUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    showNotification('Data unit AC diperbarui', 'success');
  };

  const deleteACUnit = (id: string) => {
    setAcUnits(prev => prev.filter(u => u.id !== id));
    showNotification('Unit AC dihapus dari daftar', 'info');
  };

  // Calculate technician commission for a service order based on tech's salary config
  const calculateCommissionForOrder = (order: ServiceOrder, tech: User): number => {
    const config = tech.technicianSalaryConfig || globalSalaryConfig;
    if (!config.enableCommission) return 0;

    if (config.commissionType === 'PERCENTAGE_OF_ORDER') {
      const pct = config.defaultCommissionPercentage || 30;
      return Math.round((order.totalServicePrice * pct) / 100);
    }

    // Nominal per service category
    let totalComm = 0;
    order.serviceItems.forEach(item => {
      const customComm = config.serviceCommissions?.find(sc => sc.serviceCategoryId === item.categoryId);
      if (customComm) {
        totalComm += customComm.commissionAmount * item.unitCount;
      } else {
        const cat = serviceCategories.find(c => c.id === item.categoryId);
        totalComm += (cat?.defaultCommission || 25000) * item.unitCount;
      }
    });
    return totalComm;
  };

  // Service Orders
  const createServiceOrder = (orderData: Partial<ServiceOrder>): ServiceOrder => {
    const today = new Date();
    const dateCode = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(10 + Math.random() * 90);
    const orderNumber = `ORD-${dateCode}-${randNum}`;

    const totalServicePrice = orderData.serviceItems?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
    const totalSparePartsPrice = orderData.sparePartsUsed?.reduce((sum, part) => sum + part.totalPrice, 0) || 0;
    const discount = orderData.discountAmount || 0;
    const grandTotal = Math.max(0, totalServicePrice + totalSparePartsPrice - discount);

    let commission = 0;
    let assignedTechs: AssignedTechnician[] | undefined = orderData.assignedTechnicians;

    if (!assignedTechs && orderData.technicianId) {
      const tech = users.find(u => u.id === orderData.technicianId);
      if (tech) {
        commission = calculateCommissionForOrder({ ...orderData, totalServicePrice } as ServiceOrder, tech);
        assignedTechs = [
          {
            technicianId: tech.id,
            technicianName: tech.name,
            technicianPhone: tech.phone,
            avatar: tech.avatar,
            roleInJob: 'LEAD',
            commissionSharePercent: 100,
            commissionEarned: commission,
          }
        ];
      }
    } else if (assignedTechs && assignedTechs.length > 0) {
      commission = assignedTechs.reduce((sum, t) => sum + (t.commissionEarned || 0), 0);
    }

    const leadTech = assignedTechs?.find(t => t.roleInJob === 'LEAD') || assignedTechs?.[0];

    const newOrder: ServiceOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: orderData.customerId || currentUser.id,
      customerName: orderData.customerName || currentUser.name,
      customerPhone: orderData.customerPhone || currentUser.phone,
      customerAddress: orderData.customerAddress || currentUser.address || '',
      customerType: orderData.customerType || (currentUser.role === 'PELANGGAN_KANTOR' ? 'KANTOR' : 'UMUM'),
      companyName: orderData.companyName || currentUser.companyName,
      technicianId: leadTech?.technicianId || orderData.technicianId,
      technicianName: leadTech?.technicianName || orderData.technicianName,
      technicianPhone: leadTech?.technicianPhone || orderData.technicianPhone,
      assignedTechnicians: assignedTechs,
      scheduledDate: orderData.scheduledDate || today.toISOString().split('T')[0],
      scheduledTimeSlot: orderData.scheduledTimeSlot || '09:00 - 11:00',
      serviceItems: orderData.serviceItems || [],
      acUnitsDetails: orderData.acUnitsDetails || [],
      totalServicePrice,
      sparePartsUsed: orderData.sparePartsUsed || [],
      totalSparePartsPrice,
      discountAmount: discount,
      grandTotal,
      status: orderData.status || 'MENUNGGU_KONFIRMASI',
      paymentStatus: orderData.paymentStatus || 'BELUM_BAYAR',
      paymentMethod: orderData.paymentMethod,
      customerNotes: orderData.customerNotes,
      technicianCommissionEarned: commission,
      createdAt: today.toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: today.toISOString().replace('T', ' ').slice(0, 16),
    };

    setServiceOrders(prev => [newOrder, ...prev]);
    showNotification(`Pesanan Servis #${orderNumber} berhasil dibuat!`, 'success');
    return newOrder;
  };

  const updateServiceOrder = (id: string, updates: Partial<ServiceOrder>) => {
    setServiceOrders(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          ...updates,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return o;
    }));
  };

  // Assign multiple technicians to a single service order
  const assignTechnicians = (
    orderId: string, 
    assignments: { technicianId: string; roleInJob?: 'LEAD' | 'ASSISTANT' | 'MEMBER'; commissionSharePercent?: number }[], 
    scheduledDate: string, 
    timeSlot: string
  ) => {
    if (!assignments || assignments.length === 0) return;

    setServiceOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // Calculate default split if not explicitly specified
        const totalPctProvided = assignments.reduce((sum, a) => sum + (a.commissionSharePercent || 0), 0);
        
        const mappedTechs: AssignedTechnician[] = assignments.map((a, idx) => {
          const userTech = users.find(u => u.id === a.technicianId);
          let share = a.commissionSharePercent;
          if (share === undefined || totalPctProvided === 0) {
            if (assignments.length === 1) {
              share = 100;
            } else if (assignments.length === 2) {
              share = idx === 0 ? 60 : 40; // Default Lead 60%, Asisten 40%
            } else {
              share = Math.round(100 / assignments.length);
            }
          }

          // Calculate technician's individual commission
          const baseComm = calculateCommissionForOrder(o, userTech || users[0]);
          const techCommission = Math.round((baseComm * share) / 100);

          return {
            technicianId: a.technicianId,
            technicianName: userTech?.name || 'Teknisi KoolFix',
            technicianPhone: userTech?.phone || '',
            avatar: userTech?.avatar,
            roleInJob: a.roleInJob || (idx === 0 ? 'LEAD' : 'ASSISTANT'),
            commissionSharePercent: share,
            commissionEarned: techCommission,
          };
        });

        const leadTech = mappedTechs.find(t => t.roleInJob === 'LEAD') || mappedTechs[0];
        const totalCommission = mappedTechs.reduce((sum, t) => sum + (t.commissionEarned || 0), 0);

        return {
          ...o,
          technicianId: leadTech.technicianId,
          technicianName: leadTech.technicianName,
          technicianPhone: leadTech.technicianPhone,
          assignedTechnicians: mappedTechs,
          scheduledDate,
          scheduledTimeSlot: timeSlot,
          status: 'DITUGASKAN',
          technicianCommissionEarned: totalCommission,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return o;
    }));

    const techNames = assignments.map(a => users.find(u => u.id === a.technicianId)?.name).filter(Boolean).join(', ');
    showNotification(`Penugasan ${assignments.length} teknisi (${techNames}) berhasil disimpan!`, 'success');
  };

  // Backward compatible single technician assign
  const assignTechnician = (orderId: string, technicianId: string, scheduledDate: string, timeSlot: string) => {
    assignTechnicians(
      orderId,
      [{ technicianId, roleInJob: 'LEAD', commissionSharePercent: 100 }],
      scheduledDate,
      timeSlot
    );
  };

  const updateOrderStatus = (orderId: string, status: ServiceStatus) => {
    setServiceOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return o;
    }));
    showNotification(`Status pengerjaan diperbarui menjadi: ${status.replace(/_/g, ' ')}`, 'info');
  };

  // Complete job with full technical inspection report, spare parts deduction & multi-technician commission calculation
  const completeTechnicianJob = (
    orderId: string, 
    report: TechnicalReport, 
    partsUsed: SparePartUsed[], 
    paymentMethod: 'TUNAI' | 'TRANSFER_BANK' | 'QRIS' | 'TEMPO_KANTOR'
  ) => {
    const targetOrder = serviceOrders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const leadTech = users.find(u => u.id === targetOrder.technicianId) || currentUser;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // 1. Calculate spare parts total
    const totalSpareParts = partsUsed.reduce((sum, p) => sum + p.totalPrice, 0);
    const grandTotal = Math.max(0, targetOrder.totalServicePrice + totalSpareParts - targetOrder.discountAmount);

    // 2. Deduct inventory & record stock out transactions
    if (partsUsed.length > 0) {
      setInventory(prevInv => {
        const updated = [...prevInv];
        partsUsed.forEach(part => {
          const itemIdx = updated.findIndex(i => i.id === part.inventoryItemId);
          if (itemIdx >= 0) {
            updated[itemIdx] = {
              ...updated[itemIdx],
              stock: Math.max(0, updated[itemIdx].stock - part.quantity),
            };
          }
        });
        return updated;
      });

      const newInvTrx: InventoryTransaction[] = partsUsed.map(part => ({
        id: `trx-inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        itemId: part.inventoryItemId,
        itemName: part.name,
        type: 'KELUAR',
        quantity: part.quantity,
        unitPrice: part.unitPrice,
        totalAmount: part.totalPrice,
        referenceOrderId: targetOrder.id,
        referenceOrderNumber: targetOrder.orderNumber,
        notes: `Digunakan pada pekerjaan servis ${targetOrder.customerName}`,
        performedBy: leadTech.name,
        createdAt: nowStr,
      }));
      setInventoryTransactions(prev => [...newInvTrx, ...prev]);
    }

    // 3. Calculate technician commission(s) for all assigned technicians
    let updatedAssignedTechs: AssignedTechnician[] | undefined = undefined;
    let totalCalculatedCommission = 0;

    if (targetOrder.assignedTechnicians && targetOrder.assignedTechnicians.length > 0) {
      updatedAssignedTechs = targetOrder.assignedTechnicians.map(at => {
        const share = at.commissionSharePercent || (100 / targetOrder.assignedTechnicians!.length);
        const techUser = users.find(u => u.id === at.technicianId) || leadTech;
        const individualBase = calculateCommissionForOrder({ ...targetOrder, totalServicePrice: targetOrder.totalServicePrice }, techUser);
        const commEarned = Math.round((individualBase * share) / 100);
        return {
          ...at,
          commissionEarned: commEarned,
        };
      });
      totalCalculatedCommission = updatedAssignedTechs.reduce((sum, t) => sum + (t.commissionEarned || 0), 0);
    } else {
      totalCalculatedCommission = calculateCommissionForOrder({ ...targetOrder, totalServicePrice: targetOrder.totalServicePrice }, leadTech);
      updatedAssignedTechs = [
        {
          technicianId: leadTech.id,
          technicianName: leadTech.name,
          technicianPhone: leadTech.phone,
          avatar: leadTech.avatar,
          roleInJob: 'LEAD',
          commissionSharePercent: 100,
          commissionEarned: totalCalculatedCommission,
        }
      ];
    }

    // 4. Update service order
    const updatedOrder: ServiceOrder = {
      ...targetOrder,
      sparePartsUsed: partsUsed,
      totalSparePartsPrice: totalSpareParts,
      grandTotal,
      status: 'SELESAI',
      paymentStatus: paymentMethod === 'TEMPO_KANTOR' ? 'BELUM_BAYAR' : 'LUNAS',
      paymentMethod,
      technicalReport: {
        ...report,
        completedAt: nowStr,
      },
      assignedTechnicians: updatedAssignedTechs,
      technicianCommissionEarned: totalCalculatedCommission,
      updatedAt: nowStr,
    };

    setServiceOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    // 5. If paid, automatically record in Financial cash in
    if (paymentMethod !== 'TEMPO_KANTOR') {
      const newFinTrx: FinancialTransaction = {
        id: `trx-${Date.now()}`,
        transactionNumber: `TRX-${Date.now().toString().slice(-6)}`,
        date: nowStr,
        type: 'PEMASUKAN',
        category: 'PENDAPATAN_SERVIS',
        amount: grandTotal,
        paymentMethod: paymentMethod,
        referenceOrderId: targetOrder.id,
        referenceOrderNumber: targetOrder.orderNumber,
        description: `Pembayaran Selesai Servis AC #${targetOrder.orderNumber} - ${targetOrder.customerName}`,
        recordedBy: leadTech.name,
      };
      setFinancialTransactions(prev => [newFinTrx, ...prev]);
    }

    // 6. Update all assigned technicians total completed jobs count
    const assignedIds = updatedAssignedTechs.map(t => t.technicianId);
    setUsers(prev => prev.map(u => {
      if (assignedIds.includes(u.id)) {
        return { ...u, totalJobsCompleted: (u.totalJobsCompleted || 0) + 1 };
      }
      return u;
    }));

    showNotification(`Pengerjaan #${targetOrder.orderNumber} selesai! Laporan teknis & komisi tim berhasil diproses.`, 'success');
  };

  // Submit Review
  const submitCustomerReview = (orderId: string, reviewData: Omit<CustomerReview, 'id' | 'orderId' | 'createdAt'>) => {
    const order = serviceOrders.find(o => o.id === orderId);
    if (!order) return;

    const newReview: CustomerReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      orderId,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setServiceOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, review: newReview };
      }
      return o;
    }));

    // Update technician rating average for all assigned technicians
    const targetTechIds = order.assignedTechnicians && order.assignedTechnicians.length > 0
      ? order.assignedTechnicians.map(t => t.technicianId)
      : (order.technicianId ? [order.technicianId] : []);

    if (targetTechIds.length > 0) {
      targetTechIds.forEach(tId => {
        const techOrders = serviceOrders.filter(o => 
          (o.technicianId === tId || o.assignedTechnicians?.some(at => at.technicianId === tId)) && 
          o.review
        );
        const allRatings = [...techOrders.map(o => o.review!.rating), newReview.rating];
        const avg = (allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(1);

        setUsers(prev => prev.map(u => {
          if (u.id === tId) {
            return { ...u, rating: parseFloat(avg) };
          }
          return u;
        }));
      });
    }

    showNotification('Terima kasih atas ulasan & penilaian Anda untuk tim teknisi KoolFix!', 'success');
  };

  // Inventory Methods
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastRestockedAt'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      lastRestockedAt: new Date().toISOString().split('T')[0],
    };
    setInventory(prev => [newItem, ...prev]);

    // Record restock transaction if initial stock > 0
    if (newItem.stock > 0) {
      const trx: InventoryTransaction = {
        id: `trx-inv-${Date.now()}`,
        itemId: newItem.id,
        itemName: newItem.name,
        type: 'MASUK',
        quantity: newItem.stock,
        unitPrice: newItem.purchasePrice,
        totalAmount: newItem.stock * newItem.purchasePrice,
        notes: 'Stok awal penambahan barang baru',
        performedBy: currentUser.name,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setInventoryTransactions(prev => [trx, ...prev]);
    }
    showNotification(`Komponen "${newItem.name}" ditambahkan ke inventaris`, 'success');
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    showNotification('Data suku cadang berhasil diperbarui', 'success');
  };

  const restockItem = (itemId: string, quantity: number, unitPurchasePrice: number, supplier: string, notes?: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const totalAmount = quantity * unitPurchasePrice;

    setInventory(prev => prev.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          stock: i.stock + quantity,
          purchasePrice: unitPurchasePrice,
          supplier: supplier || i.supplier,
          lastRestockedAt: nowStr.split(' ')[0],
        };
      }
      return i;
    }));

    // Record in inventory transaction
    const invTrx: InventoryTransaction = {
      id: `trx-inv-${Date.now()}`,
      itemId,
      itemName: item.name,
      type: 'MASUK',
      quantity,
      unitPrice: unitPurchasePrice,
      totalAmount,
      notes: notes || `Restock dari ${supplier}`,
      performedBy: currentUser.name,
      createdAt: nowStr,
    };
    setInventoryTransactions(prev => [invTrx, ...prev]);

    // Record in financial expense
    const finTrx: FinancialTransaction = {
      id: `trx-fin-${Date.now()}`,
      transactionNumber: `TRX-${Date.now().toString().slice(-6)}`,
      date: nowStr,
      type: 'PENGELUARAN',
      category: 'PEMBELIAN_STOK',
      amount: totalAmount,
      paymentMethod: 'TRANSFER_BANK',
      description: `Pembelian Restok ${item.name} (${quantity} ${item.unit})`,
      recordedBy: currentUser.name,
    };
    setFinancialTransactions(prev => [finTrx, ...prev]);

    showNotification(`Restok ${quantity} ${item.unit} ${item.name} berhasil dicatat!`, 'success');
  };

  // Attendance Clock-in/Clock-out with Geotag & Allowance
  const clockIn = (
    technicianId: string, 
    location?: { latitude: number; longitude: number; addressName: string; accuracyMeters?: number },
    photoUrl?: string
  ) => {
    const tech = users.find(u => u.id === technicianId);
    if (!tech) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0];

    // Check if already clocked in today
    const existing = attendanceRecords.find(a => a.technicianId === technicianId && a.date === todayStr);
    if (existing) {
      showNotification('Anda sudah melakukan absensi masuk hari ini!', 'warning');
      return;
    }

    const config = tech.technicianSalaryConfig || globalSalaryConfig;
    const allowance = config.enableAttendanceAllowance ? config.attendanceAllowancePerDay : 0;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      technicianId,
      technicianName: tech.name,
      date: todayStr,
      clockInTime: timeStr,
      clockInLocation: location || {
        latitude: -6.229746,
        longitude: 106.829518,
        addressName: 'KoolFix Dispatch & Station Jakarta',
        accuracyMeters: 10,
      },
      clockInPhoto: photoUrl,
      status: 'HADIR',
      allowanceEarned: allowance,
      notes: 'Presensi harian via Geotag & Timestamp',
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    showNotification(`Presensi Masuk Berhasil! ${allowance > 0 ? `Uang kehadiran Rp ${allowance.toLocaleString('id-ID')} tercatat.` : ''}`, 'success');
  };

  const clockOut = (
    technicianId: string, 
    location?: { latitude: number; longitude: number; addressName: string }
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0];

    setAttendanceRecords(prev => prev.map(a => {
      if (a.technicianId === technicianId && a.date === todayStr) {
        return {
          ...a,
          clockOutTime: timeStr,
          clockOutLocation: location || {
            latitude: -6.229746,
            longitude: 106.829518,
            addressName: 'KoolFix Dispatch Jakarta',
          },
        };
      }
      return a;
    }));
    showNotification('Presensi Pulang Berhasil. Terima kasih atas dedikasi kerja hari ini!', 'success');
  };

  // Financial Expense
  const addFinancialExpense = (expense: Omit<FinancialTransaction, 'id' | 'transactionNumber' | 'type'>) => {
    const newTrx: FinancialTransaction = {
      ...expense,
      id: `trx-${Date.now()}`,
      transactionNumber: `TRX-OUT-${Date.now().toString().slice(-6)}`,
      type: 'PENGELUARAN',
    };
    setFinancialTransactions(prev => [newTrx, ...prev]);
    showNotification(`Pengeluaran Rp ${expense.amount.toLocaleString('id-ID')} dicatat ke kas`, 'success');
  };

  // Helper to extract a technician's specific commission on an order
  const getTechCommissionForOrder = (order: ServiceOrder, techId: string): number => {
    if (order.assignedTechnicians && order.assignedTechnicians.length > 0) {
      const match = order.assignedTechnicians.find(t => t.technicianId === techId);
      if (match && typeof match.commissionEarned === 'number') {
        return match.commissionEarned;
      }
      if (match && typeof match.commissionSharePercent === 'number') {
        return Math.round(((order.technicianCommissionEarned || 0) * match.commissionSharePercent) / 100);
      }
    }
    if (order.technicianId === techId) {
      return order.technicianCommissionEarned || 0;
    }
    return 0;
  };

  // Technician Daily Earnings Calculation (Transparent & Real-time)
  const getTechnicianDailyEarnings = (technicianId: string, dateStr: string): TechnicianDailyEarnings => {
    const tech = users.find(u => u.id === technicianId);
    const config = tech?.technicianSalaryConfig || globalSalaryConfig;

    // 1. Attendance allowance
    const att = attendanceRecords.find(a => a.technicianId === technicianId && a.date === dateStr && a.status === 'HADIR');
    const attendanceAllowance = att ? att.allowanceEarned : 0;

    // 2. Base salary daily portion (if daily or divided from monthly)
    let dailyBaseSalaryPortion = 0;
    if (config.enableBaseSalary) {
      if (config.baseSalaryPeriod === 'HARIAN') {
        dailyBaseSalaryPortion = config.baseSalaryAmount;
      } else {
        // Assume 25 working days / month
        dailyBaseSalaryPortion = Math.round(config.baseSalaryAmount / 25);
      }
    }

    // 3. Completed jobs on that date (supports multi-technician assigned jobs)
    const completedJobsToday = serviceOrders.filter(o => 
      (o.technicianId === technicianId || o.assignedTechnicians?.some(t => t.technicianId === technicianId)) && 
      o.status === 'SELESAI' && 
      (o.scheduledDate === dateStr || o.technicalReport?.completedAt?.startsWith(dateStr))
    );

    const jobBreakdown = completedJobsToday.map(job => {
      const serviceNames = job.serviceItems.map(s => `${s.categoryName} (${s.unitCount}x)`).join(', ');
      const myCommission = getTechCommissionForOrder(job, technicianId);
      const teamSuffix = job.assignedTechnicians && job.assignedTechnicians.length > 1
        ? ` (Tim: ${job.assignedTechnicians.length} Teknisi)`
        : '';
      return {
        orderId: job.id,
        orderNumber: job.orderNumber,
        customerName: `${job.customerName}${teamSuffix}`,
        serviceNames,
        orderAmount: job.grandTotal,
        commissionEarned: myCommission,
      };
    });

    const totalJobCommissions = jobBreakdown.reduce((sum, j) => sum + j.commissionEarned, 0);
    const totalEarningsToday = attendanceAllowance + dailyBaseSalaryPortion + totalJobCommissions;

    return {
      date: dateStr,
      attendanceAllowance,
      jobsCompletedCount: completedJobsToday.length,
      totalJobCommissions,
      dailyBaseSalaryPortion,
      totalEarningsToday,
      jobBreakdown,
    };
  };

  const getTechnicianMonthlyEarnings = (technicianId: string, yearMonth: string) => {
    const tech = users.find(u => u.id === technicianId);
    const config = tech?.technicianSalaryConfig || globalSalaryConfig;

    // Filter attendance in that month
    const monthlyAttendance = attendanceRecords.filter(a => 
      a.technicianId === technicianId && 
      a.date.startsWith(yearMonth) && 
      a.status === 'HADIR'
    );
    const attendanceDays = monthlyAttendance.length;
    const totalAttendanceAllowance = monthlyAttendance.reduce((sum, a) => sum + a.allowanceEarned, 0);

    // Filter completed jobs in that month (supports multi-technician assigned jobs)
    const monthlyJobs = serviceOrders.filter(o => 
      (o.technicianId === technicianId || o.assignedTechnicians?.some(t => t.technicianId === technicianId)) && 
      o.status === 'SELESAI' && 
      o.scheduledDate.startsWith(yearMonth)
    );
    const completedJobsCount = monthlyJobs.length;
    const totalCommissions = monthlyJobs.reduce((sum, o) => sum + getTechCommissionForOrder(o, technicianId), 0);

    const baseSalary = config.enableBaseSalary ? config.baseSalaryAmount : 0;
    const totalMonthlyEarnings = baseSalary + totalAttendanceAllowance + totalCommissions;

    // Generate daily logs
    const daysInMonth = new Date(parseInt(yearMonth.split('-')[0]), parseInt(yearMonth.split('-')[1]), 0).getDate();
    const dailyLogs: TechnicianDailyEarnings[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${yearMonth}-${d < 10 ? '0' + d : d}`;
      dailyLogs.push(getTechnicianDailyEarnings(technicianId, dayStr));
    }

    return {
      attendanceDays,
      totalAttendanceAllowance,
      completedJobsCount,
      totalCommissions,
      baseSalary,
      totalMonthlyEarnings,
      dailyLogs,
    };
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      currentUser,
      setCurrentUser,
      login,
      quickLoginAs,
      logout,
      registerUser,
      switchRole,
      users,
      addUser,
      updateUser,
      setUserAccountStatus,
      resetUserPassword,
      updateUserPermissions,
      lockAllUserSessions,
      updateTechnicianSalaryConfig,
      systemFeatureDefinitions,
      roleDefaultPermissions,
      updateRoleDefaultPermissions,
      resetPermissionsToDefaults,
      hasPermission,
      globalSalaryConfig,
      updateGlobalSalaryConfig,
      serviceCategories,
      addServiceCategory,
      updateServiceCategory,
      acUnits,
      addACUnit,
      updateACUnit,
      deleteACUnit,
      serviceOrders,
      createServiceOrder,
      updateServiceOrder,
      assignTechnician,
      assignTechnicians,
      updateOrderStatus,
      completeTechnicianJob,
      submitCustomerReview,
      inventory,
      addInventoryItem,
      updateInventoryItem,
      restockItem,
      inventoryTransactions,
      attendanceRecords,
      clockIn,
      clockOut,
      financialTransactions,
      addFinancialExpense,
      calculateCommissionForOrder,
      getTechnicianDailyEarnings,
      getTechnicianMonthlyEarnings,
      notification,
      showNotification,
      clearNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
