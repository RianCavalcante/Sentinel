import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

interface AnalyticsViewProps {
  errors: any[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ errors }) => {
  // Processar dados para os gráficos
  const analyticsData = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    // Dados para gráfico de linha temporal
    const timelineData = last7Days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const pending = errors.filter(e => {
        const errorDate = new Date(e.timestamp);
        return e.status !== 'resolvido' && errorDate >= dayStart && errorDate <= dayEnd;
      }).length;
      
      const resolved = errors.filter(e => {
        const errorDate = new Date(e.timestamp);
        return e.status === 'resolvido' && errorDate >= dayStart && errorDate <= dayEnd;
      }).length;

      return {
        date: dayStart,
        pending,
        resolved,
        label: dayStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      };
    });

    // Distribuição por severidade
    const severityDist = {
      crítica: errors.filter(e => e.severity === 'crítica' && e.status !== 'resolvido').length,
      alta: errors.filter(e => e.severity === 'alta' && e.status !== 'resolvido').length,
      média: errors.filter(e => e.severity === 'média' && e.status !== 'resolvido').length,
      baixa: errors.filter(e => e.severity === 'baixa' && e.status !== 'resolvido').length,
    };

    // Top workflows com erros
    const workflowCounts = errors.reduce((acc: any, err) => {
      if (err.status !== 'resolvido') {
        const name = err.workflow?.name || 'Desconhecido';
        acc[name] = (acc[name] || 0) + 1;
      }
      return acc;
    }, {});

    const topWorkflows = Object.entries(workflowCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Métricas gerais
    const totalPending = errors.filter(e => e.status !== 'resolvido').length;
    const totalResolved = errors.filter(e => e.status === 'resolvido').length;
    const criticalCount = errors.filter(e => e.severity === 'crítica' && e.status !== 'resolvido').length;
    
    // Taxa de resolução
    const resolutionRate = totalResolved + totalPending > 0 
      ? ((totalResolved / (totalResolved + totalPending)) * 100).toFixed(1)
      : '0';

    // Tempo médio de resolução (simulado - você pode calcular do timestamp real)
    const avgResolutionTime = '14m';

    return {
      timelineData,
      severityDist,
      topWorkflows,
      metrics: {
        totalPending,
        totalResolved,
        criticalCount,
        resolutionRate,
        avgResolutionTime
      }
    };
  }, [errors]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Analytics & Relatórios</h1>
          <p className="text-sm text-zinc-500">Visualização avançada dos seus dados de erros</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Clock size={14} />
          <span>Últimos 7 dias</span>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pendente"
          value={analyticsData.metrics.totalPending}
          icon={AlertCircle}
          color="red"
          trend="+12%"
        />
        <MetricCard
          title="Total Resolvido"
          value={analyticsData.metrics.totalResolved}
          icon={CheckCircle2}
          color="emerald"
          trend="+8%"
        />
        <MetricCard
          title="Taxa de Resolução"
          value={`${analyticsData.metrics.resolutionRate}%`}
          icon={TrendingUp}
          color="blue"
          trend="+5%"
        />
        <MetricCard
          title="Críticos Ativos"
          value={analyticsData.metrics.criticalCount}
          icon={AlertCircle}
          color="orange"
          trend="-2"
        />
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Pendentes vs Resolvidos */}
        <div className="lg:col-span-2">
          <ChartCard title="Volume de Erros: Pendentes vs Resolvidos">
            <AreaChart data={analyticsData.timelineData} />
          </ChartCard>
        </div>

        {/* Donut Chart - Severidade */}
        <div>
          <ChartCard title="Distribuição por Severidade">
            <DonutChart data={analyticsData.severityDist} />
          </ChartCard>
        </div>
      </div>

      {/* Bar Chart - Top Workflows */}
      <ChartCard title="Top 5 Workflows com Erros">
        <BarChart data={analyticsData.topWorkflows} />
      </ChartCard>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, trend }: any) => {
  const isPositive = trend?.startsWith('+');
  const colorClasses = {
    red: 'border-red-500/20 bg-red-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5',
    orange: 'border-orange-500/20 bg-orange-500/5',
  };

  return (
    <div className={`rounded-xl border ${colorClasses[color as keyof typeof colorClasses]} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{title}</div>
        <Icon size={16} className="text-zinc-600" />
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-semibold text-zinc-100 tabular-nums">{value}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

// Chart Card Wrapper
const ChartCard = ({ title, children }: any) => (
  <div className="rounded-xl border border-white/5 bg-[#0c0c0e] p-6">
    <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
      <BarChart3 size={16} className="text-zinc-600" />
      {title}
    </h3>
    {children}
  </div>
);

// Area Chart Component
const AreaChart = ({ data }: any) => {
  const maxValue = Math.max(
    ...data.map((d: any) => Math.max(d.pending, d.resolved))
  );
  
  const width = 100;
  const height = 60;
  const padding = 5;

  const xScale = (index: number) => (index / (data.length - 1)) * (width - padding * 2) + padding;
  const yScale = (value: number) => height - padding - ((value / (maxValue || 1)) * (height - padding * 2));

  const pendingPath = data.map((d: any, i: number) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.pending)}`
  ).join(' ');

  const resolvedPath = data.map((d: any, i: number) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.resolved)}`
  ).join(' ');

  const pendingArea = `${pendingPath} L ${xScale(data.length - 1)} ${height} L ${xScale(0)} ${height} Z`;
  const resolvedArea = `${resolvedPath} L ${xScale(data.length - 1)} ${height} L ${xScale(0)} ${height} Z`;

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: '200px' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + (height - padding * 2) * percent}
            x2={width - padding}
            y2={padding + (height - padding * 2) * percent}
            stroke="#27272a"
            strokeWidth="0.2"
            strokeDasharray="1,1"
          />
        ))}

        {/* Area gradients */}
        <defs>
          <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Areas */}
        <path d={pendingArea} fill="url(#pendingGradient)" />
        <path d={resolvedArea} fill="url(#resolvedGradient)" />

        {/* Lines */}
        <path d={pendingPath} fill="none" stroke="#ef4444" strokeWidth="0.5" />
        <path d={resolvedPath} fill="none" stroke="#10b981" strokeWidth="0.5" />

        {/* Points */}
        {data.map((d: any, i: number) => (
          <g key={i}>
            <circle cx={xScale(i)} cy={yScale(d.pending)} r="0.8" fill="#ef4444" />
            <circle cx={xScale(i)} cy={yScale(d.resolved)} r="0.8" fill="#10b981" />
          </g>
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-zinc-600 font-mono px-2">
        {data.map((d: any, i: number) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-zinc-400">Pendentes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-zinc-400">Resolvidos</span>
        </div>
      </div>
    </div>
  );
};

// Donut Chart Component
const DonutChart = ({ data }: any) => {
  const total = Object.values(data).reduce((a: any, b: any) => a + b, 0) as number;
  
  const colors = {
    crítica: '#ef4444',
    alta: '#f97316',
    média: '#eab308',
    baixa: '#3b82f6',
  };

  let currentAngle = -90;
  const centerX = 50;
  const centerY = 50;
  const radius = 35;
  const innerRadius = 22;

  const segments = Object.entries(data).map(([key, value]: any) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const start = polarToCartesian(centerX, centerY, radius, startAngle);
    const end = polarToCartesian(centerX, centerY, radius, endAngle);
    const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle);
    const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle);

    const largeArc = angle > 180 ? 1 : 0;

    const path = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      'Z'
    ].join(' ');

    return { key, value, percentage, path, color: colors[key as keyof typeof colors] };
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: '220px' }}>
          {segments.map((seg, i) => (
            <path
              key={i}
              d={seg.path}
              fill={seg.color}
              opacity="0.8"
              className="transition-opacity hover:opacity-100 cursor-pointer"
            />
          ))}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold text-zinc-100">{total}</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Total</div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: seg.color }} />
              <span className="text-zinc-400 capitalize">{seg.key}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono">{seg.value}</span>
              <span className="text-zinc-600">({seg.percentage.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bar Chart Component
const BarChart = ({ data }: any) => {
  const maxValue = Math.max(...data.map((d: any) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((item: any, i: number) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 truncate max-w-[200px]" title={item.name}>
              {item.name}
            </span>
            <span className="text-zinc-500 font-mono ml-2">{item.count}</span>
          </div>
          <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500/80 to-red-500/40 transition-all duration-500 rounded-lg"
              style={{ width: `${(item.count / maxValue) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};
