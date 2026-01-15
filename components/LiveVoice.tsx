
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
// Fix: Replace non-existent 'Waveform' icon with 'Activity'
import { Mic, MicOff, Volume2, Activity, AlertTriangle } from 'lucide-react';
import { decode, encode, decodeAudioData } from '../geminiService';

const LiveVoice: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [history, setHistory] = useState<{role: string, text: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Acumuladores de transcripción
  const currentOutputTranscription = useRef('');
  const currentInputTranscription = useRef('');

  const cleanup = () => {
    if (sessionRef.current) {
      // Si la API tuviera close() se llamaría aquí. 
      // Por ahora limpiamos los recursos locales.
      sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsActive(false);
  };

  const startSession = async () => {
    try {
      cleanup();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setError(null);
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Transcriptions
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const out = currentOutputTranscription.current;
              const inp = currentInputTranscription.current;
              if (inp) setHistory(prev => [...prev.slice(-10), {role: 'user', text: inp}]);
              if (out) setHistory(prev => [...prev.slice(-10), {role: 'model', text: out}]);
              currentOutputTranscription.current = '';
              currentInputTranscription.current = '';
            }
          },
          onerror: (e) => {
            console.error(e);
            setError("Error de conexión.");
            cleanup();
          },
          onclose: () => cleanup()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: "Eres el asistente de Villa Los Ángeles. Ayudas con gestiones de administración por voz.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Micrófono no disponible.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">Voz Villa IA</h2>
        <p className="text-gray-500">Gestión de condominio manos libres.</p>
      </div>

      <div className="relative">
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center -m-10">
            <div className="w-64 h-64 bg-indigo-500/10 rounded-full animate-ping" />
          </div>
        )}
        <button
          onClick={isActive ? cleanup : startSession}
          className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all shadow-xl ${
            isActive ? 'bg-red-500 scale-105' : 'bg-indigo-600 hover:scale-105'
          } text-white`}
        >
          {isActive ? <MicOff size={50} /> : <Mic size={50} />}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-200 flex items-center space-x-2">
          <AlertTriangle size={16} /><span>{error}</span>
        </div>
      )}

      <div className="w-full bg-white rounded-2xl border p-6 shadow-sm min-h-[200px] space-y-4">
        {history.length > 0 ? history.map((h, i) => (
          <div key={i} className={`text-sm ${h.role === 'model' ? 'text-indigo-600 font-medium text-right' : 'text-gray-600'}`}>
            <span className="bg-gray-50 px-3 py-1.5 rounded-xl inline-block">
              {h.text}
            </span>
          </div>
        )) : (
          <p className="text-center text-gray-400 mt-10">Pulsa el botón para iniciar conversación.</p>
        )}
      </div>

      <div className="flex items-center space-x-4 text-gray-400 text-xs">
        <div className="flex items-center space-x-1"><Volume2 size={14}/><span>24kHz</span></div>
        {/* Fix: Replace non-existent 'Waveform' icon with 'Activity' */}
        <div className="flex items-center space-x-1"><Activity size={14}/><span>Baja Latencia</span></div>
      </div>
    </div>
  );
};

export default LiveVoice;
