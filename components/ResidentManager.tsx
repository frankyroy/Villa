
import React, { useState, useEffect } from 'react';
import { Resident } from '../types';
import { Search, Plus, Mail, Phone, Pencil, X, CheckCircle2, UserPlus, Users, Home } from 'lucide-react';

const RESIDENTS_STORAGE_KEY = 'villa_los_angeles_residents';

const ResidentManager: React.FC = () => {
  // Cargar datos de localStorage o usar iniciales
  const [residents, setResidents] = useState<Resident[]>(() => {
    const saved = localStorage.getItem(RESIDENTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Carlos Mendez', unit: 'Villa Paraíso', phone: '+52 55 1234 5678', email: 'carlos@email.com' },
      { id: '2', name: 'Ana Garcia', unit: 'Villa Luna', phone: '+52 55 8765 4321', email: 'ana@email.com' },
      { id: '3', name: 'Roberto Diaz', unit: 'Villa Estelar', phone: '+52 55 4444 3333', email: 'roberto@email.com' },
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [newResident, setNewResident] = useState<Omit<Resident, 'id'>>({
    name: '',
    unit: '',
    phone: '',
    email: ''
  });

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem(RESIDENTS_STORAGE_KEY, JSON.stringify(residents));
  }, [residents]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResident) {
      setResidents(residents.map(r => r.id === editingResident.id ? editingResident : r));
      setEditingResident(null);
      triggerToast();
    }
  };

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.name || !newResident.unit) return;

    const residentToAdd: Resident = {
      ...newResident,
      id: Date.now().toString()
    };

    setResidents([...residents, residentToAdd]);
    setIsAdding(false);
    setNewResident({ name: '', unit: '', phone: '', email: '' });
    triggerToast();
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative pb-10">
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-white text-indigo-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-indigo-100 ring-1 ring-indigo-50">
            <CheckCircle2 className="text-emerald-500" size={24} />
            <span className="text-sm font-bold">Registro de residente actualizado</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o villa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-sm"
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 font-semibold text-sm"
        >
          <Plus size={18} />
          <span>Nuevo Residente</span>
        </button>
      </div>

      {filteredResidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Users className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-500 font-bold">No se encontraron residentes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResidents.map((resident) => (
            <div key={resident.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100 shadow-sm">
                  {resident.name.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={() => setEditingResident(resident)}
                  className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-indigo-100"
                >
                  <Pencil size={18} />
                </button>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-black text-gray-800 text-lg leading-tight tracking-tight">{resident.name}</h3>
                <div className="flex items-center text-indigo-600 font-bold text-xs uppercase tracking-widest bg-indigo-50/50 w-fit px-2 py-0.5 rounded-lg">
                  <Home size={10} className="mr-1.5" />
                  <span>{resident.unit}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-500 font-medium bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <Phone size={14} className="mr-3 text-indigo-400" />
                  <span className="truncate">{resident.phone || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 font-medium bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <Mail size={14} className="mr-3 text-indigo-400" />
                  <span className="truncate">{resident.email || 'Sin correo'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex space-x-2">
                <button className="flex-1 py-2.5 bg-gray-50 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors">
                  Expediente
                </button>
                <button className="flex-1 py-2.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-colors">
                  Contactar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Registro/Edición */}
      {(isAdding || editingResident) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/10 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-indigo-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">
                    {isAdding ? 'Nuevo Residente' : 'Editar Perfil'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Información de contacto y ubicación</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsAdding(false); setEditingResident(null); }}
                className="p-2.5 hover:bg-gray-200 rounded-2xl text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form 
              onSubmit={isAdding ? handleAddResident : handleSaveEdit} 
              className="p-8 space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Ana María Silva"
                  value={isAdding ? newResident.name : editingResident?.name}
                  onChange={(e) => isAdding 
                    ? setNewResident({...newResident, name: e.target.value}) 
                    : setEditingResident({...editingResident!, name: e.target.value})}
                  className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-gray-800 font-bold"
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre de la Villa</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Villa Esmeralda"
                    value={isAdding ? newResident.unit : editingResident?.unit}
                    onChange={(e) => isAdding 
                      ? setNewResident({...newResident, unit: e.target.value}) 
                      : setEditingResident({...editingResident!, unit: e.target.value})}
                    className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-gray-800 font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
                  <input 
                    type="tel" 
                    placeholder="+52..."
                    value={isAdding ? newResident.phone : editingResident?.phone}
                    onChange={(e) => isAdding 
                      ? setNewResident({...newResident, phone: e.target.value}) 
                      : setEditingResident({...editingResident!, phone: e.target.value})}
                    className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-gray-800 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correo</label>
                  <input 
                    type="email" 
                    placeholder="ana@villa.com"
                    value={isAdding ? newResident.email : editingResident?.email}
                    onChange={(e) => isAdding 
                      ? setNewResident({...newResident, email: e.target.value}) 
                      : setEditingResident({...editingResident!, email: e.target.value})}
                    className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-gray-800 font-bold"
                  />
                </div>
              </div>
              <div className="pt-6 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingResident(null); }}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                >
                  Descartar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-sm active:scale-95"
                >
                  {isAdding ? 'Registrar' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentManager;
