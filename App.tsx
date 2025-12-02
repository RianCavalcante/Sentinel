import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LayoutGrid, Activity, Archive, Database, Settings, Menu, X, ChevronLeft, ChevronRight, Search, Bell, LogOut, Filter, Check, RefreshCw, Trash2, ArrowRight, CornerDownRight, AlertCircle, Clock, TrendingUp, TrendingDown, Calendar, ArrowUpRight, CheckCircle2, ExternalLink, Layers, Copy } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useAlerts } from './hooks/useAlerts';
import { AlertItem, ErrorStatus, ErrorPriority } from './types';
import { LoginPage } from './components/LoginPage';
import { Toast } from './components/Toast';
import { ProfileDropdown } from './components/ProfileDropdown';
import { ProfileModal } from './components/ProfileModal';
import { OnboardingTour } from './components/OnboardingTour';
import { useTourStatus } from './hooks/useTourStatus';
import { signOut } from './lib/auth';


const parseAiMessage = (fullText: string) => {
  if (!fullText) return {};
  const extract = (regex: RegExp) => {
    const match = fullText.match(regex);
    return match ? match[1].trim() : null;
  };

  // Extract multi-line sections
  const extractSection = (startPattern: string) => {
    const regex = new RegExp(`${startPattern}([\\s\\S]*?)(?=\\n(?:🛑|🧾|🧩|📍|📅|⚠️|❌|✅|🕵️|$))`, 'i');
    const match = fullText.match(regex);
    return match ? match[1].trim() : null;
  };

  // Support for both standard and emoji-based formats
  return {
    executionId: extract(/(?:ID da Execução|Execution ID)[^\d]*(\d+)/i),
    directLink: extract(/(?:Link direto|Link)[^\w]*(https?:\/\/[^\s]+)/i),
    failingNode: extract(/(?:Erro na Execução do Node|Último nó executado)[^\w"]*["']?([^"'\n]+)["']?/i),
    errorType: extract(/(?:Tipo de erro|Error Type)[:\s]*([^\n]+)/i),
    errorMessage: extract(/(?:Mensagem técnica|Mensagem)[:\s]*([^\n]+)/i),
    workflowName: extract(/(?:Nome do Workflow|Workflow Name)[:\s]*([^\n]+)/i),
    // Extract full sections
    errorSummary: extractSection('❌\\s*Resumo do Erro'),
    recommendation: extractSection('✅\\s*Ação recomendada'),
    devTip: extractSection('🕵️‍♂️\\s*Dica'),
    possibleCause: extract(/(?:Causa provável|Possible cause)[:\s]*([^\n]+)/i),
    suggestion: extract(/(?:Ação recomendada|Sugestão|Suggestion)[:\s]*([^\n]+)/i),
  };
};

const mapSupabaseToFrontend = (alert: AlertItem): any => {
  const parsed = parseAiMessage(alert.message || '');
  return {
    id: alert.id,
    timestamp: alert.timestamp,
    workflow_name: alert.workflowName || parsed.workflowName || 'Workflow Desconhecido',
    workflow: { name: alert.workflowName || parsed.workflowName || 'Workflow Desconhecido', id: alert.workflowId || 'N/A' },
    node: alert.node || parsed.failingNode || 'Desconhecido',
    errorCode: alert.errorType || parsed.errorType || 'N/A',
    message: alert.message || 'Sem mensagem',
    severity: alert.severity || 'média',
    status: alert.status || ErrorStatus.New,
    priority: alert.priority || 'Média',
    details: {
      errorType: alert.errorType || parsed.errorType,
      executionId: alert.executionId || parsed.executionId,
      directLink: alert.directLink || parsed.directLink,
      suggestion: alert.suggestion || parsed.suggestion,
      possibleCause: alert.possibleCause || parsed.possibleCause,
      errorMessage: parsed.errorMessage || alert.message,
      // New structured sections
      errorSummary: parsed.errorSummary,
      recommendation: parsed.recommendation,
      devTip: parsed.devTip,
    },
  };
};

const Badge = ({ severity, status }: { severity: string; status: string }) => {
  const colors = {
    crítica: 'bg-red-500/10 text-red-400 border-red-500/20',
    alta: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    média: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    baixa: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  const color = colors[severity as keyof typeof colors] || colors.média;
  const isResolved = status === 'resolvido';
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${isResolved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : color}`}>
      {isResolved ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      <span className="capitalize">{isResolved ? 'Resolvido' : severity}</span>
    </span>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick, badge, collapsed }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active ? 'bg-white/10 text-zinc-100 shadow-lg shadow-black/20' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? 'text-zinc-100' : ''} />
      {!collapsed && <span>{label}</span>}
    </div>
    {!collapsed && badge !== undefined && badge > 0 && (
      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-mono border border-red-500/30">{badge}</span>
    )}
  </button>
);

const StatCard = ({ title, value, trend, color }: any) => {
  const isPositive = trend?.startsWith('+');
  const trendColor = color === 'red' ? (isPositive ? 'text-red-400' : 'text-emerald-400') : (isPositive ? 'text-emerald-400' : 'text-red-400');
  
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#0c0c0e] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
      <div className="flex flex-col gap-1">
        <div className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider">{title}</div>
        <div className="flex items-end justify-between mt-1">
          <span className="text-3xl font-semibold text-zinc-100 tabular-nums tracking-tight">{value}</span>
          {trend && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonKPI = () => (
  <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 animate-pulse">
    <div className="h-3 bg-white/5 rounded w-20 mb-4" />
    <div className="h-8 bg-white/5 rounded w-16 mb-4" />
    <div className="h-12 bg-white/5 rounded" />
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-6 px-6 py-4 animate-pulse">
    <div className="h-6 bg-white/5 rounded w-24" />
    <div className="h-6 bg-white/5 rounded flex-1" />
    <div className="h-6 bg-white/5 rounded w-32" />
    <div className="h-6 bg-white/5 rounded w-32" />
    <div className="h-6 bg-white/5 rounded w-16" />
  </div>
);



const DetailSidebar = ({ error, onClose, onResolve }: any) => {
  if (!error) return null;
  
  const handleResolve = () => {
    if (error.isGroup) {
      onResolve(error.ids);
    } else {
      onResolve(error.id);
    }
    onClose();
  };

  // Helper to copy text
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: show a small tooltip or toast here
  };
  
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-[#0a0a0c] border-l border-white/10 z-50 overflow-y-auto animate-slide-in shadow-2xl shadow-black">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${error.status === 'resolvido' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {error.status === 'resolvido' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 leading-tight">Detalhes do Erro</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">ID: {error.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-zinc-200"><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
                <Activity size={14} /> Workflow
              </div>
              <div className="text-zinc-200 font-medium truncate" title={error.workflow.name}>{error.workflow.name}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
                <Database size={14} /> Nó com Falha
              </div>
              <div className="text-zinc-200 font-medium truncate" title={error.node}>{error.node}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
                <AlertCircle size={14} /> Tipo de Erro
              </div>
              <code className="text-xs bg-white/10 px-2 py-1 rounded text-zinc-300 font-mono border border-white/5">{error.details.errorType}</code>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
                <Clock size={14} /> Ocorrência
              </div>
              <div className="text-zinc-200 font-medium text-sm">
                {new Date(error.timestamp).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          {/* AI Analysis Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              Análise Inteligente
            </div>
            
            <div className="space-y-3">
              {/* Error Summary Section */}
              {(error.details.errorSummary || error.details.errorType || error.details.errorMessage) && (
                <div className="bg-gradient-to-br from-red-950/30 to-red-900/20 border border-red-500/20 rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 hover:scale-[1.02] group/card">
                  <div className="p-5 relative overflow-hidden">
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover/card:from-red-500/5 group-hover/card:to-transparent transition-all duration-500"></div>
                    
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10">
                      <button onClick={() => copyToClipboard(error.details.errorSummary || `${error.details.errorType}: ${error.details.errorMessage}`)} className="p-1.5 text-zinc-500 hover:text-zinc-300 bg-black/40 hover:bg-black/60 rounded-md backdrop-blur-xl transition-all hover:scale-110">
                        <Copy size={14} />
                      </button>
                    </div>
                    
                    <div className="flex gap-4 relative z-0">
                      <div className="p-2 bg-red-500/10 rounded-lg h-fit border border-red-500/20 shrink-0 transition-all duration-300 group-hover/card:bg-red-500/20 group-hover/card:border-red-500/40 group-hover/card:scale-110 group-hover/card:rotate-3">
                        <AlertCircle size={18} className="text-red-400 transition-all duration-300 group-hover/card:text-red-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-200 mb-2 transition-colors duration-300 group-hover/card:text-red-100">❌ Resumo do Erro</h3>
                        {error.details.errorSummary ? (
                          <div className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap transition-colors duration-300 group-hover/card:text-zinc-300">{error.details.errorSummary}</div>
                        ) : (
                          <div className="space-y-1.5">
                            {error.details.errorType && (
                              <div><span className="text-zinc-500">Tipo:</span> <code className="text-xs bg-white/10 px-2 py-0.5 rounded text-red-300 font-mono transition-all duration-300 group-hover/card:bg-white/20 group-hover/card:text-red-200">{error.details.errorType}</code></div>
                            )}
                            {error.details.errorMessage && (
                              <div><span className="text-zinc-500">Mensagem:</span> <span className="text-zinc-400 transition-colors duration-300 group-hover/card:text-zinc-300">{error.details.errorMessage}</span></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Possible Cause */}
              {error.details.possibleCause && (
                <div className="bg-gradient-to-br from-orange-950/30 to-orange-900/20 border border-orange-500/20 rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.02] group/card">
                  <div className="p-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover/card:from-orange-500/5 group-hover/card:to-transparent transition-all duration-500"></div>
                    
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10">
                      <button onClick={() => copyToClipboard(error.details.possibleCause)} className="p-1.5 text-zinc-500 hover:text-zinc-300 bg-black/40 hover:bg-black/60 rounded-md backdrop-blur-xl transition-all hover:scale-110">
                        <Copy size={14} />
                      </button>
                    </div>
                    
                    <div className="flex gap-4 relative z-0">
                      <div className="p-2 bg-orange-500/10 rounded-lg h-fit border border-orange-500/20 shrink-0 transition-all duration-300 group-hover/card:bg-orange-500/20 group-hover/card:border-orange-500/40 group-hover/card:scale-110 group-hover/card:rotate-3">
                        <Search size={18} className="text-orange-400 transition-all duration-300 group-hover/card:text-orange-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-orange-200 mb-2 transition-colors duration-300 group-hover/card:text-orange-100">🔍 Diagnóstico da Causa</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap transition-colors duration-300 group-hover/card:text-zinc-300">{error.details.possibleCause}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {(error.details.recommendation || error.details.suggestion) && (
                <div className="bg-gradient-to-br from-emerald-950/30 to-emerald-900/20 border border-emerald-500/20 rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] group/card">
                  <div className="p-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover/card:from-emerald-500/5 group-hover/card:to-transparent transition-all duration-500"></div>
                    
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10">
                      <button onClick={() => copyToClipboard(error.details.recommendation || error.details.suggestion)} className="p-1.5 text-zinc-500 hover:text-zinc-300 bg-black/40 hover:bg-black/60 rounded-md backdrop-blur-xl transition-all hover:scale-110">
                        <Copy size={14} />
                      </button>
                    </div>
                    
                    <div className="flex gap-4 relative z-0">
                      <div className="p-2 bg-emerald-500/10 rounded-lg h-fit border border-emerald-500/20 shrink-0 transition-all duration-300 group-hover/card:bg-emerald-500/20 group-hover/card:border-emerald-500/40 group-hover/card:scale-110 group-hover/card:rotate-3">
                        <TrendingUp size={18} className="text-emerald-400 transition-all duration-300 group-hover/card:text-emerald-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-emerald-200 mb-2 transition-colors duration-300 group-hover/card:text-emerald-100">✅ Ação Recomendada</h3>
                        <div className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap transition-colors duration-300 group-hover/card:text-zinc-300">{error.details.recommendation || error.details.suggestion}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dev Tip */}
              {error.details.devTip && (
                <div className="bg-gradient-to-br from-purple-950/30 to-purple-900/20 border border-purple-500/20 rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] group/card">
                  <div className="p-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover/card:from-purple-500/5 group-hover/card:to-transparent transition-all duration-500"></div>
                    
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10">
                      <button onClick={() => copyToClipboard(error.details.devTip)} className="p-1.5 text-zinc-500 hover:text-zinc-300 bg-black/40 hover:bg-black/60 rounded-md backdrop-blur-xl transition-all hover:scale-110">
                        <Copy size={14} />
                      </button>
                    </div>
                    
                    <div className="flex gap-4 relative z-0">
                      <div className="p-2 bg-purple-500/10 rounded-lg h-fit border border-purple-500/20 shrink-0 transition-all duration-300 group-hover/card:bg-purple-500/20 group-hover/card:border-purple-500/40 group-hover/card:scale-110 group-hover/card:rotate-3">
                        <Layers size={18} className="text-purple-400 transition-all duration-300 group-hover/card:text-purple-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-purple-200 mb-2 transition-colors duration-300 group-hover/card:text-purple-100">🕵️‍♂️ Dica para Devs</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap italic transition-colors duration-300 group-hover/card:text-zinc-300">{error.details.devTip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Propriedades</h3>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-[#050507] rounded-lg border border-white/5 p-3">
                 <div className="text-xs text-zinc-500 mb-1">ID da Execução</div>
                 <div className="text-sm text-zinc-300 font-mono">{error.details.executionId || 'N/A'}</div>
               </div>
               <div className="bg-[#050507] rounded-lg border border-white/5 p-3">
                 <div className="text-xs text-zinc-500 mb-1">Prioridade</div>
                 <div className="text-sm text-zinc-300">{error.priority}</div>
               </div>
               <div className="bg-[#050507] rounded-lg border border-white/5 p-3">
                 <div className="text-xs text-zinc-500 mb-1">Status</div>
                 <div className="text-sm text-zinc-300 capitalize">{error.status}</div>
               </div>
               <div className="bg-[#050507] rounded-lg border border-white/5 p-3">
                 <div className="text-xs text-zinc-500 mb-1">ID do Erro</div>
                 <div className="text-sm text-zinc-300 font-mono truncate" title={error.id}>{error.id}</div>
               </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Log Técnico</h3>
            <div className="bg-[#050507] rounded-xl border border-white/10 p-4 font-mono text-xs text-zinc-400 overflow-x-auto relative group">
              <button onClick={() => copyToClipboard(error.details.errorMessage)} className="absolute top-2 right-2 p-1.5 text-zinc-600 hover:text-zinc-300 bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={12} /></button>
              <pre className="whitespace-pre-wrap break-all">{error.details.errorMessage}</pre>
            </div>
          </div>
          
          {/* Actions */}
          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            {error.details.directLink && (
              <a href={error.details.directLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all group">
                <span>Abrir Execução no n8n</span>
                <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
            
            <div className="flex gap-3">
              {error.status !== 'resolvido' && (
                <button onClick={handleResolve} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:translate-y-[-1px]">
                  <Check size={18} />
                  Marcar como Resolvido
                </button>
              )}
              <button onClick={onClose} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl font-medium transition-colors border border-white/5">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function App() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading, uploading, updateProfile, uploadAvatar } = useProfile(user);
  const { runTour, completeTour } = useTourStatus(user);
  
  const [selectedError, setSelectedError] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('live');
  const [statusFilter, setStatusFilter] = useState<'pendente' | 'resolvido' | 'todos'>('pendente');
  const [severityFilter, setSeverityFilter] = useState<string>('todas');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isGrouped, setIsGrouped] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      const { NotificationManager } = await import('./lib/notifications');
      const swRegistered = await NotificationManager.registerServiceWorker();
      if (swRegistered) {
        const permission = await NotificationManager.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Notificações habilitadas via Service Worker');
        } else {
          console.warn('⚠️ Permissão de notificação negada');
        }
      }
    };
    setupNotifications();
  }, []);

  useEffect(() => {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.7; // Aumentado de 0.3 para 0.7
    audio.preload = 'auto';
    audio.load();
    audioRef.current = audio;

    // Listener para mensagens do Service Worker
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data.type === 'PLAY_SOUND') {
        console.log('[App] 🔊 Recebido comando do SW para tocar som');
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.error('[App] Erro ao tocar som:', e));
        }
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, []);

  const handleNewAlert = React.useCallback(async (alert: AlertItem) => {
    const workflowName = alert.workflowName || 'Workflow';
    setToast({ message: `Novo alerta: ${workflowName}`, type: 'info' });
    
    setNotifications(prev => [{
      id: alert.id,
      title: workflowName,
      message: alert.message || 'Erro detectado',
      timestamp: new Date(),
      read: false
    }, ...prev]);
    
    // SOM: Sempre tocar quando chegar erro novo
    if (audioRef.current) {
      try {
        console.log('🔊 Tentando tocar som de notificação...');
        const sound = audioRef.current.cloneNode(true) as HTMLAudioElement;
        sound.volume = 0.7; // Volume aumentado
        await sound.play();
        console.log('✅ Som tocado com sucesso!');
      } catch (e) {
        console.error('❌ Erro ao tocar som:', e);
        // Fallback: tentar tocar o áudio original
        try {
          await audioRef.current.play();
          console.log('✅ Som tocado via fallback!');
        } catch (fallbackError) {
          console.error('❌ Fallback também falhou:', fallbackError);
        }
      }
    } else {
      console.warn('⚠️ audioRef.current está null');
    }

    // NOTIFICAÇÃO CHROME: Sempre enviar
    try {
      const { NotificationManager } = await import('./lib/notifications');
      await NotificationManager.sendNotification(alert);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }, []);

  const filters = useMemo(() => ({
    searchTerm,
    status: statusFilter === 'todos' ? undefined : statusFilter === 'pendente' ? ErrorStatus.New : ErrorStatus.Resolved,
    onNewAlert: handleNewAlert
  }), [searchTerm, statusFilter, handleNewAlert]);

  const { alerts, loading: supabaseLoading, totalCount } = useAlerts({
    page: 1,
    pageSize: 100,
    filters
  });

  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    // Skeleton só aparece no carregamento inicial (login/refresh)
    if (isAuthenticated && !supabaseLoading && !initialLoadComplete) {
      const timer = setTimeout(() => {
        setLoading(false);
        setInitialLoadComplete(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, supabaseLoading, initialLoadComplete]);

  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    const mapped = alerts.map(mapSupabaseToFrontend);
    setErrors(mapped);
  }, [alerts]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) { 
        setIsFilterMenuOpen(false); 
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterRef, notificationRef]);

  const handleRefresh = () => {
    window.location.reload();
  };
  
  const handleResolve = async (ids: string | string[]) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    
    const { error } = await supabase
      .from('errors')
      .update({ status: ErrorStatus.Resolved })
      .in('id', idsArray);
    
    if (!error) {
      setErrors(prev => prev.map(err => 
        idsArray.includes(err.id) ? { ...err, status: 'resolvido' } : err
      ));
      
      if (selectedError) {
        const currentId = selectedError.id;
        if (selectedError.isGroup && selectedError.ids.some((id: string) => idsArray.includes(id))) {
             setSelectedError((prev: any) => ({ ...prev, status: 'resolvido' }));
        } else if (idsArray.includes(currentId)) {
             setSelectedError((prev: any) => ({ ...prev, status: 'resolvido' }));
        }
      }
      setToast({ message: `${idsArray.length} erro(s) resolvido(s)`, type: 'success' });
    } else {
      setToast({ message: 'Erro ao resolver', type: 'error' });
    }
  };

  const handleDelete = async (item: any, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const idsToDelete = item.isGroup ? item.ids : [item.id];
    
    const { error } = await supabase
      .from('errors')
      .delete()
      .in('id', idsToDelete);
    
    if (!error) {
      setErrors(prev => prev.filter(err => !idsToDelete.includes(err.id)));
      
      if (selectedError && idsToDelete.includes(selectedError.id)) {
          setSelectedError(null);
      }
      setToast({ message: `${idsToDelete.length} item(s) removido(s)`, type: 'success' });
    } else {
      setToast({ message: 'Erro ao deletar', type: 'error' });
    }
  };

  const processedData = useMemo(() => {
    let filtered = errors.filter(e => {
      const searchStr = `${e.workflow_name} ${e.details.errorType} ${e.details.executionId}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      let matchesStatus = (statusFilter === 'pendente') ? e.status !== 'resolvido' : (statusFilter === 'resolvido') ? e.status === 'resolvido' : true;
      let matchesSeverity = (severityFilter !== 'todas') ? e.severity === severityFilter : true;
      return matchesSearch && matchesStatus && matchesSeverity;
    });

    if (isGrouped) {
      const groups: Record<string, any> = {};
      filtered.forEach(err => {
        const key = `${err.workflow_name}|${err.node}|${err.errorCode}`;
        if (!groups[key]) {
          groups[key] = { 
            ...err, 
            count: 0, 
            ids: [], 
            isGroup: true 
          }; 
        }
        groups[key].count += 1;
        groups[key].ids.push(err.id);
        if (new Date(err.timestamp) > new Date(groups[key].timestamp)) {
            groups[key].timestamp = err.timestamp;
            groups[key].id = err.id; 
            groups[key].details = err.details; 
        }
      });
      return Object.values(groups).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return filtered;
  }, [errors, searchTerm, statusFilter, severityFilter, isGrouped]);

  useEffect(() => { setFocusedIndex(-1); }, [processedData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedError) return; 
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(prev => Math.min(prev + 1, processedData.length - 1)); } 
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(prev => Math.max(prev - 1, 0)); } 
      else if (e.key === 'Enter' && focusedIndex >= 0) { e.preventDefault(); setSelectedError(processedData[focusedIndex]); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processedData, focusedIndex, selectedError]);

  const criticalErrorsCount = errors.filter(e => e.severity === 'crítica' && e.status !== 'resolvido').length;
  const totalErrorsCount = errors.filter(e => e.status !== 'resolvido').length;
  
  if (authLoading) {
    return (
      <div className="flex h-screen bg-[#09090b] items-center justify-center">
        <div className="text-zinc-500">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-400 font-sans antialiased selection:bg-zinc-800 selection:text-zinc-200 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        body { font-family: 'Inter', sans-serif; }
        code, pre, .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes slide-in-up-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-row { animation: slide-in-up-fade 0.3s ease-out forwards; opacity: 0; }
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slide-in-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-right { animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {isSidebarOpen && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />)}



      <div className={`fixed md:static inset-y-0 left-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-6 mb-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2 text-zinc-100 font-medium tracking-tight">
            {!isCollapsed && <span className="animate-fade-in bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent font-semibold text-lg">Sentinel</span>}
          </div>
          {!isCollapsed && (<button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-zinc-500 hover:text-white"><X size={18} /></button>)}
        </div>
        <div className="px-3 space-y-1 flex-1 overflow-y-auto overflow-x-hidden">
          <NavItem icon={LayoutGrid} label="Visão Geral" active={activeView === 'overview'} onClick={() => {setActiveView('overview'); setIsSidebarOpen(false);}} collapsed={isCollapsed} />
          <NavItem icon={Activity} label="Pendentes" active={activeView === 'live'} onClick={() => {setActiveView('live'); setStatusFilter('pendente'); setIsSidebarOpen(false);}} badge={totalErrorsCount} collapsed={isCollapsed} />
          <NavItem icon={Archive} label="Resolvidos" active={activeView === 'resolved'} onClick={() => {setActiveView('resolved'); setStatusFilter('resolvido'); setIsSidebarOpen(false);}} collapsed={isCollapsed} />
          <NavItem icon={Database} label="Todos os Logs" active={activeView === 'logs'} onClick={() => {setActiveView('logs'); setStatusFilter('todos'); setIsSidebarOpen(false);}} collapsed={isCollapsed} />
          <div className="my-4 border-t border-white/5 mx-3" />
          <NavItem icon={Settings} label="Configurações" collapsed={isCollapsed} />
        </div>
        <div className="px-3 pb-2 hidden md:flex justify-end">
           <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors">{isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
        </div>
        <div className={`p-4 m-3 rounded-lg bg-zinc-900/30 border border-white/5 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded bg-gradient-to-b from-zinc-700 to-zinc-800 shrink-0" />
          {!isCollapsed && (<div className="flex flex-col overflow-hidden"><span className="text-xs font-medium text-zinc-200 truncate">Espaço de Trabalho</span><span className="text-[10px] text-zinc-500 truncate">Plano Pro</span></div>)}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
        <header className="header-logo h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#09090b]/50 backdrop-blur-xl sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-200"><Menu size={20} /></button>
            <div className="flex items-center gap-2 text-sm text-zinc-500 whitespace-nowrap overflow-hidden font-mono tracking-tight">
              <span className="hidden sm:inline">Dashboards</span><span className="hidden sm:inline text-zinc-700">/</span><span className="text-zinc-200 truncate max-w-[150px] sm:max-w-none">{activeView === 'live' ? 'Erros Abertos' : activeView === 'resolved' ? 'Resolvidos' : 'Visão Geral'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="search-bar relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" size={14} />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Pesquisar logs..." className="bg-zinc-900/50 border border-white/5 rounded-full pl-9 pr-4 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-800 transition-all w-32 md:w-64 placeholder:text-zinc-700" />
            </div>
            <button className="sm:hidden p-2 text-zinc-500 hover:text-zinc-200"><Search size={18} /></button>
            
            <div className="notifications-bell relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className={`relative p-2 transition-colors ${isNotificationsOpen ? 'text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-[#09090b]" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                    <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Notificações</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Limpar todas
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-zinc-600">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs">Nenhuma notificação</p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map((notif, i) => (
                          <div key={i} className="px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                <span className="text-sm font-medium text-zinc-200 truncate">{notif.title}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                                {notif.timestamp.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="profile-dropdown">
              <ProfileDropdown
              user={user!}
              profile={profile}
              onSignOut={async () => {
                await signOut();
                window.location.reload();
              }}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-10">
            {loading ? (
              <>
                <SkeletonKPI />
                <SkeletonKPI />
                <SkeletonKPI />
                <SkeletonKPI />
              </>
            ) : (
              <>
                <StatCard title="Erros Abertos" value={totalErrorsCount} trend="+12%" color="red" />
                <StatCard title="Tempo Médio" value="14m" trend="-8%" color="emerald" />
                <StatCard title="Erros Críticos" value={criticalErrorsCount} trend="+2" color="red" />
                <StatCard title="Erros Resolvidos" value={errors.filter(e => e.status === 'resolvido').length} trend="-5%" color="emerald" />
              </>
            )}
          </div>

          <div className="error-table rounded-xl border border-white/10 bg-[#09090b]/60 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl shadow-black/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/5 bg-zinc-900/20 gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <button onClick={() => setStatusFilter('pendente')} className={`text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'pendente' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>Abertos ({loading ? '-' : totalErrorsCount})</button>
                <button onClick={() => setStatusFilter('resolvido')} className={`text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'resolvido' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>Resolvidos</button>
                <button onClick={() => setStatusFilter('todos')} className={`text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'todos' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>Todos</button>
              </div>
              
              <div className="filter-section flex gap-2 self-end sm:self-auto relative">
                <button onClick={() => setIsGrouped(!isGrouped)} className={`p-1.5 rounded transition-colors ${isGrouped ? 'bg-white/10 text-zinc-100 border border-white/10 shadow-inner' : 'hover:bg-white/5 text-zinc-500'}`} title={isGrouped ? "Desagrupar" : "Agrupar Similares"}><Layers size={14} /></button>
                <div className="relative" ref={filterRef}>
                  <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={`p-1.5 rounded transition-colors ${isFilterMenuOpen ? 'bg-white/10 text-zinc-100' : 'hover:bg-white/5 text-zinc-500'}`} title="Filtrar"><Filter size={14} /></button>
                  {isFilterMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0c0c0e] border border-white/10 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Filtrar por Gravidade</div>
                      {['todas', 'crítica', 'alta', 'média', 'baixa'].map(sev => (
                        <button key={sev} onClick={() => { setSeverityFilter(sev); setIsFilterMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 ${severityFilter === sev ? 'text-zinc-100 bg-white/5' : 'text-zinc-400'}`}>
                          <span className="capitalize">{sev}</span>{severityFilter === sev && <Check size={12} className="text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleRefresh} className="p-1.5 rounded hover:bg-white/5 text-zinc-500 transition-colors" title="Atualizar Lista"><RefreshCw size={14} className={loading ? "animate-spin text-zinc-300" : ""} /></button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (<div className="divide-y divide-white/5">{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</div>) : (
                <table className="w-full text-left min-w-[800px] md:min-w-0">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider font-medium text-zinc-600">
                      <th className="px-6 py-3 font-medium">Prioridade</th><th className="px-6 py-3 font-medium">Workflow</th><th className="px-6 py-3 font-medium">Erro</th><th className="px-6 py-3 font-medium">Nó</th><th className="px-6 py-3 font-medium text-left">Data</th><th className="px-6 py-3 font-medium text-left">Hora</th><th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {processedData.map((error, index) => {
                      const isFocused = index === focusedIndex;
                      return (
                        <tr key={error.id} onClick={() => setSelectedError(error)} className={`group transition-colors cursor-pointer text-sm animate-row ${error.status === 'resolvido' ? 'bg-zinc-900/20 opacity-60 hover:opacity-100' : 'hover:bg-white/[0.02]'} ${isFocused ? 'bg-white/[0.03] ring-1 ring-inset ring-white/10' : ''}`} style={{ animationDelay: `${index * 30}ms` }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs font-medium text-zinc-400 capitalize">{error.priority}</span>
                          </td>
                          <td className="px-6 py-4 min-w-[200px]">
                            <div className="flex flex-col">
                              <span className={`font-medium ${error.status === 'resolvido' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`} title={error.workflow.name}>{error.workflow.name}</span>
                              <span className="text-zinc-600 text-xs mt-0.5">Backend</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-[150px]">
                            <span className="font-mono text-xs text-zinc-400 bg-white/[0.03] px-2 py-1 rounded border border-white/5" title={error.errorCode || 'N/A'}>{error.errorCode || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 min-w-[150px]" title={error.node}>{error.node}</td>
                          <td className="px-6 py-4 text-left text-zinc-500 font-mono text-xs whitespace-nowrap">{new Date(error.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                          <td className="px-6 py-4 text-left text-zinc-500 font-mono text-xs whitespace-nowrap">{new Date(error.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => handleDelete(error, e)} className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir"><Trash2 size={14} /></button>
                                {isFocused ? <CornerDownRight size={14} className="text-zinc-400" /> : <ArrowRight size={14} className="text-zinc-600" />}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {!loading && processedData.length === 0 && (<div className="py-12 text-center text-zinc-600 text-sm flex flex-col items-center gap-2"><div className="p-2 rounded-full bg-zinc-900 border border-white/5 text-zinc-700"><Check size={18} /></div><p>Nenhum registro encontrado.</p></div>)}
            </div>
            <div className="px-6 py-3 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-600 bg-zinc-900/30">
              <span>{processedData.length} registros</span>
              <div className="flex gap-3"><span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono">↓</kbd> <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono">↑</kbd> Navegar</span><span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono">ENTER</kbd> Abrir</span></div>
            </div>
          </div>
        </main>
      </div>
      <DetailSidebar error={selectedError} onClose={() => setSelectedError(null)} onResolve={handleResolve} />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        uploading={uploading}
        onUploadAvatar={uploadAvatar}
        onUpdateProfile={updateProfile}
      />
      <OnboardingTour run={runTour} onComplete={completeTour} />
    </div>
  );
}
