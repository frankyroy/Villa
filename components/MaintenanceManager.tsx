
import React, { useState, useEffect } from 'react';
import { MaintenanceRequest } from '../types';
import { Search, Plus, Wrench, AlertTriangle, CheckCircle2, Clock, Pencil, X, DollarSign, Trash2, Building2, Tag, Calendar, ArrowUpRight } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para el formulario de nuevo reporte
  const [addForm, setAddForm] = useState<Omit<MaintenanceRequest, 'id' | 'date'>>({
    unit: '',
    description: '',
    priority: 'medium',
    status: 'pending',
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
      triggerToast('Reporte actualizado correctamente');
    }
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const requestToAdd: MaintenanceRequest = {
      ...addForm,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    setRequests([requestToAdd, ...requests]);
    setIsAdding(false);
    setAddForm({ unit: '', description: '', priority: 'medium', status: 'pending', category: 'General', cost: 0 });
    triggerToast('Nuevo reporte creado correctamente');
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      setRequests(requests.filter(r => r.id !== id));
      triggerToast('Reporte eliminado con éxito');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-700';
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

  const filteredRequests = requests.filter(r => 
    r.unit.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = requests.reduce((acc, curr) => acc + (curr.cost || 0), 0);

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pendientes</p>
            <h4 className="text-2xl font-black text-gray-800">{requests.filter(r => r.status === 'pending').length}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Clock size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">En Proceso</p>
            <h4 className="text-2xl font-black text-gray-800">{requests.filter(r => r.status === 'in_progress').length}</h4>
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100 flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-500"><DollarSign size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Inversión Total</p>
            <h4 className="text-2xl font-black">${totalExpenses.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por unidad, categoría o descripción..." 
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
          <span>Nuevo Reporte</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="font-black text-gray-800 tracking-tight text-lg">Unidad {request.unit}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{request.date}</span>
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">• {request.category}</span>
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getPriorityColor(request.priority)}`}>
                {request.priority === 'high' ? 'Alta' : request.priority === 'medium' ? 'Media' : 'Baja'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed flex-1 line-clamp-3">
              {request.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className={`flex items-center text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                request.status === 'completed' ? 'text-emerald-700 bg-emerald-100' :
                request.status === 'in_progress' ? 'text-indigo-700 bg-indigo-100' :
                'text-rose-700 bg-rose-100'
              }`}>
                {getStatusIcon(request.status)}
                <span>
                  {request.status === 'completed' ? 'Finalizado' : request.status === 'in_progress' ? 'En Proceso' : 'Pendiente'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Inversión</p>
                  <p className="text-sm font-black text-gray-800">${(request.cost || 0).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => setEditingRequest(request)}
                    className="p-2.5 text-indigo-600 bg-white hover:bg-indigo-50 border border-gray-100 rounded-xl transition-all shadow-sm"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteRequest(request.id)}
                    className="p-2.5 text-rose-600 bg-white hover:bg-rose-50 border border-gray-100 rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingRequest) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/10 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-indigo-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm">
                  <Wrench size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-800 tracking-tight">
                  {isAdding ? 'Nuevo Reporte' : 'Editar Reporte'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsAdding(false); setEditingRequest(null); }} 
                className="p-2.5 hover:bg-gray-200 rounded-2xl text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={isAdding ? submitAdd : handleSaveEdit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidad / Área</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input 
                      type="text" required
                      value={isAdding ? addForm.unit : editingRequest?.unit}
                      onChange={(e) => isAdding 
                        ? setAddForm({...addForm, unit: e.target.value}) 
                        : setEditingRequest({...editingRequest!, unit: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800 font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <select 
                      required
                      value={isAdding ? addForm.category : editingRequest?.category}
                      onChange={(e) => isAdding 
                        ? setAddForm({...addForm, category: e.target.value}) 
                        : setEditingRequest({...editingRequest!, category: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800 font-bold text-sm appearance-none"
                    >
                      <option value="Plomería">Plomería</option>
                      <option value="Eléctrico">Eléctrico</option>
                      <option value="Estructural">Estructural</option>
                      <option value="Jardinería">Jardinería</option>
                      <option value="Limpieza">Limpieza</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prioridad</label>
                  <select 
                    required
                    value={isAdding ? addForm.priority : editingRequest?.priority}
                    onChange={(e) => isAdding 
                      ? setAddForm({...addForm, priority: e.target.value as any}) 
                      : setEditingRequest({...editingRequest!, priority: e.target.value as any})}
                    className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800 font-bold text-sm appearance-none"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado</label>
                  <select 
                    required
                    value={isAdding ? addForm.status : editingRequest?.status}
                    onChange={(e) => isAdding 
                      ? setAddForm({...addForm, status: e.target.value as any}) 
                      : setEditingRequest({...editingRequest!, status: e.target.value as any})}
                    className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800 font-bold text-sm appearance-none"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Proceso</option>
                    <option value="completed">Finalizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inversión ($)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input 
                      type="number" step="0.01"
                      value={isAdding ? addForm.cost : editingRequest?.cost}
                      onChange={(e) => isAdding 
                        ? setAddForm({...addForm, cost: parseFloat(e.target.value) || 0}) 
                        : setEditingRequest({...editingRequest!, cost: parseFloat(e.target.value) || 0})}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800 font-bold text-sm"
                    />
                  </div>
                </div>
                {!isAdding && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input 
                        type="date"
                        value={editingRequest?.date}
                        onChange={(e) => setEditingRequest({...editingRequest!, date: e.target.value})}
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800 font-bold text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción del Problema</label>
                <textarea 
                  required
                  rows={3}
                  value={isAdding ? addForm.description : editingRequest?.description}
                  onChange={(e) => isAdding 
                    ? setAddForm({...addForm, description: e.target.value}) 
                    : setEditingRequest({...editingRequest!, description: e.target.value})}
                  className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800 font-bold text-sm resize-none"
                  placeholder="Detalla la incidencia aquí..."
                />
              </div>

              <div className="pt-6 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setIsAdding(false); setEditingRequest(null); }} 
                  className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <ArrowUpRight size={18} />
                  <span>{isAdding ? 'Registrar' : 'Guardar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManager;
