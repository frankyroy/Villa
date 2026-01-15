import React, { useState, useEffect, useRef } from 'react';
import { Unit } from '../types';
import { 
  Search, 
  Plus, 
  Pencil, 
  X, 
  CheckCircle2, 
  Camera, 
  LayoutGrid,
  List,
  User,
  AlertCircle,
  Home,
  Tag,
  Upload,
  RotateCcw,
  Phone
} from 'lucide-react';

const STORAGE_KEY = 'villa_los_angeles_units';

const UnitManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraMode, setCameraMode] = useState<'add' | 'edit'>('add');
  
  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Villa Paraíso', number: '101', floor: 1, owner: 'Carlos Mendez', ownerPhone: '+52 55 1122 3344', status: 'occupied', imageUrl: '' },
      { id: '2', name: 'Villa Sol', number: '102', floor: 1, owner: 'Sin Propietario', ownerPhone: '', status: 'vacant', imageUrl: '' },
      { id: '3', name: 'Villa Luna', number: '201', floor: 2, owner: 'Ana Garcia', ownerPhone: '+52 55 5566 7788', status: 'occupied', imageUrl: '' },
      { id: '4', name: 'Villa Estelar', number: '202', floor: 2, owner: 'Roberto Diaz', ownerPhone: '+52 55 9900 1122', status: 'maintenance', imageUrl: '' },
    ];
  });

  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [newUnit, setNewUnit] = useState<Omit<Unit, 'id'>>({
    name: '',
    number: '',
    floor: 1,
    owner: '',
    ownerPhone: '',
    status: 'vacant',
    imageUrl: ''
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
  }, [units]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit && editingUnit) {
          setEditingUnit({ ...editingUnit, imageUrl: base64String });
        } else {
          setNewUnit({ ...newUnit, imageUrl: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? editingUnit : u));
      setEditingUnit(null);
      triggerToast();
    }
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.name) return;

    const unitToAdd: Unit = {
      ...newUnit,
      id: Date.now().toString()
    };
    
    setUnits([...units, unitToAdd]);
    setIsAdding(false);
    setNewUnit({ name: '', number: '', floor: 1, owner: '', ownerPhone: '', status: 'vacant', imageUrl: '' });
    triggerToast();
  };

  const removePhoto = (isEdit: boolean) => {
    if (isEdit && editingUnit) {
      setEditingUnit({ ...editingUnit, imageUrl: '' });
    } else {
      setNewUnit({ ...newUnit, imageUrl: '' });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCamera = async (mode: 'add' | 'edit') => {
    setCameraMode(mode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No se pudo acceder a la cámara. Por favor asegura los permisos.");
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (cameraMode === 'edit' && editingUnit) {
          setEditingUnit({ ...editingUnit, imageUrl: dataUrl });
        } else {
          setNewUnit({ ...newUnit, imageUrl: dataUrl });
        }
        closeCamera();
      }
    }
  };

  const filteredUnits = units.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.owner && u.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.number && u.number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const StatusBadge = ({ status }: { status: Unit['status'] }) => {
    const styles = {
      occupied: 'bg-emerald-100 text-emerald-700',
      vacant: 'bg-gray-100 text-gray-600',
      maintenance: 'bg-amber-100 text-amber-700'
    };
    const labels = {
      occupied: 'Ocupado',
      vacant: 'Disponible',
      maintenance: 'Mantenimiento'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6 relative pb-10">
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-white text-indigo-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-indigo-100 ring-1 ring-indigo-50">
            <CheckCircle2 className="text-emerald-500" size={24} />
            <span className="text-sm font-bold">Cambios guardados con éxito</span>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-fit max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Cámara en Vivo</h3>
                <p className="text-xs text-gray-500 font-medium">Captura la mejor vista de la villa</p>
              </div>
              <button onClick={closeCamera} className="p-3 hover:bg-gray-200 rounded-2xl text-gray-400 transition-all active:scale-90">
                <X size={24} />
              </button>
            </div>
            <div className="relative aspect-video bg-black overflow-hidden mx-6 my-4 rounded-[2rem] shadow-inner">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="p-8 flex justify-center items-center space-x-8">
              <button onClick={closeCamera} className="flex flex-col items-center space-y-2 group">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center group-hover:bg-gray-200 transition-all">
                  <X size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cancelar</span>
              </button>
              <button onClick={capturePhoto} className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-200 hover:scale-110 active:scale-95 transition-all border-[10px] border-indigo-50">
                <Camera size={36} />
              </button>
              <button onClick={() => openCamera(cameraMode)} className="flex flex-col items-center space-y-2 group">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center group-hover:bg-gray-200 transition-all">
                  <RotateCcw size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reiniciar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar villa o propietario..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-sm"
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 font-semibold text-sm"
        >
          <Plus size={18} />
          <span>Nueva Villa</span>
        </button>
      </div>

      {filteredUnits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <AlertCircle className="text-gray-300 mb-4" size={32} />
          <h3 className="text-gray-800 font-bold">No se encontraron villas</h3>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUnits.map((unit) => (
            <div key={unit.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="relative aspect-[4/3] bg-gray-50 shrink-0">
                {unit.imageUrl ? (
                  <img src={unit.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-indigo-100">
                    <Home size={64} />
                  </div>
                )}
                <div className="absolute top-4 left-4"><StatusBadge status={unit.status} /></div>
                <button 
                  onClick={() => setEditingUnit(unit)} 
                  className="absolute bottom-4 right-4 p-3 bg-white shadow-xl rounded-2xl text-indigo-600 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                >
                  <Pencil size={18} />
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-gray-800 tracking-tight">{unit.name}</h3>
                <div className="flex items-center text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                  <Tag size={10} className="mr-1" />ID: {unit.number || 'N/A'}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-2 text-indigo-600">
                      <User size={14} />
                    </div>
                    <p className="font-bold text-gray-700 truncate text-sm">{unit.owner || 'Pendiente'}</p>
                  </div>
                  {unit.ownerPhone && (
                    <div className="flex items-center text-gray-500 text-xs">
                      <Phone size={12} className="mr-2 text-gray-400" />
                      <span>{unit.ownerPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Villa / Foto</th>
                <th className="px-6 py-4">Propietario</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                        {unit.imageUrl ? <img src={unit.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-100"><Home size={16} /></div>}
                      </div>
                      <span className="font-black text-gray-800">{unit.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-bold">{unit.owner || '—'}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium text-xs">{unit.ownerPhone || '—'}</td>
                  <td className="px-6 py-4"><StatusBadge status={unit.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditingUnit(unit)} className="text-indigo-600 p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100">
                      <Pencil size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(isAdding || editingUnit) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/10 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-800 tracking-tight">{isAdding ? 'Nueva Villa' : `Editar Villa`}</h3>
              <button onClick={() => { setIsAdding(false); setEditingUnit(null); }} className="p-2.5 hover:bg-gray-200 rounded-2xl text-gray-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={isAdding ? handleAddUnit : handleSaveEdit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Imagen de la Villa</label>
                <div className="relative group h-40 border-2 border-dashed border-gray-200 rounded-[2rem] flex items-center justify-center overflow-hidden bg-gray-50/50">
                  {(isAdding ? newUnit.imageUrl : editingUnit?.imageUrl) ? (
                    <>
                      <img src={isAdding ? newUnit.imageUrl : editingUnit?.imageUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-3">
                        <div className="flex space-x-2">
                          <button type="button" onClick={() => openCamera(isAdding ? 'add' : 'edit')} className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"><Camera size={20} /></button>
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all shadow-lg"><Upload size={20} /></button>
                        </div>
                        <button type="button" onClick={() => removePhoto(!isAdding)} className="px-4 py-1.5 bg-rose-500 text-white text-[10px] font-bold uppercase rounded-xl transition-all shadow-lg">Eliminar</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex space-x-6">
                      <button type="button" onClick={() => openCamera(isAdding ? 'add' : 'edit')} className="flex flex-col items-center space-y-2 group/btn">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-400 group-hover/btn:text-indigo-600 transition-colors"><Camera size={24} /></div>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Tomar Foto</span>
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center space-y-2 group/btn">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-400 group-hover/btn:text-indigo-600 transition-colors"><Upload size={24} /></div>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Subir</span>
                      </button>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, !isAdding)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Villa</label>
                  <input 
                    type="text" required placeholder="Ej. Villa Luna" 
                    value={isAdding ? newUnit.name : editingUnit?.name} 
                    onChange={(e) => isAdding ? setNewUnit({...newUnit, name: e.target.value}) : setEditingUnit({...editingUnit!, name: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID / Número</label>
                  <input 
                    type="text" placeholder="101A" 
                    value={isAdding ? newUnit.number : editingUnit?.number} 
                    onChange={(e) => isAdding ? setNewUnit({...newUnit, number: e.target.value}) : setEditingUnit({...editingUnit!, number: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Propietario</label>
                <input 
                  type="text" placeholder="Nombre completo" 
                  value={isAdding ? newUnit.owner : editingUnit?.owner} 
                  onChange={(e) => isAdding ? setNewUnit({...newUnit, owner: e.target.value}) : setEditingUnit({...editingUnit!, owner: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-sm" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono Propietario</label>
                  <input 
                    type="tel" placeholder="+52 55..." 
                    value={isAdding ? newUnit.ownerPhone : editingUnit?.ownerPhone} 
                    onChange={(e) => isAdding ? setNewUnit({...newUnit, ownerPhone: e.target.value}) : setEditingUnit({...editingUnit!, ownerPhone: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado</label>
                  <select 
                    value={isAdding ? newUnit.status : editingUnit?.status} 
                    onChange={(e) => isAdding ? setNewUnit({...newUnit, status: e.target.value as any}) : setEditingUnit({...editingUnit!, status: e.target.value as any})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-sm"
                  >
                    <option value="occupied">Ocupado</option>
                    <option value="vacant">Disponible</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingUnit(null); }} className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 text-sm transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-sm transition-all active:scale-95">Guardar Villa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitManager;