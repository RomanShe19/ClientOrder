import { useEffect, useState, useRef, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import type { UserAnalytics } from '../../types/admin';

interface AnalyticsModalProps {
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds} сек`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m} мин ${s} сек`;
  const h = Math.floor(m / 60);
  return `${h} ч ${m % 60} мин`;
}

const GRID_COLS = 10;
const GRID_ROWS = 10;

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ onClose }) => {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'points'>('grid');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    adminService
      .getUserAnalytics()
      .then(setData)
      .catch(() => setError('Не удалось загрузить аналитику'))
      .finally(() => setLoading(false));
  }, []);

  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !data) return;

    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let c = 1; c < GRID_COLS; c++) {
      const x = (c / GRID_COLS) * W;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let r = 1; r < GRID_ROWS; r++) {
      const y = (r / GRID_ROWS) * H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    if (viewMode === 'grid') {
      drawGridHeatmap(ctx, W, H, data);
    } else {
      drawPointsHeatmap(ctx, W, H, data);
    }

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (let c = 0; c < GRID_COLS; c++) {
      const x = (c + 0.5) / GRID_COLS * W;
      ctx.fillText(`${c * 10}%`, x, H - 4);
    }
    ctx.textAlign = 'left';
    for (let r = 0; r < GRID_ROWS; r++) {
      const y = (r + 0.5) / GRID_ROWS * H;
      ctx.fillText(`${r * 10}%`, 3, y + 3);
    }
  }, [data, viewMode]);

  useEffect(() => {
    if (!data) return;
    drawHeatmap();
    const handleResize = () => drawHeatmap();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, drawHeatmap]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
          <p className="text-red-600 mb-4">{error || 'Нет данных'}</p>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const topClicks = Object.entries(data.button_clicks).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white">Аналитика поведения пользователей</h1>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {data.total_sessions} сессий
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Time stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Среднее за день"
            value={formatTime(data.avg_time_day)}
            sub="последние 24 ч"
            color="blue"
          />
          <StatCard
            label="Среднее за неделю"
            value={formatTime(data.avg_time_week)}
            sub="последние 7 дней"
            color="emerald"
          />
          <StatCard
            label="Среднее за месяц"
            value={formatTime(data.avg_time_month)}
            sub="последние 30 дней"
            color="purple"
          />
          <StatCard
            label="Максимум"
            value={formatTime(data.max_time)}
            sub="за всё время"
            color="amber"
          />
        </div>

        {/* Heatmap + clicks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap */}
          <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700/50">
              <h2 className="text-sm font-semibold text-gray-300">Хитмэп курсора</h2>
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Сетка
                </button>
                <button
                  onClick={() => setViewMode('points')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'points'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Точки
                </button>
              </div>
            </div>
            <div ref={containerRef} className="relative" style={{ aspectRatio: '16/9' }}>
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            </div>
            <div className="px-5 py-2 border-t border-gray-700/50 flex items-center gap-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Интенсивность:</span>
              <div className="flex items-center gap-1">
                {['#1a1a3e', '#1e3a5f', '#1e6a5f', '#4ade80', '#fbbf24', '#ef4444'].map((c, i) => (
                  <div key={i} className="w-6 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-[10px] text-gray-500">мин → макс</span>
            </div>
          </div>

          {/* Button clicks ranking */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-700/50">
              <h2 className="text-sm font-semibold text-gray-300">Топ кликов по элементам</h2>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {topClicks.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">Нет данных</p>
              ) : (
                topClicks.map(([key, count], idx) => {
                  const maxCount = topClicks[0][1];
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={key} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-4 text-right">{idx + 1}</span>
                          <span className="text-xs text-gray-300 font-mono truncate max-w-[180px]" title={key}>
                            {key}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{count}</span>
                      </div>
                      <div className="ml-6 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}) {
  const colors = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  };
  const c = colors[color];
  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-4`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${c.text}`}>{value}</p>
      <p className="text-[10px] text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function drawGridHeatmap(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  data: UserAnalytics
) {
  const grid = data.heatmap_grid;
  const values = Object.values(grid);
  if (values.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Нет данных хитмэпа', W / 2, H / 2);
    return;
  }

  const maxVal = Math.max(...values);
  const cellW = W / GRID_COLS;
  const cellH = H / GRID_ROWS;

  for (const [zone, count] of Object.entries(grid)) {
    const parts = zone.split('_');
    if (parts.length !== 2) continue;
    const row = parseInt(parts[0], 10);
    const col = parseInt(parts[1], 10);
    if (isNaN(row) || isNaN(col)) continue;

    const intensity = count / maxVal;
    const color = intensityToColor(intensity);
    const x = col * cellW;
    const y = row * cellH;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, cellW, cellH);

    if (intensity > 0.3) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(intensity * 0.6, 0.8)})`;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(count), x + cellW / 2, y + cellH / 2 + 4);
    }
  }
}

function drawPointsHeatmap(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  data: UserAnalytics
) {
  const positions = data.cursor_positions;
  if (positions.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Нет данных позиций курсора', W / 2, H / 2);
    return;
  }

  const maxX = Math.max(...positions.map((p) => p.x), 1);
  const maxY = Math.max(...positions.map((p) => p.y), 1);

  const bucketSize = 20;
  const bucketW = Math.ceil(W / bucketSize);
  const bucketH = Math.ceil(H / bucketSize);
  const buckets: number[][] = Array.from({ length: bucketH }, () =>
    new Array(bucketW).fill(0)
  );

  for (const pos of positions) {
    const nx = (pos.x / maxX) * W;
    const ny = (pos.y / maxY) * H;
    const bx = Math.min(Math.floor(nx / bucketSize), bucketW - 1);
    const by = Math.min(Math.floor(ny / bucketSize), bucketH - 1);
    if (bx >= 0 && by >= 0) buckets[by][bx]++;
  }

  let maxBucket = 0;
  for (let r = 0; r < bucketH; r++) {
    for (let c = 0; c < bucketW; c++) {
      if (buckets[r][c] > maxBucket) maxBucket = buckets[r][c];
    }
  }

  if (maxBucket === 0) return;

  for (let r = 0; r < bucketH; r++) {
    for (let c = 0; c < bucketW; c++) {
      const count = buckets[r][c];
      if (count === 0) continue;

      const intensity = count / maxBucket;
      const cx = c * bucketSize + bucketSize / 2;
      const cy = r * bucketSize + bucketSize / 2;
      const radius = bucketSize * 0.3 + bucketSize * 0.7 * intensity;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const color = intensityToRgb(intensity);
      grad.addColorStop(0, `rgba(${color}, ${0.4 + intensity * 0.5})`);
      grad.addColorStop(0.6, `rgba(${color}, ${0.1 + intensity * 0.15})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
}

function intensityToColor(t: number): string {
  const rgb = intensityToRgb(t);
  const alpha = 0.15 + t * 0.7;
  return `rgba(${rgb}, ${alpha})`;
}

function intensityToRgb(t: number): string {
  if (t < 0.2) return `${30 + t * 100}, ${40 + t * 150}, ${80 + t * 200}`;
  if (t < 0.4) return `${30 + t * 50}, ${100 + t * 200}, ${100 + t * 150}`;
  if (t < 0.6) return `${50 + t * 150}, ${180 + t * 50}, ${80}`;
  if (t < 0.8) return `${200 + t * 50}, ${180 - t * 50}, ${50}`;
  return `${220 + t * 35}, ${80 - t * 40}, ${50 + t * 20}`;
}
