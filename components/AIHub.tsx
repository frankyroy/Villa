
import React, { useState, useRef } from 'react';
import { 
  Wand2, 
  Search, 
  Image as ImageIcon, 
  ScanSearch, 
  Send, 
  RefreshCw,
  Download,
  CheckCircle2,
  Link as LinkIcon
} from 'lucide-react';
import { GeminiService } from '../geminiService';

const AIHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'analyze' | 'search'>('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{text: string, sources: any[]} | null>(null);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valores oficiales soportados por Gemini 3 Image
  const aspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
  const sizes = ["1K", "2K", "4K"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!prompt && activeTab !== 'analyze') return;
    setLoading(true);
    setResult(null);
    setAnalysis(null);
    setSearchResults(null);

    try {
      if (activeTab === 'generate') {
        const url = await GeminiService.generateImage(prompt, aspectRatio, imageSize);
        setResult(url);
      } else if (activeTab === 'edit' && imageFile) {
        const url = await GeminiService.editImage(imageFile, prompt);
        setResult(url);
      } else if (activeTab === 'analyze' && imageFile) {
        const text = await GeminiService.analyzeImage(imageFile, prompt || "Reporte de estado de propiedad.");
        setAnalysis(text || "Sin respuesta.");
      } else if (activeTab === 'search') {
        const res = await GeminiService.searchLocalInfo(prompt);
        setSearchResults(res);
      }
    } catch (error) {
      console.error(error);
      alert("Error en el procesamiento. Verifica tu API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-2xl w-fit mx-auto">
        {[
          { id: 'generate', label: 'Generar', icon: Wand2 },
          { id: 'edit', label: 'Editar', icon: ImageIcon },
          { id: 'analyze', label: 'Analizar', icon: ScanSearch },
          { id: 'search', label: 'Consultar', icon: Search }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setResult(null); setAnalysis(null); }}
            className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
        <div className="space-y-4">
          {(activeTab === 'edit' || activeTab === 'analyze') && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Imagen de referencia</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-gray-200 rounded-2xl h-48 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden"
              >
                {imageFile ? (
                  <img src={imageFile} className="w-full h-full object-cover" alt="Source" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto text-gray-300 group-hover:text-indigo-400 mb-2" size={40} />
                    <p className="text-xs text-gray-400">Subir foto para análisis o edición</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Relación de Aspecto</label>
                <div className="flex flex-wrap gap-2">
                  {aspectRatios.map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        aspectRatio === ratio ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Calidad</label>
                <div className="flex space-x-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`px-4 py-1 text-xs rounded-full border transition-all ${
                        imageSize === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Prompt / Instrucciones</label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Escribe aquí lo que necesitas..."
                className="w-full h-24 p-4 pr-12 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all resize-none outline-none text-sm"
              />
              <button 
                onClick={handleAction}
                disabled={loading}
                className="absolute bottom-4 right-4 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>

        {(result || analysis || searchResults) && (
          <div className="mt-8 border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-bottom-4">
            {result && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <CheckCircle2 className="text-green-500 mr-2" size={20} /> 
                    Imagen Generada
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-2xl overflow-hidden border p-2">
                  <img src={result} className="w-full rounded-xl" alt="Resultado" />
                </div>
              </div>
            )}
            {analysis && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center"><ScanSearch className="text-indigo-500 mr-2" size={20} /> Análisis IA</h3>
                <div className="bg-indigo-50 p-6 rounded-2xl border text-gray-700 text-sm whitespace-pre-wrap">{analysis}</div>
              </div>
            )}
            {searchResults && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center"><Search className="text-indigo-500 mr-2" size={20} /> Resultados de Búsqueda</h3>
                <div className="bg-white p-6 rounded-2xl border text-gray-700 text-sm">{searchResults.text}</div>
                <div className="flex flex-wrap gap-2">
                  {searchResults.sources.map((chunk, i) => chunk.web && (
                    <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="flex items-center space-x-2 px-3 py-1 bg-gray-50 border rounded-lg text-xs text-indigo-600">
                      <LinkIcon size={12} /><span>{chunk.web.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHub;
