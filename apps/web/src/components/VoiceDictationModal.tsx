import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Check, Globe, AlertCircle, RefreshCw } from 'lucide-react';

interface VoiceDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  defaultLocale?: string;
}

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  isOpen,
  onClose,
  onApply,
  defaultLocale = 'en-IN'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLocale);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pre-configured multilingual sample transcripts for seamless testing
  const sampleTranscripts: Record<string, string> = {
    'en-IN': 'We are proud to introduce Nadi Radiant Dew Face Serum with 98.5% certified organic botanicals. It delivers 24% skin hydration improvement over 14 days.*',
    'hi-IN': 'Nadi Radiant Dew Face Serum se payein nikhra aur swasth chehra. Isme shamil hain 98.5% certified organic botanicals jo twacha ko 14 dino mein poshan dete hain.*',
    'ta-IN': 'Nadi Radiant Dew Face Serum iyarkai unavukaludan 98.5% thooimaiyana organic porutkalai kondu uruvakkappattadhu.',
    'te-IN': 'Nadi Radiant Dew Face Serum 98.5% certified organic botanicals tho tayaru cheyabadindi.'
  };

  useEffect(() => {
    if (!isOpen) {
      setIsRecording(false);
      setTranscript('');
      return;
    }
  }, [isOpen]);

  // Audio Waveform Animation
  useEffect(() => {
    if (!isRecording || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const drawWave = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.fillStyle = '#091510';
      ctx.fillRect(0, 0, width, height);

      const numBars = 36;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        // Simulated realistic voice audio frequencies
        const freq = Math.sin(frame * 0.1 + i * 0.4) * Math.cos(frame * 0.05 + i * 0.2);
        const barHeight = Math.max(6, Math.abs(freq) * (height * 0.75));
        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#34d399');
        grad.addColorStop(1, '#059669');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      animId = requestAnimationFrame(drawWave);
    };

    drawWave();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isRecording]);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate real-time dictation
      const sample = sampleTranscripts[selectedLanguage] || sampleTranscripts['en-IN'];
      let idx = 0;
      const interval = setInterval(() => {
        idx += 12;
        if (idx <= sample.length) {
          setTranscript(sample.substring(0, idx));
        } else {
          setTranscript(sample);
          clearInterval(interval);
          setIsRecording(false);
        }
      }, 180);
    } else {
      setIsRecording(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0b1410] border border-[#1e382a] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b2f23] pb-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-800 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Indian-Language Voice Dictation</h3>
              <p className="text-[11px] text-slate-400">IS 12 &amp; Voice Safety IS 38 — Input convenience only</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-between bg-[#080d0a] p-3 rounded-xl border border-[#16271e] text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Target Indic Dialect:</span>
          </div>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-[#0f1f17] border border-[#234231] text-emerald-300 rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">Hindi (हिन्दी / Hinglish)</option>
            <option value="ta-IN">Tamil (தமிழ்)</option>
            <option value="te-IN">Telugu (తెలుగు)</option>
          </select>
        </div>

        {/* Audio Waveform Canvas */}
        <div className="rounded-xl overflow-hidden border border-[#172e21] relative h-24 flex items-center justify-center bg-[#070e0a]">
          <canvas
            ref={canvasRef}
            width={460}
            height={96}
            className="w-full h-full"
          />
          {!isRecording && transcript.length === 0 && (
            <div className="absolute text-xs text-slate-500 font-mono flex items-center space-x-2">
              <span>Ready for microphone input</span>
            </div>
          )}
        </div>

        {/* Record Control Button */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <button
            onClick={handleToggleRecord}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-950 scale-105'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950 hover:scale-105'
            }`}
          >
            {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
          <span className="text-xs font-mono text-slate-400">
            {isRecording ? 'Listening & Transcribing (Indic Engine)...' : 'Click microphone to dictate'}
          </span>
        </div>

        {/* Editable Transcript Preview (IS 12 Requirement) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Editable Transcript Preview:</span>
            <span className="text-amber-400 italic">Human verification required</span>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Dictated copy appears here. You may edit or correct phrasing before inserting into the review studio..."
            className="w-full bg-[#070e0a] border border-[#1a3325] rounded-xl p-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none h-24 font-sans resize-none leading-relaxed"
          />
        </div>

        {/* Safety Disclaimer */}
        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[10px] text-amber-300/90 flex items-start space-x-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>Voice safety policy: Spoken input can never unilaterally sign off, approve, or publish campaign content.</span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-1 border-t border-[#172a1e]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white border border-[#21382b] rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (transcript.trim()) {
                onApply(transcript);
                onClose();
              }
            }}
            disabled={!transcript.trim()}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Editor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
