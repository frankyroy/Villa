
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  UNITS = 'UNITS',
  PAYMENTS = 'PAYMENTS',
  MAINTENANCE = 'MAINTENANCE',
  REPORTS = 'REPORTS'
}

export interface Unit {
  id: string;
  name: string; // Nombre de la villa
  number: string; // Identificador opcional
  floor: number;
  owner: string;
  ownerPhone?: string; // Teléfono del propietario
  status: 'occupied' | 'vacant' | 'maintenance';
  imageUrl?: string;
}

export interface Resident {
  id: string;
  name: string;
  unit: string;
  phone: string;
  email: string;
}

export interface Payment {
  id: string;
  unit: string;
  resident: string;
  amount: number;
  balance: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  concept: string;
}

export interface MaintenanceRequest {
  id: string;
  unit: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  date: string;
  category: string;
  cost: number;
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
