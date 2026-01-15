
import React, { useState, useEffect } from 'react';
import { AppView, Unit, Resident, Payment, MaintenanceRequest } from '../types';
import { Users, Building, AlertCircle, DollarSign, ArrowUpRight, CheckCircle2, Wallet, TrendingDown, Home } from 'lucide-react';

interface Props {
  setActiveView: (view: AppView) => void;
}

const Dashboard: React.FC<Props> = ({ setActiveView }) => {
  const [data, setData] = useState({
    units: [] as Unit[],
    residents: [] as Resident[],
    payments: [] as Payment[],
    maintenance: [] as MaintenanceRequest[]
  });

  useEffect(() => {
    const units = JSON.parse(localStorage.getItem('villa_los_angeles_units') || '[]');
    const residents = JSON.parse(localStorage.getItem('villa_los_angeles_residents') || '[]');
    const payments = JSON.parse(localStorage.getItem('villa_los_angeles_payments') || '[]');
    const maintenance = JSON.parse(localStorage.getItem('villa_los_angeles_maintenance') || '[]');

    setData({ units, residents, payments, maintenance });
  }, []);

  const totalIncome = data.payments
    .filter(p => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDebt = data.payments
    .reduce((acc, curr) => acc + curr.balance, 0);

  const totalExpenses = data.maintenance
    .reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const pendingPayments = data.payments.filter(p => p.status !== 'paid' || p.balance > 0);

  const stats = [
    { id: AppView.UNITS, label: 'Villas Registradas', value: data.units.length.toString(), icon: Home, color: 'bg-indigo-600' },
    { id: AppView.PAYMENTS, label: 'Recaudado', value: `$${totalIncome.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
    { id: AppView.MAINTENANCE, label: 'Gastos Mtto.', value: `$${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: 'bg-rose-500' },
    { id: AppView.PAYMENTS, label: 'Deuda Total', value: `$${totalDebt.toLocaleString()}`, icon: Wallet, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => stat.id && setActiveView(stat.id)}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{stat.label}</p>
                <h3 className="text-2xl font-black mt-2 text-gray-800">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-opacity-20`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              <ArrowUpRight size={14} className="mr-1 text-emerald-500" />
              <span>Sincronizado</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-black text-gray-800 tracking-tight">Cuentas por Cobrar (Top 5)</h3>
            <button onClick={() => setActiveView(AppView.PAYMENTS)} className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Ver Todos</button>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {pendingPayments.length > 0 ? pendingPayments.slice(0, 5).map(payment => (
              <div key={payment.id} className="p-5 flex items-center hover:bg-indigo-50/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center font-black text-indigo-600 mr-4 text-xs">
                  {payment.unit.substring(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{payment.resident}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{payment.unit}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Saldo</p>
                  <p className="font-black text-rose-600 text-lg">${payment.balance.toFixed(2)}</p>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-gray-800">Cartera Limpia</h4>
                <p className="text-gray-400 text-sm mt-1">No hay pagos pendientes en este momento.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-black text-gray-800 mb-6 tracking-tight">Estado Operativo</h3>
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50 rounded-2xl flex justify-between items-center border border-emerald-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                    <ArrowUpRight size={16} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Ingresos</span>
                </div>
                <span className="text-lg font-black text-emerald-900">${totalIncome.toLocaleString()}</span>
              </div>
              <div className="p-5 bg-rose-50 rounded-2xl flex justify-between items-center border border-rose-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
                    <TrendingDown size={16} />
                  </div>
                  <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Gastos</span>
                </div>
                <span className="text-lg font-black text-rose-900">${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="p-6 bg-indigo-600 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-xl shadow-indigo-100 mt-6">
                <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-2">Liquidez Disponible</span>
                <span className="text-3xl font-black text-white">${(totalIncome - totalExpenses).toLocaleString()}</span>
                <div className="w-full h-1 bg-white/20 rounded-full mt-6 overflow-hidden">
                   <div 
                    className="h-full bg-white transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (totalIncome / (totalIncome + totalDebt || 1)) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[9px] mt-2 font-bold text-indigo-100 uppercase tracking-widest">Cobranza al {((totalIncome / (totalIncome + totalDebt || 1)) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
