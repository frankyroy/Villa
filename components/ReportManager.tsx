
import React, { useState, useEffect } from 'react';
import { Unit, Resident, Payment, MaintenanceRequest } from '../types';
import { 
  Share2 as ShareIcon, 
  Copy as CopyIcon, 
  CheckCircle2 as CheckIcon, 
  FileText as FileIcon, 
  TrendingUp as TrendingIcon, 
  Users as UsersIcon, 
  Building as BuildingIcon, 
  Wrench as WrenchIcon,
  LayoutList as ListIcon,
  ArrowRight as ArrowIcon,
  UserCheck as UserCheckIcon,
  DollarSign as DollarIcon,
  Clock as ClockIcon,
  AlertTriangle as AlertIcon
} from 'lucide-react';

interface DebtInfo {
  unit: string;
  resident: string;
  balance: number;
}

const ReportManager: React.FC = () => {
  const [data, setData] = useState({
    units: [] as Unit[],
    residents: [] as Resident[],
    payments: [] as Payment[],
    maintenance: [] as MaintenanceRequest[]
  });
  const [isCopying, setIsCopying] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const units = JSON.parse(localStorage.getItem('villa_los_angeles_units') || '[]');
    const residents = JSON.parse(localStorage.getItem('villa_los_angeles_residents') || '[]');
    const payments = JSON.parse(localStorage.getItem('villa_los_angeles_payments') || '[]');
    const maintenance = JSON.parse(localStorage.getItem('villa_los_angeles_maintenance') || '[]');
    setData({ units, residents, payments, maintenance });
  }, []);

  const totalIncome = data.payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalDebt = data.payments.reduce((acc, curr) => acc + curr.balance, 0);
  
  // Gastos
  const totalCompletedExpenses = data.maintenance
    .filter(m => m.status === 'completed')
    .reduce((acc, curr) => acc + (curr.cost || 0), 0);
  
  const totalPendingExpenses = data.maintenance
    .filter(m => m.status !== 'completed')
    .reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const netBalance = totalIncome - totalCompletedExpenses;
  const recoveryRate = (totalIncome + totalDebt) > 0 ? (totalIncome / (totalIncome + totalDebt)) * 100 : 0;

  const occupiedUnits = data.units.filter(u => u.status === 'occupied').length;
  const occupancyRate = data.units.length > 0 ? (occupiedUnits / data.units.length) * 100 : 0;
  const pendingMaintenanceCount = data.maintenance.filter(m => m.status === 'pending').length;

  const debtByResident = data.payments.reduce((acc, curr) => {
    if (curr.balance > 0) {
      const key = `${curr.unit}-${curr.resident}`;
      if (!acc[key]) {
        acc[key] = { unit: curr.unit, resident: curr.resident, balance: 0 };
      }
      acc[key].balance += curr.balance;
    }
    return acc;
  }, {} as Record<string, DebtInfo>);

  const debtList = (Object.values(debtByResident) as DebtInfo[]).sort((a, b) => b.balance - a.balance);

  const generateTextReport = () => {
    const today = new Date().toLocaleDateString();
    let report = `🏠 VILLA LOS ÁNGELES - BALANCE GENERAL OPERATIVO
Fecha de emisión: ${today}

💰 BALANCE FINANCIERO
- Total Recaudado (Ingresos): $${totalIncome.toLocaleString()}
- Gastos Ejecutados (Pagados): $${totalCompletedExpenses.toLocaleString()}
- Gastos en Proceso (Pendientes): $${totalPendingExpenses.toLocaleString()}
- Saldo Operativo Neto Real: $${netBalance.toLocaleString()}
- Cartera Vencida (Deuda): $${totalDebt.toLocaleString()}
- Eficiencia de Cobro: ${recoveryRate.toFixed(1)}%

👤 DETALLE DE DEUDA POR RESIDENTE:
------------------------------------------
${debtList.length > 0 
  ? debtList.map((d: DebtInfo) => `• Unidad ${d.unit} | ${d.resident}: $${d.balance.toLocaleString()}`).join('\n')
  : '✅ No se registran deudas pendientes.'}
------------------------------------------

🛠️ RESUMEN DE MANTENIMIENTO
- Inversión Ejecutada: $${totalCompletedExpenses.toLocaleString()}
- Inversión Proyectada: $${totalPendingExpenses.toLocaleString()}
- Tareas Pendientes/En Curso: ${data.maintenance.filter(m => m.status !== 'completed').length}

📊 ESTADO DEL CONDOMINIO
- Ocupación: ${occupancyRate.toFixed(0)}%
- Población: ${data.residents.length} Residentes

Generado por la Administración Villa Los Ángeles.`;
    return report;
  };

  const handleShare = async () => {
    const reportText = generateTextReport();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Balance Villa Los Ángeles', text: reportText });
      } catch (err) { console.error(err); }
    } else { handleCopy(); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTextReport());
    setIsCopying(true);
    setShowToast(true);
    setTimeout(() => { setIsCopying(false); setShowToast(false); }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Updated Toast Style to Light Theme */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-5">
          <div className="bg-white text-indigo-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-indigo-100 ring-1 ring-indigo-50">
            <CheckIcon className="text-emerald-500" size={24} />
            <span className="text-sm font-bold">Reporte copiado al portapapeles</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reporte de Egresos y Mantenimiento</h2>
          <p className="text-gray-500">Consolidado de gastos ejecutados vs proyectados</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button onClick={handleCopy} className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-semibold shadow-sm">
            <CopyIcon size={18} />
            <span>{isCopying ? 'Copiado' : 'Copiar'}</span>
          </button>
          <button onClick={handleShare} className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 active:scale-95">
            <ShareIcon size={18} />
            <span>Compartir Reporte</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase">Ingresos Reales</p>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingIcon size={14} /></div>
          </div>
          <p className="text-2xl font-black text-emerald-600">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase">Gasto Ejecutado</p>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><CheckIcon size={14} /></div>
          </div>
          <p className="text-2xl font-black text-rose-600">${totalCompletedExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm ring-2 ring-indigo-50 ring-inset">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-indigo-400 uppercase">Saldo en Caja</p>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><DollarIcon size={14} /></div>
          </div>
          <p className={`text-2xl font-black ${netBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            ${netBalance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <WrenchIcon size={20} className="text-indigo-600" />
              <span>Desglose de Mantenimiento</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckIcon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Gasto Finalizado</p>
                    <p className="text-sm font-black text-gray-800">Trabajos concluidos</p>
                  </div>
                </div>
                <p className="text-lg font-black text-green-600">${totalCompletedExpenses.toLocaleString()}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <ClockIcon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Gasto Proyectado</p>
                    <p className="text-sm font-black text-gray-800">En curso o pendientes</p>
                  </div>
                </div>
                <p className="text-lg font-black text-amber-600">${totalPendingExpenses.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Inversión Total Acumulada:</span>
                <span className="font-black text-gray-800">${(totalCompletedExpenses + totalPendingExpenses).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                <AlertIcon size={20} className="text-rose-600" />
                <span>Cuentas por Cobrar</span>
              </h3>
              <span className="text-xs font-black text-rose-600 px-3 py-1 bg-rose-50 rounded-full">
                ${totalDebt.toLocaleString()}
              </span>
            </div>
            <div className="overflow-y-auto max-h-[200px] space-y-3 pr-2 scrollbar-hide">
              {debtList.length > 0 ? debtList.map((debt, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white border rounded-lg flex items-center justify-center font-bold text-xs text-indigo-600">U-{debt.unit}</div>
                    <p className="text-xs font-bold text-gray-800 truncate">{debt.resident}</p>
                  </div>
                  <p className="text-sm font-black text-rose-600">${debt.balance.toLocaleString()}</p>
                </div>
              )) : (
                <p className="text-center text-gray-400 py-8 text-sm italic">No hay deudas pendientes</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center space-x-3">
              <FileIcon className="text-indigo-600" size={20} />
              <h3 className="font-bold text-gray-800">Vista Previa del Reporte</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Formato Texto</span>
          </div>
          {/* Changed Background from bg-gray-900 (dark) to a light, elegant paper style */}
          <div className="p-8 bg-indigo-50/20 flex-1 min-h-[400px] border-l border-gray-50">
            <pre className="text-gray-700 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
              {generateTextReport()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManager;
