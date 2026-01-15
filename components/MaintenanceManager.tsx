
import React, { useState, useEffect } from 'react';
import { MaintenanceRequest } from '../types';
import { Search, Filter, Plus, Wrench, AlertTriangle, CheckCircle2, Clock, Pencil, X, DollarSign, Trash2, Calendar } from 'lucide-react';

const MAINTENANCE_STORAGE_KEY = 'villa_los_angeles_maintenance';

const MaintenanceManager: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(() => {
    const saved = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', unit: '101', description: 'Fuga de agua en baño principal', priority: 'high', status: 'pending', date: '2024-03-14', category: 'Plomería', cost: 45.00 },
      { id: '2', unit: '304', description: 'Falla en timbre y citófono', priority: 'medium', status: 'in_progress', date: '2024-03-13', category: 'Eléctrico', cost: 120.00 },
      { id: '3', unit: 'Gimnasio', description: 'Mantenimiento preventivo caminadoras', priority: 'low', status: 'completed', date: '2024-03-10', category: 'General', cost: 250.00 },
      { id: '4', unit: '502', description: 'Humedad en techo de recámara', priority: 'high', status: 'pending', date: '2024-03-15', category: 'Estructural', cost: 0 },
    ];
  });

  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Reporte actualizado con éxito');
  const [newRequest, setNewRequest] = useState<Omit<MaintenanceRequest, 'id' | 'date' | 'status'>>({
    unit: '',
    description: '',
    priority: 'medium',
    category: 'General',
    cost: 0
  });

  useEffect(() => {
    localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRequest) {
      setRequests(requests.map(r => r.id === editingRequest.id ? editingRequest : r));
      setEditingRequest(null);
      triggerToast('Reporte actualizado con éxito');
    }
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.unit || !newRequest.description) return;

    const requestToAdd: MaintenanceRequest = {
      ...newRequest,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setRequests([requestToAdd, ...requests]);
    setIsAdding(false);
    setNewRequest({ unit: '', description: '', priority: 'medium', category: 'General', cost: 0 });
    triggerToast('Nuevo reporte creado correctamente');
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este reporte de mantenimiento? Esta acción no se puede deshacer.')) {
      setRequests(requests.filter(r => r.id !== id));
      triggerToast('Reporte eliminado con éxito');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle size={14} className="mr-1" />;
      case 'in_progress': return <Clock size={14} className="mr-1" />;
      case 'completed': return <CheckCircle2 size={14} className="mr-1" />;
      default: return null;
    }
  };

  const totalExpenses = requests.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const stats = [
    { label: 'Pendientes', value: requests.filter(r => r.status === 'pending').length.toString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'En Curso', value: requests.filter(r => r.status === 'in_progress').length.toString(), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Gasto Total', value: `$${totalExpenses.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification - Updated to light theme */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-white text-indigo-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-indigo-100 ring-1 ring-indigo-50">
            <CheckCircle2 className="text-emerald-500" size={24} />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h4 className="text-xl font-bold">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por unidad, categoría o descripción..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-white text-gray-800"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
            <Filter size={18} />
            <span>Filtrar</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 font-semibold"
          >
            <Plus size={18} />
            <span>Nuevo Reporte</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {requests.map((request) => (
          <div key={request.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Unidad {request.unit}</h3>
                  <p className="text-xs text-gray-500">{request.date} • {request.category}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getPriorityColor(request.priority)}`}>
                {request.priority === 'high' ? 'Alta' : request.priority === 'medium' ? 'Media' : 'Baja'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed min-h-[40px]">
              {request.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${
                request.status === 'completed' ? 'text-green-600 bg-green-50' :
                request.status === 'in_progress' ? 'text-blue-600 bg-blue-50' :
                'text-red-600 bg-red-50'
              }`}>
                {getStatusIcon(request.status)}
                <span className="uppercase">
                  {request.status === 'completed' ? 'Finalizado' : request.status === 'in_progress' ? 'En Proceso' : 'Pendiente'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right mr-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gasto</p>
                  <p className="text-sm font-black text-gray-800">${(request.cost || 0).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setEditingRequest(request)}
                    className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="Editar reporte"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteRequest(request.id)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title="Eliminar reporte"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-gray-300" />
            </div>
            <h3 className="text-gray-500 font-medium">No hay reportes de mantenimiento</h3>
            <p className="text-gray-400 text-sm">Todo parece estar en orden en Villa Los Ángeles.</p>
          </div>
        )}
      </div>

      {/* Modal - Updated Backdrop */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/10 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-indigo-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Plus size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Nuevo Reporte</h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddRequest} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Unidad / Área</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. 104"
                    value={newRequest.unit}
                    onChange={(e) => setNewRequest({...newRequest, unit: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Gasto Est. ($)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newRequest.cost}
                    onChange={(e) => setNewRequest({...newRequest, cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
                <select 
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800"
                >
                  <option value="Plomería">Plomería</option>
                  <option value="Eléctrico">Eléctrico</option>
                  <option value="Estructural">Estructural</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
                <textarea 
                  required
                  placeholder="Describe detalladamente..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white text-gray-800"
                />
              </div>
              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 text-sm">Crear Reporte</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Updated Backdrop */}
      {editingRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/10 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-indigo-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Actualizar Reporte</h3>
              <button onClick={() => setEditingRequest(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Costo Real ($)</label>
                  <input 
                    type="number" 
                    value={editingRequest.cost}
                    onChange={(e) => setEditingRequest({...editingRequest, cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
                  <select 
                    value={editingRequest.status}
                    onChange={(e) => setEditingRequest({...editingRequest, status: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Proceso</option>
                    <option value="completed">Finalizado</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Fecha del Reporte</label>
                <input 
                  type="date" 
                  value={editingRequest.date}
                  onChange={(e) => setEditingRequest({...editingRequest, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
                <textarea 
                  value={editingRequest.description}
                  onChange={(e) => setEditingRequest({...editingRequest, description: e.target.value})}
                  className="w-full h-24 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white text-gray-800"
                />
              </div>
              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={() => setEditingRequest(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManager;
