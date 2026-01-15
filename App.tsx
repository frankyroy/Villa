
import React, { useState } from 'react';
import { 
  Home, 
  Building2, 
  CreditCard,
  Wrench,
  ChevronRight,
  Menu,
  X,
  Plus,
  FileBarChart
} from 'lucide-react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import UnitManager from './components/UnitManager';
import PaymentManager from './components/PaymentManager';
import MaintenanceManager from './components/MaintenanceManager';
import ReportManager from './components/ReportManager';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: AppView.DASHBOARD, icon: Home, label: 'Resumen' },
    { id: AppView.UNITS, icon: Building2, label: 'Unidades' },
    { id: AppView.PAYMENTS, icon: CreditCard, label: 'Pagos' },
    { id: AppView.MAINTENANCE, icon: Wrench, label: 'Mantenimiento' },
    { id: AppView.REPORTS, icon: FileBarChart, label: 'Reporte' },
  ];

  const renderView = () => {
    switch (activeView) {
      case AppView.DASHBOARD: return <Dashboard setActiveView={setActiveView} />;
      case AppView.UNITS: return <UnitManager />;
      case AppView.PAYMENTS: return <PaymentManager />;
      case AppView.MAINTENANCE: return <MaintenanceManager />;
      case AppView.REPORTS: return <ReportManager />;
      default: return <Dashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col z-20`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-800">Villa Los Ángeles</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as AppView)}
              className={`w-full flex items-center p-3 rounded-xl transition-colors ${
                activeView === item.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              {activeView === item.id && isSidebarOpen && <ChevronRight className="ml-auto w-4 h-4" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <img src="https://picsum.photos/seed/admin/40/40" className="w-10 h-10 rounded-full border border-gray-200" alt="Admin" />
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-800 truncate">Administrador</p>
                <p className="text-xs text-gray-500 truncate">villa@losangeles.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-bold text-gray-800">
            {navItems.find(i => i.id === activeView)?.label}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Plus size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
