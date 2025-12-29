"use client";
import { useState } from "react";
import { 
  Upload, Camera, Video, Instagram, Briefcase, 
  Palette, Copy, Globe, PlayCircle, Check, Loader2, Sparkles 
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [language, setLanguage] = useState("en");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // --- HANDLERS ---
  
  const handleFile = (selected: File) => {
    if (!selected) return;
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(selected);
    setFile(selected);
    setPreview(objectUrl);
    setResult(null); // Clear previous results
    
    // Detect type
    if (selected.type.startsWith("video")) {
      setFileType("video");
    } else {
      setFileType("image");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const generateCaption = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    try {
      // Connecting to the Python Backend
      const res = await fetch("http://127.0.0.1:8000/generate", { 
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server Error: ${res.statusText}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Connection Error:", error);
      alert("⚠️ Could not connect to PixelPoet Backend. Is main.py running?");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // --- UI CONSTANTS ---
  const styles = [
    { name: "Viral Social", icon: <Instagram size={18} className="text-pink-500" /> },
    { name: "Professional", icon: <Briefcase size={18} className="text-blue-400" /> },
    { name: "Artistic", icon: <Palette size={18} className="text-purple-400" /> },
  ];

  return (
    <main className="min-h-screen bg-[#0b1121] text-slate-200 p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
        
        {/* --- LEFT: UPLOAD --- */}
        <div className="flex flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-600">
              PixelPoet.
            </h1>
            <p className="text-slate-400 text-lg font-light flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              AI-Powered Caption title Generator
            </p>
          </div>

          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative group border-2 border-dashed rounded-3xl h-80 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${
              isDragging 
                ? "border-cyan-400 bg-cyan-400/10 scale-[1.02]" 
                : "border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-500"
            }`}
          >
            <input
              type="file"
              accept="image/*,video/*"
              onChange={onFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
            />
            
            {preview ? (
              <div className="relative w-full h-full">
                {fileType === "video" ? (
                  <video src={preview} controls className="w-full h-full object-contain bg-black" />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                  <p className="text-white font-medium flex items-center gap-2">
                    <Upload size={20} /> Replace File
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-500 transition-colors group-hover:text-slate-300">
                <div className="p-4 rounded-full bg-slate-800 border border-slate-700 shadow-xl">
                  <Camera size={32} className="text-cyan-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg text-slate-300">Click or Drag File</p>
                  <p className="text-sm">Supports Images & Videos</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-cyan-500 hover:bg-slate-800 transition appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="es">Spanish</option>
              </select>
            </div>

            <button
              onClick={generateCaption}
              disabled={!file || loading}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                loading 
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700" 
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-cyan-500/25 hover:scale-[1.02] text-white active:scale-[0.98]"
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              {loading ? "Analyzing..." : "Generate Magic"}
            </button>
          </div>
        </div>

        {/* --- RIGHT: RESULTS --- */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white"> Results</h3>
          </div>

          <div className="flex-1 space-y-4 h-[600px] overflow-y-auto pr-2">
            {result ? (
              <>
                {result.captions.map((cap: string, index: number) => (
                  <div 
                    key={index} 
                    className="group bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-all relative animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {styles[index]?.icon || <Briefcase size={18} />}
                      <span>{styles[index]?.name || "Variation"}</span>
                    </div>
                    <p className="text-lg text-slate-200 leading-relaxed font-medium">{cap}</p>
                    <button 
                      onClick={() => copyToClipboard(cap, index)}
                      className="absolute top-5 right-5 text-slate-500 hover:text-white transition"
                    >
                      {copiedIndex === index ? <Check className="text-green-400" size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                ))}

                <div className="bg-slate-900/50 p-5 rounded-2xl border border-dashed border-slate-700/50">
                  <p className="text-cyan-400 text-sm font-mono leading-7">{result.hashtags}</p>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 gap-4">
                {loading ? (
                  <p className="animate-pulse text-cyan-400">Thinking...</p>
                ) : (
                  <>
                    <PlayCircle size={48} opacity={0.2} />
                    <p>Results will appear here</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}