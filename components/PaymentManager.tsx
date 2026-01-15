
import React, { useState, useEffect } from 'react';
import { Payment, Unit } from '../types';
import { 
  Search, 
  Download, 
  DollarSign, 
  Plus, 
  TrendingUp, 
  Pencil, 
  X, 
  CheckCircle2, 
  Wallet, 
  Calculator,
  Building2,
  User,
  ArrowUpRight,
  AlertCircle,
  Trash2
} from 'lucide-react';

const PAYMENTS_STORAGE_KEY = 'villa_los_angeles_payments';
const UNITS_STORAGE_KEY = 'villa_los_angeles_units';

const PaymentManager: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', unit: 'Villa Paraíso', resident: 'Carlos Mendez', amount: 350.00, balance: 0, date: '2024-03-10', status: 'paid', concept: 'Mantenimiento Mar 2024' },
      { id: '2', unit: 'Villa Sol', resident: 'Sin Propietario', amount: 350.00, balance: 350.00, date: '2024-03-20', status: 'pending', concept: 'Mantenimiento Mar 2024' },
      { id: '3', unit: 'Villa Luna', resident: 'Ana Garcia', amount: 350.00, balance: 0, date: '2024-03-05', status: 'paid', concept: 'Mantenimiento Mar 2024' },
    ];
  });

  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Registro actualizado');
  const [searchTerm, setSearchTerm] = useState('');

  const [newPayment, setNewPayment] = useState<Omit<Payment, 'id'>>({
    unit: '',
    resident: '',
    amount: 350,
    balance: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    concept: `Mantenimiento ${new Date().toLocaleString('es-ES', { month: 'short', year: 'numeric' })}`
  });

  useEffect(() => {
    const savedUnits = localStorage.getItem(UNITS_STORAGE_KEY);
    if (savedUnits) {
      setAvailableUnits(JSON.parse(savedUnits));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  }, [payments]);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUnitChange = (unitName: string, isEdit: boolean) => {
    const selectedUnit = availableUnits.find(u => u.name === unitName);
    const owner = selectedUnit ? selectedUnit.owner : 'Sin Propietario';
    
    if (isEdit && editingPayment) {
      setEditingPayment({ ...editingPayment, unit: unitName, resident: owner });
    } else {
      setNewPayment({ ...newPayment, unit: unitName, resident: owner });
    }
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.unit) return;

    const paymentToAdd: Payment = {
      ...newPayment,
      id: Date.now().toString()
    };
    
    setPayments([paymentToAdd, ...payments]);
    setIsAdding(false);
    setNewPayment({
      unit: '',
      resident: '',
      amount: 350,
      balance: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      concept: `Mantenimiento ${new Date().toLocaleString('es-ES', { month: 'short', year: 'numeric' })}`
    });
    triggerToast('Pago registrado correctamente');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPayment) {
      setPayments(payments.map(p => p.id === editingPayment.id ? editingPayment : p));
      setEditingPayment(null);
      triggerToast('Pago actualizado correctamente');
    }
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de pago?')) {
      setPayments(prev => prev.filter(p => p.id !== id));
      if (editingPayment?.id === id) setEditingPayment(null);
      triggerToast('Pago eliminado con éxito');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.unit.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.concept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = payments.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="space-y-8 relative">
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-white text-indigo-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-indigo-100 ring-1 ring-indigo-50">
            <CheckCircle2 className="text-emerald-500" size={24} />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recaudado</p>
            <h4 className="text-2xl font-black text-gray-800">${totalCollected.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4 text-rose-600">
          <div className="p-4 bg-rose-50 rounded-2xl"><Wallet size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1">Por Cobrar</p>
            <h4 className="text-2xl font-black">${totalPending.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl text-white flex items-center space-x-4 shadow-xl shadow-indigo-100">
          <div className="p-4 bg-indigo-500 rounded-2xl"><Calculator size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Registros</p>
            <h4 className="text-2xl font-black">{payments.length}</h4>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por villa, propietario o concepto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 font-bold text-sm"
        >
          <Plus size={18} />
          <span>Registrar Pago</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Unidad</th>
                <th className="px-8 py-5">Propietario</th>
                <th className="px-8 py-5">Concepto</th>
                <th className="px-8 py-5 text-right">Monto</th>
                <th className="px-8 py-5 text-right">Saldo</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                        {payment.unit.substring(0, 3)}
                      </div>
                      <span className="font-black text-gray-800 text-sm">{payment.unit}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-600">{payment.resident}</td>
                  <td className="px-8 py-5 text-xs text-gray-500">{payment.concept}</td>
                  <td className="px-8 py-5 text-right font-black text-gray-800 text-sm">${payment.amount.toFixed(2)}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`font-black text-sm ${payment.balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      ${payment.balance.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      payment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {payment.status === 'paid' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'Atrasado'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setEditingPayment(payment)}
                        className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-indigo-100 shadow-sm"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-white rounded-xl border border-transparent hover:border-rose-100 shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(isAdding || editingPayment) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/10 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-indigo-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm"><DollarSign size={20} /></div>
                <h3 className="text-lg font-black text-gray-800 tracking-tight">
                  {isAdding ? 'Registrar Pago' : 'Editar Registro'}
                </h3>
              </div>
              <button onClick={() => { setIsAdding(false); setEditingPayment(null); }} className="p-2.5 hover:bg-gray-200 rounded-2xl text-gray-400"><X size={20} /></button>
            </div>

            <form onSubmit={isAdding ? handleAddPayment : handleSaveEdit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">VILLA / UNIDAD</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <select 
                    required
                    value={isAdding ? newPayment.unit : editingPayment?.unit}
                    onChange={(e) => handleUnitChange(e.target.value, !isAdding)}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800 font-bold text-sm appearance-none"
                  >
                    <option value="" disabled>Seleccionar Villa...</option>
                    {availableUnits.map(unit => (
                      <option key={unit.id} value={unit.name}>{unit.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PROPIETARIO</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input 
                    type="text" 
                    readOnly
                    value={isAdding ? newPayment.resident : editingPayment?.resident}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 text-gray-500 font-bold text-sm outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CONCEPTO</label>
                <input 
                  type="text" required
                  value={isAdding ? newPayment.concept : editingPayment?.concept}
                  onChange={(e) => isAdding 
                    ? setNewPayment({...newPayment, concept: e.target.value}) 
                    : setEditingPayment({...editingPayment!, concept: e.target.value})}
                  className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MONTO ($)</label>
                  <input 
                    type="number" step="0.01" required
                    value={isAdding ? newPayment.amount : editingPayment?.amount}
                    onChange={(e) => isAdding 
                      ? setNewPayment({...newPayment, amount: parseFloat(e.target.value)}) 
                      : setEditingPayment({...editingPayment!, amount: parseFloat(e.target.value)})}
                    className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SALDO ($)</label>
                  <input 
                    type="number" step="0.01" required
                    value={isAdding ? newPayment.balance : editingPayment?.balance}
                    onChange={(e) => isAdding 
                      ? setNewPayment({...newPayment, balance: parseFloat(e.target.value)}) 
                      : setEditingPayment({...editingPayment!, balance: parseFloat(e.target.value)})}
                    className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-sm"
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col space-y-3">
                <div className="flex space-x-3">
                  <button type="button" onClick={() => { setIsAdding(false); setEditingPayment(null); }} className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-sm flex items-center justify-center space-x-2">
                    <ArrowUpRight size={18} />
                    <span>{isAdding ? 'Registrar' : 'Guardar'}</span>
                  </button>
                </div>
                {!isAdding && editingPayment && (
                  <button 
                    type="button"
                    onClick={() => handleDeletePayment(editingPayment.id)}
                    className="w-full py-3 flex items-center justify-center space-x-2 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-xs"
                  >
                    <Trash2 size={16} />
                    <span>Eliminar Registro</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManager;
