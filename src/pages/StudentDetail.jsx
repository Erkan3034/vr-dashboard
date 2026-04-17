import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Award from 'lucide-react/dist/esm/icons/award';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Camera from 'lucide-react/dist/esm/icons/camera';
import X from 'lucide-react/dist/esm/icons/x';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Target from 'lucide-react/dist/esm/icons/target';
import Footprints from 'lucide-react/dist/esm/icons/footprints';
import Timer from 'lucide-react/dist/esm/icons/timer';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';

/* ═══════════════════════════════════════════════════════════
   VR HEATMAP — Canvas-based Movement Visualization
   ═══════════════════════════════════════════════════════════ */
const VRHeatmapCanvas = ({ traces, width = 400, height = 400 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !traces || traces.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Calculate bounds from actual data
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    traces.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    const padding = 30;
    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const scaleX = (width - padding * 2) / rangeX;
    const scaleZ = (height - padding * 2) / rangeZ;

    const toScreen = (x, z) => ({
      sx: padding + (x - minX) * scaleX,
      sy: padding + (z - minZ) * scaleZ,
    });

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(42, 52, 68, 0.4)';
    ctx.lineWidth = 0.5;
    const gridSpacing = 40;
    for (let gx = 0; gx < width; gx += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // Heatmap layer — density-based coloring
    const cellSize = 8;
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    const density = new Float32Array(cols * rows);
    let maxDensity = 0;

    traces.forEach(p => {
      const { sx, sy } = toScreen(p.x, p.z);
      const col = Math.floor(sx / cellSize);
      const row = Math.floor(sy / cellSize);
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const idx = row * cols + col;
        density[idx]++;
        if (density[idx] > maxDensity) maxDensity = density[idx];
      }
    });

    if (maxDensity > 0) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = density[r * cols + c];
          if (val > 0) {
            const intensity = val / maxDensity;
            // Color gradient: blue → cyan → green → yellow → red
            let red, green, blue;
            if (intensity < 0.25) {
              red = 0; green = Math.round(intensity * 4 * 200); blue = 200;
            } else if (intensity < 0.5) {
              red = 0; green = 200; blue = Math.round((1 - (intensity - 0.25) * 4) * 200);
            } else if (intensity < 0.75) {
              red = Math.round((intensity - 0.5) * 4 * 255); green = 200; blue = 0;
            } else {
              red = 255; green = Math.round((1 - (intensity - 0.75) * 4) * 200); blue = 0;
            }
            ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.15 + intensity * 0.35})`;
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    // Movement path
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const first = toScreen(traces[0].x, traces[0].z);
    ctx.moveTo(first.sx, first.sy);
    for (let i = 1; i < traces.length; i++) {
      const { sx, sy } = toScreen(traces[i].x, traces[i].z);
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Start point
    const start = toScreen(traces[0].x, traces[0].z);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(start.sx, start.sy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('BAŞLANGIÇ', start.sx + 8, start.sy + 3);

    // End point
    const end = toScreen(traces[traces.length - 1].x, traces[traces.length - 1].z);
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(end.sx, end.sy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('BİTİŞ', end.sx + 8, end.sy + 3);

    // Legend
    ctx.fillStyle = 'rgba(42, 52, 68, 0.8)';
    ctx.fillRect(8, height - 52, 120, 44);
    ctx.strokeStyle = 'rgba(42, 52, 68, 0.6)';
    ctx.strokeRect(8, height - 52, 120, 44);

    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('YOĞUNLUK', 16, height - 38);

    // Gradient legend bar
    const gradW = 80;
    const gradH = 6;
    const gradX = 16;
    const gradY = height - 28;
    const grad = ctx.createLinearGradient(gradX, 0, gradX + gradW, 0);
    grad.addColorStop(0, 'rgba(0, 0, 200, 0.6)');
    grad.addColorStop(0.25, 'rgba(0, 200, 200, 0.6)');
    grad.addColorStop(0.5, 'rgba(0, 200, 0, 0.6)');
    grad.addColorStop(0.75, 'rgba(255, 200, 0, 0.6)');
    grad.addColorStop(1, 'rgba(255, 0, 0, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(gradX, gradY, gradW, gradH);

    ctx.fillStyle = '#64748b';
    ctx.font = '7px JetBrains Mono, monospace';
    ctx.fillText('Az', gradX, gradY + 14);
    ctx.fillText('Çok', gradX + gradW - 12, gradY + 14);

  }, [traces, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded-lg"
    />
  );
};

/* ═══════════════════════════════════════════════════════════
   PHOTO LIGHTBOX
   ═══════════════════════════════════════════════════════════ */
const Lightbox = ({ photos, currentIndex, onClose, onNext, onPrev }) => {
  const photo = photos[currentIndex];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onNext, onPrev]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-text-muted hover:text-white transition-colors cursor-pointer z-10"
          aria-label="Kapat"
        >
          <X size={24} />
        </button>

        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl bg-obsidian-card border border-obsidian-border/30">
          <img
            src={`data:image/jpeg;base64,${photo.Base64Data}`}
            alt={photo.GorevAdi || 'Kanıt fotoğrafı'}
            className="w-full max-h-[75vh] object-contain"
          />

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass-strong text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Önceki fotoğraf"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass-strong text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Sonraki fotoğraf"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {/* Info bar */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div>
            <p className="text-text-heading font-medium">{photo.GorevAdi || 'Kanıt Fotoğrafı'}</p>
            <p className="text-text-muted text-xs font-mono mt-0.5">{photo.sessionName}</p>
          </div>
          <span className="text-text-muted font-mono text-xs">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   STUDENT DETAIL PAGE
   ═══════════════════════════════════════════════════════════ */
const StudentDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { quizData, vrData, loading } = useData();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [activeHeatmapIdx, setActiveHeatmapIdx] = useState(0);

  const studentData = useMemo(() => {
    if (loading) return null;
    const quizzes = quizData.filter(q => q.userId === userId);
    const vrs = vrData.filter(v => v.userId === userId);

    const name = quizzes[0]?.KullaniciAdi || vrs[0]?.KullaniciAdi || 'İsimsiz Kursiyer';

    // Collect photos with session context
    let allPhotos = [];
    vrs.forEach(session => {
      if (session.Fotograflar && Array.isArray(session.Fotograflar)) {
        allPhotos = [...allPhotos, ...session.Fotograflar.map(f => ({
          ...f,
          sessionName: session.ModulAdi
        }))];
      }
    });

    // All sessions with heatmap data
    const heatmapSessions = vrs.filter(v => v.HareketIzleri && v.HareketIzleri.length > 0);

    // Summary stats
    let totalScore = 0, quizCount = 0;
    quizzes.forEach(q => {
      if (q.FinalPuan !== undefined) { totalScore += q.FinalPuan; quizCount++; }
    });
    const avgScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;

    let totalDistance = 0, totalDuration = 0;
    vrs.forEach(v => {
      totalDistance += v.ToplamMesafe || 0;
      totalDuration += v.GorevTamamlamaSuresiSaniye || 0;
    });

    return {
      name, quizzes, vrs, allPhotos, heatmapSessions,
      avgScore, quizCount, totalDistance, totalDuration,
      totalSessions: quizzes.length + vrs.length
    };
  }, [userId, quizData, vrData, loading]);

  const openLightbox = useCallback((index) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(-1), []);
  const nextPhoto = useCallback(() => {
    setLightboxIndex(prev => (prev + 1) % studentData.allPhotos.length);
  }, [studentData]);
  const prevPhoto = useCallback(() => {
    setLightboxIndex(prev => (prev - 1 + studentData.allPhotos.length) % studentData.allPhotos.length);
  }, [studentData]);

  if (loading || !studentData) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="glass rounded-2xl p-6"><div className="skeleton h-48 w-full" /></div>)}
        </div>
      </div>
    );
  }

  const scoreColor = studentData.avgScore >= 70 ? 'text-emerald-glow' : studentData.avgScore >= 40 ? 'text-amber-glow' : 'text-rose-glow';

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl glass hover:bg-obsidian-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-glow/50"
          aria-label="Geri dön"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-text-heading font-display truncate">{studentData.name}</h2>
          <p className="text-xs font-mono text-text-muted truncate">ID: {userId}</p>
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up stagger-1">
        <div className="glass rounded-xl p-4 text-center">
          <Target size={16} className="mx-auto text-cyan-glow mb-1.5" />
          <p className={`text-xl font-bold font-mono ${scoreColor}`}>{studentData.avgScore}</p>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Ort. Puan</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Timer size={16} className="mx-auto text-amber-glow mb-1.5" />
          <p className="text-xl font-bold font-mono text-text-heading">{studentData.totalSessions}</p>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Oturum</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Footprints size={16} className="mx-auto text-purple-glow mb-1.5" />
          <p className="text-xl font-bold font-mono text-text-heading">{Math.round(studentData.totalDistance)}<span className="text-xs text-text-muted ml-0.5">m</span></p>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Mesafe</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Clock size={16} className="mx-auto text-emerald-glow mb-1.5" />
          <p className="text-xl font-bold font-mono text-text-heading">
            {Math.floor(studentData.totalDuration / 60)}<span className="text-xs text-text-muted">dk</span>
          </p>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Süre</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Quiz History ── */}
        <div className="glass rounded-2xl p-5 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-2 border-b border-obsidian-border/30 pb-3 mb-4">
            <Award size={16} className="text-amber-glow" />
            <h3 className="text-sm font-semibold text-text-heading">Quiz Geçmişi</h3>
            <span className="ml-auto text-[10px] font-mono text-text-muted">{studentData.quizzes.length} kayıt</span>
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {studentData.quizzes.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">Kayıt bulunamadı</p>
            ) : (
              studentData.quizzes.map((quiz, i) => {
                const pct = quiz.ToplamSoru > 0 ? Math.round((quiz.DogruSayisi / quiz.ToplamSoru) * 100) : 0;
                const barColor = pct >= 70 ? 'bg-emerald-glow' : pct >= 40 ? 'bg-amber-glow' : 'bg-rose-glow';
                return (
                  <div key={i} className="p-3.5 bg-obsidian-card/50 rounded-xl border border-obsidian-border/20 hover:border-obsidian-border/40 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-text-primary truncate max-w-[60%]">{quiz.ModulAdi}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${quiz.FinalPuan >= 50 ? 'bg-emerald-glow/10 text-emerald-glow' : 'bg-rose-glow/10 text-rose-glow'
                        }`}>
                        {quiz.FinalPuan} puan
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-obsidian rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-text-muted">{pct}%</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted font-mono">
                      <span>Doğru: {quiz.DogruSayisi}/{quiz.ToplamSoru}</span>
                      <span>{quiz.Tarih}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── VR Sessions ── */}
        <div className="glass rounded-2xl p-5 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2 border-b border-obsidian-border/30 pb-3 mb-4">
            <Clock size={16} className="text-purple-glow" />
            <h3 className="text-sm font-semibold text-text-heading">VR Uygulama Geçmişi</h3>
            <span className="ml-auto text-[10px] font-mono text-text-muted">{studentData.vrs.length} kayıt</span>
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {studentData.vrs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">Kayıt bulunamadı</p>
            ) : (
              studentData.vrs.map((vr, i) => {
                const taskPct = vr.ToplamGorevSayisi > 0 ? Math.round((vr.TamamlananGorevSayisi / vr.ToplamGorevSayisi) * 100) : 0;
                return (
                  <div key={i} className="p-3.5 bg-obsidian-card/50 rounded-xl border border-obsidian-border/20 hover:border-obsidian-border/40 transition-colors">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-sm font-medium text-text-primary truncate max-w-[60%]">{vr.ModulAdi}</span>
                      <span className="text-xs font-mono font-bold text-purple-glow">
                        {vr.TamamlananGorevSayisi}/{vr.ToplamGorevSayisi} görev
                      </span>
                    </div>
                    {/* Task completion bar */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 bg-obsidian rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-purple-glow" style={{ width: `${taskPct}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-text-muted">{taskPct}%</span>
                    </div>
                    {/* Data grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono">
                      <div className="flex justify-between text-text-muted">
                        <span>Süre</span>
                        <span className="text-text-secondary">{Math.round(vr.GorevTamamlamaSuresiSaniye || 0)}s</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Mesafe</span>
                        <span className="text-text-secondary">{Math.round(vr.ToplamMesafe || 0)}m</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Ceza</span>
                        <span className={`${vr.CezaPuanlari > 0 ? 'text-rose-glow' : 'text-emerald-glow'}`}>{vr.CezaPuanlari || 0}</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>İlk Etk.</span>
                        <span className="text-text-secondary">{Math.round(vr.IlkEtkilesimSuresi || 0)}s</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Photos ── */}
        <div className="glass rounded-2xl p-5 lg:col-span-2 animate-fade-in-up stagger-4">
          <div className="flex items-center gap-2 border-b border-obsidian-border/30 pb-3 mb-4">
            <Camera size={16} className="text-emerald-glow" />
            <h3 className="text-sm font-semibold text-text-heading">Olay Yeri Kanıt Fotoğrafları</h3>
            <span className="ml-auto text-[10px] font-mono text-text-muted">{studentData.allPhotos.length} fotoğraf</span>
          </div>
          {studentData.allPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Camera size={32} className="text-text-muted/30 mb-3" />
              <p className="text-sm text-text-muted">Kursiyer henüz fotoğraf çekmemiş</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {studentData.allPhotos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => openLightbox(i)}
                  className="group relative rounded-xl overflow-hidden border border-obsidian-border/30 hover:border-cyan-glow/30 transition-all cursor-pointer aspect-[4/3] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-glow/50"
                >
                  <img
                    src={`data:image/jpeg;base64,${photo.Base64Data}`}
                    alt={photo.GorevAdi || 'Kanıt fotoğrafı'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
                    <p className="text-white text-xs font-medium truncate">{photo.GorevAdi || 'Kanıt'}</p>
                    <p className="text-white/60 text-[10px] font-mono truncate">{photo.sessionName}</p>
                  </div>
                  {/* Zoom indicator */}
                  <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={14} className="text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── VR Heatmap ── */}
        {studentData.heatmapSessions.length > 0 && (
          <div className="glass rounded-2xl p-5 lg:col-span-2 animate-fade-in-up stagger-5">
            <div className="flex items-center gap-2 border-b border-obsidian-border/30 pb-3 mb-4">
              <MapPin size={16} className="text-cyan-glow" />
              <h3 className="text-sm font-semibold text-text-heading">VR Hareket Haritası</h3>
              <span className="ml-auto text-[10px] font-mono text-text-muted">
                {studentData.heatmapSessions[activeHeatmapIdx]?.HareketIzleri.length} nokta
              </span>
            </div>

            {/* Session tabs */}
            {studentData.heatmapSessions.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {studentData.heatmapSessions.map((session, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveHeatmapIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap cursor-pointer transition-colors ${activeHeatmapIdx === idx
                        ? 'bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30'
                        : 'bg-obsidian-card text-text-muted hover:bg-obsidian-hover border border-transparent'
                      }`}
                  >
                    {session.ModulAdi || `Oturum ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 items-start">
              {/* Canvas heatmap */}
              <div className="flex-1 flex justify-center">
                <VRHeatmapCanvas
                  traces={studentData.heatmapSessions[activeHeatmapIdx]?.HareketIzleri || []}
                  width={Math.min(480, typeof window !== 'undefined' ? window.innerWidth - 80 : 480)}
                  height={360}
                />
              </div>

              {/* Heatmap info panel */}
              <div className="w-full lg:w-56 space-y-3 shrink-0">
                <div className="bg-obsidian-card/50 rounded-xl p-3.5 border border-obsidian-border/20">
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Oturum Bilgileri</p>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Modül</span>
                      <span className="text-text-primary text-right max-w-[60%] truncate">
                        {studentData.heatmapSessions[activeHeatmapIdx]?.ModulAdi}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Mesafe</span>
                      <span className="text-text-primary">
                        {Math.round(studentData.heatmapSessions[activeHeatmapIdx]?.ToplamMesafe || 0)}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Süre</span>
                      <span className="text-text-primary">
                        {Math.round(studentData.heatmapSessions[activeHeatmapIdx]?.GorevTamamlamaSuresiSaniye || 0)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Görev</span>
                      <span className="text-text-primary">
                        {studentData.heatmapSessions[activeHeatmapIdx]?.TamamlananGorevSayisi}/
                        {studentData.heatmapSessions[activeHeatmapIdx]?.ToplamGorevSayisi}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-obsidian-card/50 rounded-xl p-3.5 border border-obsidian-border/20">
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Harita Açıklaması</p>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-glow shrink-0" />
                      <span className="text-text-secondary">Başlangıç noktası</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-glow shrink-0" />
                      <span className="text-text-secondary">Bitiş noktası</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm bg-cyan-glow/40 shrink-0" />
                      <span className="text-text-secondary">Hareket yolu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-blue-500 via-green-500 to-red-500 shrink-0" />
                      <span className="text-text-secondary">Yoğunluk ısı haritası</span>
                    </div>
                  </div>
                </div>

                {(studentData.heatmapSessions[activeHeatmapIdx]?.CezaPuanlari > 0) && (
                  <div className="bg-rose-glow/5 rounded-xl p-3.5 border border-rose-glow/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={12} className="text-rose-glow" />
                      <p className="text-[10px] font-mono text-rose-glow uppercase tracking-wider">Ceza Puanı</p>
                    </div>
                    <p className="text-lg font-bold font-mono text-rose-glow">
                      {studentData.heatmapSessions[activeHeatmapIdx]?.CezaPuanlari}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex >= 0 && studentData.allPhotos.length > 0 && (
        <Lightbox
          photos={studentData.allPhotos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextPhoto}
          onPrev={prevPhoto}
        />
      )}
    </div>
  );
};

export default StudentDetail;