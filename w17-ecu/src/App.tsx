import { useState, useEffect } from 'react';
import { RaceEngineerRadio } from './components/RaceEngineerRadio';
import { useRadioCommunication } from './hooks/useRadioCommunication';
import { Activity, GitBranch, Terminal, RefreshCw, AlertTriangle, Wind, DollarSign, Target, PieChart as PieChartIcon, Star, GitFork, Cpu, Settings, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useGitHubTrending } from './hooks/useGitHubTrending';
import { useHuggingFacePapers } from './hooks/useHuggingFacePapers';
import { useWeatherRadar } from './hooks/useWeatherRadar';
import { useAgendaManager } from './hooks/useAgendaManager';
import { useFinancialTelemetry } from './hooks/useFinancialTelemetry';
import { useFocusTelemetry } from './hooks/useFocusTelemetry';
import { useCopilotConfig } from './hooks/useCopilotConfig';
import { useAIDigest } from './hooks/useAIDigest';

function App() {
  const [hoveredRepoUrl, setHoveredRepoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'github' | 'hf' | 'finance' | 'analytics' | 'digest'>('github');
  const [isReady, setIsReady] = useState(false);
  const { activeMessage, isVisible: radioVisible, sendMessage, clearMessage } = useRadioCommunication();

  // Telemetry Sensors
  const { repos, loading: githubLoading, error: githubError } = useGitHubTrending();
  const { papers, loading: hfLoading, error: hfError } = useHuggingFacePapers();
  const weather = useWeatherRadar();
  const { objectives, toggleObjectiveStatus, addObjective, deleteObjective, clearAgenda } = useAgendaManager();
  const { transactions, calculateROI, addTransaction, clearTransactions } = useFinancialTelemetry();

  // Agenda State
  const [newAgendaTitle, setNewAgendaTitle] = useState('');

  // Aero Focus Timer State
  const [focusTime, setFocusTime] = useState(0);
  const [focusState, setFocusState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [showFocusLog, setShowFocusLog] = useState(false);
  const [focusLogCategory, setFocusLogCategory] = useState('Code');
  const [focusLogDesc, setFocusLogDesc] = useState('');
  const { saveSession, getStatsByCategory, getTotalDuration, sessions, clearSessions } = useFocusTelemetry();

  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxDesc, setNewTxDesc] = useState('');
  const [newTxGain, setNewTxGain] = useState('5');

  // Copilot Digest State
  const { config, updateConfig, isConfigOpen, setIsConfigOpen } = useCopilotConfig();
  const { generateDigest, isGenerating, digest, error: digestError } = useAIDigest();
  const [digestHours, setDigestHours] = useState(24);
  const [digestCount, setDigestCount] = useState(5);

  useEffect(() => {
    // Gauge sweep animation and boot sequence
    const timer = setTimeout(() => {
      setIsReady(true);
      sendMessage("Copy that, Yang. W17 ECU V2 Telemetry online. Weather mapping active.", "hard");
    }, 1200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let focusInterval: ReturnType<typeof setInterval>;
    if (focusState === 'running') {
      focusInterval = setInterval(() => {
        setFocusTime(prev => {
          const newTime = prev + 1;
          if (newTime === 1500) { // 25 minutes pomodoro
            sendMessage("Engine overheating. Box box, Yang. Terminate focus to cool down.", "soft");
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(focusInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusState]);

  const submitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxAmount || !newTxDesc) return;
    addTransaction(parseFloat(newTxAmount), newTxDesc, parseInt(newTxGain));
    setNewTxAmount('');
    setNewTxDesc('');
    sendMessage("Financial telemetry logged. Recalculating ROI delta.", "hard");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePitEntry = (repoName: string, url: string) => {
    sendMessage(`Pit Entry confirmed. Accessing architecture for [${repoName}].`, "soft");
    window.open(url, '_blank');
  };

  const handleUpdateLog = (paperTitle: string, link: string) => {
    sendMessage(`Accessing R&D abstract: "${paperTitle.substring(0, 20)}..."`, "hard");
    window.open(link, '_blank');
  };

  const getDailyHeatmapData = () => {
    const last14Days = [...Array(14)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyTotals: Record<string, { duration: number, amount: number, gain: number }> = {};

    last14Days.forEach(date => {
      dailyTotals[date] = { duration: 0, amount: 0, gain: 0 };
    });

    sessions.forEach(s => {
      const dateStr = new Date(s.timestamp).toISOString().split('T')[0];
      if (dailyTotals[dateStr]) {
        dailyTotals[dateStr].duration += s.duration;
      }
    });

    transactions.forEach(t => {
      const dateStr = new Date(t.timestamp).toISOString().split('T')[0];
      if (dailyTotals[dateStr]) {
        dailyTotals[dateStr].amount += t.amount;
        dailyTotals[dateStr].gain += t.performanceGain;
      }
    });

    return last14Days.map(date => ({
      date,
      duration: dailyTotals[date].duration,
      amount: dailyTotals[date].amount,
      gain: dailyTotals[date].gain
    }));
  };

  const heatmapData = getDailyHeatmapData();

  const getTabClass = (tab: string) => {
    const tabs = ['github', 'hf', 'finance', 'analytics', 'digest'];
    const isActive = activeTab === tab;
    const isPast = tabs.indexOf(tab) < tabs.indexOf(activeTab);
    return `absolute inset-0 p-lg overflow-y-auto transition-fluid flex flex-col ${isActive ? 'translate-x-0 opacity-100 z-10' : isPast ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-[120%] opacity-0 pointer-events-none'}`;
  };

  // LED Shift Light Logic: 15 LEDs, mapped to focus time (0-25 min = 0-1500s)
  const getLedCount = () => {
    if (focusState === 'idle') return 0;
    return Math.min(15, Math.floor((focusTime / 1500) * 15));
  };
  const activeLeds = getLedCount();
  const isOverheat = focusTime > 1500;

  const getLedColor = (index: number) => {
    if (index < 5) return '#00A19B';  // Green (PETRONAS)
    if (index < 10) return '#FF2800'; // Red
    return '#6366F1';                 // Blue/Purple (Rev limiter)
  };

  return (
    <div className="w-screen h-screen bg-body text-detailing overflow-hidden flex flex-col font-sans select-none">
      {/* Top Telemetry Bar */}
      <header className="h-12 border-b border-white/10 flex items-center justify-between px-md shrink-0 relative bg-[#111111]/70 backdrop-blur-xl">
        <div className="flex items-center gap-sm text-signature font-mono text-sm tracking-widest">
          {/* Mercedes Three-Pointed Star - Header */}
          <svg width="18" height="18" viewBox="0 0 100 100" className="opacity-60">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#00A19B" strokeWidth="2" />
            <path d="M50 5 L50 50 L5 80" fill="none" stroke="#00A19B" strokeWidth="2" />
            <path d="M50 5 L50 50 L95 80" fill="none" stroke="#00A19B" strokeWidth="2" />
            <path d="M5 80 L50 50 L95 80" fill="none" stroke="#00A19B" strokeWidth="2" />
          </svg>
          <span>W17 // SILVER ARROW BRAIN</span>
        </div>

        {/* F1 Shift Light LED Array */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-[5px]">
          {[...Array(15)].map((_, i) => (
            <div
              key={`led-${i}`}
              className={`w-[10px] h-[10px] rounded-full transition-all duration-300 ${i < activeLeds
                ? isOverheat ? 'led-flash' : 'led-on'
                : ''
                }`}
              style={{
                backgroundColor: i < activeLeds ? getLedColor(i) : '#222',
                boxShadow: i < activeLeds ? `0 0 8px ${getLedColor(i)}, 0 0 16px ${getLedColor(i)}40` : 'none',
                border: `1px solid ${i < activeLeds ? getLedColor(i) + '80' : '#333'}`
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-md">
          <button onClick={() => setIsConfigOpen(true)} className="text-gray-500 hover:text-[#00A19B] transition-colors focus:outline-none" title="Copilot Settings">
            <Settings size={16} />
          </button>
          <div className="text-xs font-mono text-[#00A19B] ml-2">SYS: NOMINAL</div>
        </div>
      </header>

      {/* Main Pit Lane / Dashboard Area */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* Left Panel: Core Vehicle Control (Strategy & Focus) */}
        <div className="w-[300px] border-r border-white/10 flex flex-col p-4 bg-[#111111]/80 backdrop-blur-lg z-10 shrink-0 shadow-lg">
          {/* Navigation / Switch */}
          <div className="mb-6 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-[#E6E6E6] opacity-50 mb-2 uppercase font-mono">
              <div className="flex items-center gap-2"><Activity className="w-3 h-3" /> DASHBOARD</div>
            </div>

            <div className="flex bg-[#1A1A1A]/60 backdrop-blur-md rounded-lg p-1 relative border border-white/5">
              <div
                className="absolute top-1 bottom-1 w-[calc(20%-2px)] bg-[#00A19B] rounded-[2px] transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(${['github', 'hf', 'finance', 'analytics', 'digest'].indexOf(activeTab) * 100}%)`
                }}
              />

              {(['github', 'hf', 'finance', 'analytics', 'digest'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                  }}
                  className="flex-1 py-1.5 text-[10px] text-center z-10 font-mono tracking-wider text-[#E6E6E6] relative transition-colors duration-300"
                  style={{
                    color: activeTab === tab ? '#1A1A1A' : '#E6E6E6',
                    fontWeight: activeTab === tab ? 600 : 400
                  }}
                >
                  {tab === 'github' ? 'GitHub' : tab === 'hf' ? 'HF Lab' : tab === 'finance' ? 'ROI' : tab === 'analytics' ? 'Stats' : 'Digest'}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Module (Interactive Agenda) */}
          <div className="mb-8 flex flex-col max-h-[30vh]">
            <div className="flex items-center justify-between mb-3 border-b border-[#333] pb-2 shrink-0">
              <div className="text-[10px] tracking-widest text-[#00A19B] font-mono">AGENDA (NEXT LAP STRATEGY)</div>
              <div className="flex items-center gap-3">
                <button onClick={() => clearAgenda()} className="text-[#333] hover:text-[#FF2800] transition-colors" title="Purge Data">
                  <Trash2 className="w-3 h-3" />
                </button>
                <Target className="w-3 h-3 text-[#E6E6E6] opacity-50" />
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto pr-2 mb-3 flex-1 custom-scrollbar">
              {objectives.map((obj, i) => (
                <div key={obj.id} className="flex items-start justify-between group">
                  <button
                    onClick={() => toggleObjectiveStatus(obj.id)}
                    className="text-left flex items-start gap-2 flex-1"
                  >
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${obj.status === 'completed' ? 'bg-[#00A19B]' : 'bg-[#FF2800] animate-pulse'}`} />
                    <span className={`text-xs font-mono leading-tight ${obj.status === 'completed' ? 'text-[#333] line-through' : 'text-[#E6E6E6]'} transition-colors`}>
                      {obj.title}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteObjective(obj.id)}
                    className="text-[10px] text-[#333] hover:text-[#FF2800] opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 font-mono"
                  >
                    DEL
                  </button>
                </div>
              ))}
              {objectives.length === 0 && (
                <div className="text-[10px] text-[#555] font-mono italic">No objectives logged. Waiting for instructions.</div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addObjective(newAgendaTitle); setNewAgendaTitle(''); }} className="shrink-0 flex items-center border border-[#333] bg-[#0A0A0A] focus-within:border-[#00A19B] transition-colors">
              <span className="text-[#00A19B] font-mono text-xs pl-2 shrink-0">{'>'}</span>
              <input
                type="text"
                value={newAgendaTitle}
                onChange={e => setNewAgendaTitle(e.target.value)}
                placeholder="Input Target..."
                className="w-full bg-transparent text-xs text-[#E6E6E6] font-mono p-2 focus:outline-none placeholder:text-[#333]"
              />
            </form>
          </div>

          <div className="flex-1" />

          {/* Focus Timer (RPM Gauge alternative) */}
          <div className={`mb-6 rounded-md border border-[#333] bg-[#151515] p-4 flex flex-col items-center justify-center relative overflow-hidden group ${focusState === 'running' ? 'underglow-active' : ''}`}>
            {/* Mercedes Star Watermark - Focus Timer Background */}
            <svg className="star-watermark" width="180" height="180" viewBox="0 0 100 100" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E6E6E6" strokeWidth="1" />
              <path d="M50 5 L50 50 L5 80" fill="none" stroke="#E6E6E6" strokeWidth="1" />
              <path d="M50 5 L50 50 L95 80" fill="none" stroke="#E6E6E6" strokeWidth="1" />
              <path d="M5 80 L50 50 L95 80" fill="none" stroke="#E6E6E6" strokeWidth="1" />
            </svg>
            {focusState === 'running' && (
              <div className="absolute inset-0 bg-[#00A19B] opacity-[0.05] animate-pulse pointer-events-none" />
            )}
            <div className="text-[10px] tracking-widest text-[#888] font-mono mb-2 z-10">FOCUS {focusState === 'running' ? '(ACTIVE)' : focusState === 'paused' ? '(PAUSED)' : '(STANDBY)'}</div>

            {/* Simulate RPM / Focus Depth */}
            <div className={`w-32 h-32 rounded-full border border-[#333] flex items-center justify-center relative my-2 ${isReady ? 'duration-[1000ms] transition-transform ease-[cubic-bezier(0.16,1,0.3,1)] transform rotate-0' : '-rotate-90'}`}>
              {/* Progress Arc */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="64" cy="64" r="60"
                  fill="none"
                  stroke={focusTime > 1500 ? "#FF2800" : focusState === 'running' ? "#00A19B" : focusState === 'paused' ? "#FFD700" : "#222"}
                  strokeWidth="2"
                  strokeDasharray="377"
                  strokeDashoffset={focusState !== 'idle' ? 377 - ((focusTime % 1500) / 1500 * 377) : 377}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              <div className="flex flex-col items-center">
                <div className={`text-3xl font-mono tracking-tighter ${focusTime > 1500 ? 'text-[#FF2800] animate-pulse' : 'text-[#E6E6E6]'}`}>
                  {formatTime(focusTime)}
                </div>
                {focusTime > 1500 && (
                  <div className="text-[9px] text-[#FF2800] font-mono mt-1 tracking-widest animate-bounce">OVERHEAT</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 z-10 w-full justify-center px-4">
              {focusState === 'idle' ? (
                <button
                  onClick={() => { setFocusState('running'); sendMessage("Copy that. DRS enabled. Aero Focus active.", "medium", true); }}
                  className="px-6 py-2 rounded text-xs tracking-widest font-mono transition-colors border border-[#00A19B] text-[#00A19B] hover:bg-[#00A19B] hover:text-[#111]"
                >
                  START
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      const isPaused = focusState === 'paused';
                      setFocusState(isPaused ? 'running' : 'paused');
                      sendMessage(isPaused ? "Copy that. Track clear. Resuming pace." : "Box box. Telemetry paused. Checking tyre surface.", isPaused ? "soft" : "soft", isPaused);
                    }}
                    className="flex-1 py-2 rounded text-[10px] tracking-widest font-mono transition-colors border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#111]"
                  >
                    {focusState === 'paused' ? 'RESUME' : 'PAUSE'}
                  </button>
                  <button
                    onClick={() => {
                      setFocusState('idle');
                      setShowFocusLog(true);
                      sendMessage("Session complete. Great drive. Awaiting debrief.", "hard", true);
                    }}
                    className="flex-1 py-2 rounded text-[10px] tracking-widest font-mono transition-colors border border-[#FF2800] text-[#FF2800] hover:bg-[#FF2800] hover:text-[#111]"
                  >
                    FINISH (BOX)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Weather Radar */}
          <div className="mt-auto border-t border-[#333] pt-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] tracking-widest text-[#E6E6E6] font-mono opacity-50 flex items-center gap-1">
                <Wind className="w-3 h-3" /> TRACK WEATHER
              </div>
              <div className={`text-[10px] uppercase font-mono tracking-wider ${weather ? (weather.condition === 'Dry Track' ? 'text-[#FFD700]' : 'text-[#00A19B]') : 'text-[#555]'}`}>
                {weather ? weather.condition : 'OFFLINE'}
              </div>
            </div>
            {weather && (
              <div className="flex justify-between items-end mt-2">
                <div className="text-xl font-mono text-[#E6E6E6]">{weather.temperature}°C</div>
                <div className="text-xs font-mono text-[#888]">{weather.windspeed} km/h Wind</div>
              </div>
            )}
          </div>

          {/* Chassis Decal Watermarks */}
          <div className="mt-4 flex flex-col gap-1">
            <span className="decal-watermark">CHASSIS: W17</span>
            <span className="decal-watermark">PU: M15 E PERFORMANCE</span>
            <span className="decal-watermark">AERO CONFIG: HIGH DOWNFORCE</span>
          </div>
        </div>

        {/* Dynamic Center Stage (F1 Paddle Switch effect) */}
        <div className="flex-1 relative overflow-hidden bg-[#111] laser-sweep-container">
          {/* GitHub Panel */}
          <div className={getTabClass('github')}>
            <div className="flex items-center gap-3 mb-6 text-[#00A19B] shrink-0">
              <GitBranch className="w-5 h-5" />
              <h1 className="text-xl font-mono uppercase tracking-[0.2em] font-light">Global Architecture Velocity</h1>
              {githubLoading && <RefreshCw className="animate-spin text-gray-500 ml-auto" size={16} />}
            </div>

            {/* GitHub Star Matrix Heatmap */}
            {!githubLoading && !githubError && repos.length > 0 && (
              <div className="mb-8 border border-[#333] bg-[#0A0A0A] p-4 flex flex-col shrink-0">
                <div className="text-[10px] font-mono tracking-widest text-[#888] mb-3 uppercase flex justify-between items-center">
                  <span className="flex items-center gap-2"><Cpu className="w-3 h-3" /> Star Matrix Density</span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar p-1">
                  {repos.map((repo, i) => {
                    const maxStars = Math.max(...repos.map(r => r.stars));
                    const intensity = Math.max(0.1, repo.stars / maxStars);
                    const isHovered = hoveredRepoUrl === repo.url;
                    return (
                      <div
                        key={`heat-${i}`}
                        className={`w-8 h-8 rounded-[2px] transition-all cursor-pointer flex-shrink-0 group/matrix relative ${isHovered ? 'scale-110 ring-1 ring-[#00A19B] ring-offset-1 ring-offset-[#0A0A0A] z-20' : 'hover:scale-110 hover:ring-1 hover:ring-[#00A19B]/50 hover:ring-offset-1 hover:ring-offset-[#0A0A0A]'}`}
                        style={{ backgroundColor: `rgba(0, 161, 155, ${intensity})` }}
                        onClick={() => handlePitEntry(repo.name, repo.url)}
                        onMouseEnter={() => setHoveredRepoUrl(repo.url)}
                        onMouseLeave={() => setHoveredRepoUrl(null)}
                      >
                        <div className={`absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-[#222] text-[#E6E6E6] text-[10px] font-mono px-3 py-2 whitespace-nowrap z-50 pointer-events-none border border-[#444] shadow-lg flex flex-col items-center top-full mt-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                          <span>{repo.name}</span>
                          <span className="text-[#FFD700] text-[10px] mt-1 flex items-center gap-1"><Star className="w-3 h-3" /> {repo.stars}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {githubError && (
              <div className="text-sm font-mono text-[#FF2800] border border-[#FF2800] p-4 bg-[#FF2800]/10 flex items-center gap-3 mb-4">
                <AlertTriangle className="w-4 h-4" /> Data acquisition failure: {githubError}
              </div>
            )}

            {!githubLoading && !githubError && repos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
                {repos.map((repo, i) => {
                  const isHovered = hoveredRepoUrl === repo.url;
                  return (
                    <div
                      key={i}
                      className={`border bg-[#1a1a1a] transition-all p-4 group cursor-pointer relative overflow-hidden flex flex-col h-full ${isHovered
                        ? 'border-[#00A19B] -translate-y-1 shadow-[0_8px_30px_rgba(0,161,155,0.15)] z-20'
                        : 'border-[#333333] hover:border-[#00A19B] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,161,155,0.05)]'
                        }`}
                      onClick={() => handlePitEntry(repo.name, repo.url)}
                      onMouseEnter={() => setHoveredRepoUrl(repo.url)}
                      onMouseLeave={() => setHoveredRepoUrl(null)}
                    >
                      <div className={`absolute inset-0 transition-opacity pointer-events-none ${isHovered ? 'opacity-10' : 'opacity-[0.03] group-hover:opacity-10'}`} style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #00A19B 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                      <div className={`absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#00A19B]/20 to-transparent transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      <div className={`data-stream-effect mix-blend-screen ${isHovered ? 'block' : 'hidden group-hover:block'}`} />
                      <div className="text-xs text-[#888888] font-mono tracking-wider mb-2 flex justify-between items-start z-10 relative">
                        <span className="truncate pr-4 leading-tight">{repo.author} / <br /><span className="text-[#00A19B] font-bold text-sm">{repo.name}</span></span>
                        <span className="text-[#FFD700] whitespace-nowrap bg-[#222] px-1.5 py-0.5 rounded-[2px] flex items-center gap-1"><Star className="w-3 h-3" /> {repo.stars}</span>
                      </div>
                      <p className="text-sm text-[#E6E6E6] mb-4 line-clamp-2 leading-relaxed flex-grow z-10 relative mt-2">{repo.description}</p>
                      <div className="flex items-center z-10 text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-auto pt-2 border-t border-[#333] pt-3 relative justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-[2px] mr-2" style={{ backgroundColor: repo.languageColor }} />
                          {repo.language}
                        </div>
                        <div className={`flex items-center gap-1 transition-colors ${isHovered ? 'text-[#E6E6E6]' : 'text-[#888] group-hover:text-[#E6E6E6]'}`}><GitFork className="w-3 h-3" /> {repo.forks}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Hugging Face Panel */}
          <div className={getTabClass('hf')}>
            <div className="flex items-center gap-3 mb-8 text-[#00A19B] shrink-0">
              <Terminal className="w-5 h-5" />
              <h1 className="text-xl font-mono uppercase tracking-[0.2em] font-light">Cognitive Abstracts</h1>
              {hfLoading && <RefreshCw className="animate-spin text-gray-500 ml-auto" size={16} />}
            </div>

            {hfError && (
              <div className="text-sm font-mono text-[#FF2800] border border-[#FF2800] p-4 bg-[#FF2800]/10 flex items-center gap-3 shrink-0 mb-4">
                <AlertTriangle className="w-4 h-4" /> Data acquisition failure: {hfError}
              </div>
            )}

            {!hfLoading && !hfError && papers.length > 0 && (
              <div className="flex flex-col gap-3 pb-24 flex-1">
                {papers.map((paper, i) => (
                  <div key={i} className="border border-[#333333] hover:border-[#00A19B] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,161,155,0.05)] bg-[#111] p-5 cursor-pointer transition-all hover:bg-[#1A1A1A] group relative overflow-hidden" onClick={() => handleUpdateLog(paper.title, paper.link)}>
                    <div className="data-stream-effect hidden group-hover:block mix-blend-screen" />
                    <div className="flex justify-between items-start gap-4 mb-2 z-10 relative">
                      <h2 className="text-base text-[#E6E6E6] font-mono leading-tight group-hover:text-[#00A19B] transition-colors">{paper.title}</h2>
                      <span className="text-[10px] font-mono text-[#888] whitespace-nowrap bg-[#222] px-2 py-1 uppercase tracking-widest">{new Date(paper.pubDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs font-mono text-[#555] mb-3 z-10 relative">AUTHORS: {paper.creator}</div>
                    <p className="text-sm text-[#888888] line-clamp-3 leading-relaxed z-10 relative">
                      {paper.contentSnippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Telemetry View */}
          <div className={getTabClass('finance')}>
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-3 text-[#00A19B]">
                <DollarSign className="w-5 h-5" />
                <h1 className="text-xl font-mono uppercase tracking-[0.2em] font-light">Capital ROI Telemetry</h1>
              </div>
              <button
                onClick={() => clearTransactions()}
                className="flex items-center gap-2 text-[10px] font-mono text-[#555] hover:text-[#FF2800] transition-colors border border-transparent hover:border-[#FF2800] px-3 py-1 bg-[#111]"
              >
                <Trash2 className="w-3 h-3" /> PURGE DATA
              </button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 shrink-0">
              <div className="border border-[#333] bg-[#151515] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00A19B] opacity-[0.03] rotate-45 transform translate-x-8 -translate-y-8" />
                <div className="text-[10px] font-mono tracking-widest text-[#888] mb-2 uppercase">Delta (Cognitive/Capital)</div>
                <div className="text-4xl font-mono text-[#E6E6E6]">{calculateROI()} <span className="text-sm text-[#00A19B]">x</span></div>
              </div>
              <div className="border border-[#333] bg-[#111] p-6">
                <div className="text-[10px] font-mono tracking-widest text-[#888] mb-2 uppercase">Total CapEx</div>
                <div className="text-2xl font-mono text-[#FF2800]">${transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</div>
              </div>
              <div className="border border-[#333] bg-[#111] p-6">
                <div className="text-[10px] font-mono tracking-widest text-[#888] mb-2 uppercase">Knowledge Gain</div>
                <div className="text-2xl font-mono text-[#00A19B]">+{transactions.reduce((acc, t) => acc + t.performanceGain, 0)} Pts</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 pb-24">
              {/* Left: Input Form */}
              <div className="lg:col-span-1">
                <form onSubmit={submitTransaction} className="border border-[#333] bg-[#111] p-4 flex flex-col gap-4">
                  <div className="text-xs font-mono tracking-widest text-[#E6E6E6] mb-2 border-b border-[#333] pb-2 uppercase">Input Transaction</div>

                  <div>
                    <label className="block text-[10px] text-[#888] font-mono uppercase mb-1 tracking-wider">Capital Outflow ($)</label>
                    <input type="number" step="0.01" value={newTxAmount} onChange={(e) => setNewTxAmount(e.target.value)} className="w-full bg-[#1A1A1A] border border-[#333] text-sm text-[#E6E6E6] font-mono p-2 focus:outline-none focus:border-[#00A19B]" placeholder="0.00" required />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888] font-mono uppercase mb-1 tracking-wider">Description</label>
                    <input type="text" value={newTxDesc} onChange={(e) => setNewTxDesc(e.target.value)} className="w-full bg-[#1A1A1A] border border-[#333] text-sm text-[#E6E6E6] font-mono p-2 focus:outline-none focus:border-[#00A19B]" placeholder="e.g., API Credits" required />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888] font-mono uppercase mb-1 tracking-wider flex justify-between">
                      <span>Cognitive Gain (0-10)</span>
                      <span className="text-[#00A19B]">{newTxGain}</span>
                    </label>
                    <input type="range" min="0" max="10" value={newTxGain} onChange={(e) => setNewTxGain(e.target.value)} className="w-full accent-[#00A19B]" />
                  </div>

                  <button type="submit" className="mt-4 bg-[#222] border border-[#333] text-[#E6E6E6] font-mono text-xs py-2 uppercase tracking-widest hover:border-[#00A19B] hover:text-[#00A19B] transition-colors">
                    Commit
                  </button>
                </form>
              </div>

              {/* Right: Ledger History */}
              <div className="lg:col-span-2 overflow-y-auto">
                <div className="text-xs font-mono tracking-widest text-[#888] mb-4 uppercase">Ledger History</div>
                {transactions.length === 0 ? (
                  <div className="text-sm font-mono text-[#555] py-4 text-center border border-dashed border-[#333]">No transactions logged.</div>
                ) : (
                  <div className="space-y-2">
                    {transactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between border border-[#333] bg-[#111] py-3 px-4 group hover:border-[#00A19B] transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-mono text-[#E6E6E6]">{tx.description}</span>
                          <span className="text-[10px] font-mono text-[#555] mt-1">{new Date(tx.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-[10px] text-[#888] font-mono tracking-widest block uppercase mb-0.5">Gain</span>
                            <span className="text-xs font-mono text-[#00A19B]">+{tx.performanceGain}</span>
                          </div>
                          <div className="text-right w-20">
                            <span className="text-[10px] text-[#888] font-mono tracking-widest block uppercase mb-0.5">Amount</span>
                            <span className="text-xs font-mono text-[#FF2800]">-${tx.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analytics Telemetry View */}
          <div className={getTabClass('analytics')}>
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-3 text-[#00A19B]">
                <PieChartIcon className="w-5 h-5" />
                <h1 className="text-xl font-mono uppercase tracking-[0.2em] font-light">Aero Focus Analytics</h1>
              </div>
              <button
                onClick={() => clearSessions()}
                className="flex items-center gap-2 text-[10px] font-mono text-[#555] hover:text-[#FF2800] transition-colors border border-transparent hover:border-[#FF2800] px-3 py-1 bg-[#111]"
              >
                <Trash2 className="w-3 h-3" /> PURGE DATA
              </button>
            </div>

            <div className="flex gap-8 mb-8 shrink-0">
              <div className="border border-[#333] bg-[#151515] p-6 flex-[2] relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,161,155,0.05)] transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00A19B] opacity-[0.03] rotate-45 transform translate-x-8 -translate-y-8" />
                <div className="text-[10px] font-mono tracking-widest text-[#888] mb-2 uppercase">Total Focus Driven</div>
                <div className="text-4xl font-mono text-[#E6E6E6]">{formatTime(getTotalDuration())}</div>
              </div>
              <div className="border border-[#333] bg-[#111] p-6 flex-1 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,161,155,0.05)] transition-all">
                <div className="text-[10px] font-mono tracking-widest text-[#888] mb-2 uppercase">Sessions Logged</div>
                <div className="text-4xl font-mono text-[#00A19B]">{sessions.length}</div>
              </div>

              {/* 14-Day Heatmap */}
              <div className="border border-[#333] bg-[#0A0A0A] p-4 flex-[3] flex flex-col hover:-translate-y-0.5 transition-all underglow-active">
                <div className="text-[10px] font-mono tracking-widest text-[#888] mb-3 uppercase flex justify-between">
                  <span>Unified Telemetry History (14 Days)</span>
                  <span className="text-[#00A19B]">Focus & ROI Intensity</span>
                </div>
                <div className="flex-1 flex items-end justify-between gap-1">
                  {heatmapData.map((d, i) => {
                    const activityScore = d.duration + (d.gain * 300); // Base intensity on focus time + cognitive gain
                    const intensity = Math.min(activityScore / 4000, 1);
                    const bg = activityScore > 0 ? `rgba(0, 161, 155, ${Math.max(0.2, intensity)})` : '#111';

                    return (
                      <div key={d.date} className="w-full flex flex-col justify-end group/heat relative" style={{ height: '100%' }}>
                        <div className="w-full rounded-[2px] transition-colors relative overflow-hidden" style={{ height: `${Math.max(10, intensity * 100)}%`, backgroundColor: bg }}>
                          {d.amount > 0 && <div className="absolute bottom-0 left-0 right-0 bg-[#FF2800] opacity-50" style={{ height: `${Math.min(d.amount, 100)}%` }} />}
                        </div>
                        <div className="absolute top-[-55px] left-1/2 -translate-x-1/2 bg-[#222] text-[#E6E6E6] text-[9px] font-mono px-2 py-1.5 opacity-0 group-hover/heat:opacity-100 whitespace-nowrap z-10 pointer-events-none flex flex-col gap-0.5 border border-[#333] shadow-lg">
                          <span className="text-[#888] mb-1">{d.date.slice(5)}</span>
                          <span className="text-[#00A19B]">FOCUS: {formatTime(d.duration)}</span>
                          {d.amount > 0 && <span className="text-[#FF2800]">SPENT: ${d.amount.toFixed(2)}</span>}
                          {d.gain > 0 && <span className="text-[#FFD700]">GAIN: +{d.gain}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-8 flex-1 min-h-[300px] mb-8">
              <div className="flex-1 border border-[#333] bg-[#111] p-6 flex flex-col hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,161,155,0.05)] transition-all">
                <div className="text-xs font-mono tracking-widest text-[#888] mb-6 uppercase border-b border-[#333] pb-2">Session Distribution</div>
                {sessions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-[#555] font-mono text-sm border border-dashed border-[#333]">No data available. Deploy focus to record telemetry.</div>
                ) : (
                  <div className="flex-1 min-h-0 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getStatsByCategory()}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          stroke="none"
                        >
                          {getStatsByCategory().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#00A19B', '#FF2800', '#FFD700', '#333'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#E6E6E6', fontFamily: 'monospace' }}
                          itemStyle={{ color: '#00A19B' }}
                          formatter={(value: any) => formatTime(value as number)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="flex-1 border border-[#333] bg-[#0A0A0A] p-6 flex flex-col overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,161,155,0.05)] transition-all group relative underglow-active">
                <div className="absolute inset-0 bg-[#00A19B] opacity-0 group-hover:opacity-[0.02] transition-opacity duration-1000" />
                <div className="text-xs font-mono tracking-widest text-[#888] mb-6 uppercase border-b border-[#333] pb-2 z-10">Wind Tunnel Analytics (Radar)</div>
                {sessions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-[#555] font-mono text-sm border border-dashed border-[#333]">Insufficient Aero Data.</div>
                ) : (
                  <div className="flex-1 min-h-0 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getStatsByCategory()}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                        <Radar name="Focus Dist" dataKey="value" stroke="#00A19B" fill="#00A19B" fillOpacity={0.2} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#E6E6E6', fontFamily: 'monospace', fontSize: '10px' }}
                          itemStyle={{ color: '#00A19B' }}
                          formatter={(value: any) => formatTime(value as number)}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Race Engineering Decal Strip */}
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#222]">
              <div className="flex gap-6">
                <span className="decal-watermark" style={{ fontSize: '8px', opacity: 0.08 }}>MERCEDES-AMG F1 W17</span>
                <span className="decal-watermark" style={{ fontSize: '8px', opacity: 0.08 }}>EQ POWER+</span>
              </div>
              <div className="flex gap-6">
                <span className="decal-watermark" style={{ fontSize: '8px', opacity: 0.08 }}>PETRONAS</span>
                <span className="decal-watermark" style={{ fontSize: '8px', opacity: 0.08 }}>INEOS</span>
              </div>
            </div>
          </div>

          {/* Digest Telemetry View */}
          <div className={getTabClass('digest')}>
            <div className="flex items-center gap-3 mb-6 text-[#00A19B] shrink-0">
              <FileText className="w-5 h-5" />
              <h1 className="text-xl font-mono uppercase tracking-[0.2em] font-light">Tactical Briefing</h1>
              {isGenerating && <RefreshCw className="animate-spin text-[#00A19B] ml-auto" size={16} />}
            </div>

            <div className="flex gap-4 mb-6 shrink-0 border border-[#333] p-4 bg-[#111] items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#888] font-mono uppercase tracking-widest">Timeframe</span>
                <select value={digestHours} onChange={e => setDigestHours(Number(e.target.value))} className="bg-[#1A1A1A] border border-[#333] text-sm text-[#E6E6E6] font-mono p-1 focus:outline-none focus:border-[#00A19B]">
                  <option value={24}>24 Hours</option>
                  <option value={72}>72 Hours</option>
                  <option value={168}>168 Hours</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#888] font-mono uppercase tracking-widest">Top N Content</span>
                <select value={digestCount} onChange={e => setDigestCount(Number(e.target.value))} className="bg-[#1A1A1A] border border-[#333] text-sm text-[#E6E6E6] font-mono p-1 focus:outline-none focus:border-[#00A19B]">
                  <option value={3}>Top 3</option>
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                </select>
              </div>
              <button
                onClick={() => {
                  if (!config.apiKey) {
                    setIsConfigOpen(true);
                  } else {
                    sendMessage("Initializing AI Digest Protocol. Analyzing telemetry...", "hard");
                    generateDigest(config, repos, papers, digestHours, digestCount);
                  }
                }}
                disabled={isGenerating || githubLoading || hfLoading}
                className="ml-auto bg-[#00A19B]/10 border border-[#00A19B] text-[#00A19B] font-mono text-xs px-6 py-2 uppercase tracking-widest hover:bg-[#00A19B] hover:text-[#111] transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Compiling...' : 'Generate Digest'}
              </button>
            </div>

            {digestError && (
              <div className="text-sm font-mono text-[#FF2800] border border-[#FF2800] p-4 bg-[#FF2800]/10 flex items-center gap-3 shrink-0 mb-4">
                <AlertTriangle className="w-4 h-4" /> Copilot Error: {digestError}
              </div>
            )}

            {!isGenerating && digest && digest.length > 0 && (
              <div className="flex flex-col gap-6 pb-24 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {digest.map((item, i) => (
                  <div key={item.id} className="border border-[#333] bg-[#0A0A0A] p-6 relative group hover:border-[#00A19B] transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-50 font-mono text-4xl text-[#222] pointer-events-none group-hover:text-[#00A19B]/20 transition-colors">#{i + 1}</div>

                    <div className="mb-3 flex items-center gap-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] ${item.type === 'github' ? 'bg-[#E6E6E6] text-[#111]' : 'bg-[#00A19B]/20 text-[#00A19B]'}`}>
                        {item.type === 'github' ? 'ARCHITECTURE' : 'RESEARCH'}
                      </span>
                      <span className="text-[#FFD700] text-[10px] font-mono flex items-center gap-1">IMPACT: {item.score}</span>
                    </div>

                    <h2 className="text-xl text-[#00A19B] font-[500] leading-tight mb-2 pr-12">{item.title}</h2>
                    <p className="text-xs text-[#555] font-mono mb-6 pb-4 border-b border-[#333]">{item.sourceTitle}</p>

                    <ul className="space-y-3 mb-6 text-sm text-[#E6E6E6] leading-relaxed">
                      {item.summary.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-[#00A19B] mt-1 shrink-0 text-xs">▹</span>
                          <span className="tracking-wide text-[#ccc]">{point}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        sendMessage(`Accessing raw intel: ${item.sourceTitle.substring(0, 20)}...`, "hard");
                        window.open(item.link, '_blank');
                      }}
                      className="text-[10px] font-mono text-[#888] flex items-center gap-2 hover:text-[#00A19B] transition-colors uppercase tracking-widest bg-[#151515] hover:bg-[#1A1A1A] py-2 px-4 border border-[#333] hover:border-[#00A19B] w-fit"
                    >
                      <ExternalLink className="w-3 h-3" /> ACCESS ORIGINAL SOURCE
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!isGenerating && (!digest || digest.length === 0) && !digestError && (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#333] text-[#555] font-mono">
                <FileText className="w-12 h-12 mb-4 opacity-30" />
                <p className="tracking-widest uppercase text-xs mb-2">Awaiting Digest Generation</p>
                <p className="text-[10px] text-[#444]">Configure Copilot API to enable automated intelligence briefing.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global Radio Component */}
      {/* Engineer Radio */}
      <RaceEngineerRadio
        message={activeMessage?.text || ''}
        priority={activeMessage?.priority}
        isVisible={radioVisible}
        onDismiss={clearMessage}
      />

      {/* Pit Stop Debrief Modal (Focus Log) */}
      {showFocusLog && (
        <div className="fixed inset-0 bg-[#0A0A0A]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,161,155,0.1)]">
            <div className="text-[#00A19B] font-mono tracking-[0.2em] mb-6 border-b border-[#333] pb-2 text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> PIT STOP DEBRIEF
            </div>

            <div className="flex justify-between items-center mb-6 bg-[#151515] p-4 border border-[#333]">
              <div className="text-[10px] text-[#888] font-mono tracking-widest uppercase">Session Distance</div>
              <div className="text-2xl font-mono text-[#E6E6E6]">{formatTime(focusTime)}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#888] font-mono uppercase mb-2 tracking-wider">Telemetry Category</label>
                <select
                  value={focusLogCategory}
                  onChange={e => setFocusLogCategory(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] text-sm text-[#E6E6E6] font-mono p-2 focus:outline-none focus:border-[#00A19B]"
                >
                  <option value="Code">Code</option>
                  <option value="Research">Research</option>
                  <option value="Writing">Writing</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#888] font-mono uppercase mb-2 tracking-wider">Mission Debrief</label>
                <textarea
                  value={focusLogDesc}
                  onChange={e => setFocusLogDesc(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] text-sm text-[#E6E6E6] font-mono p-2 focus:outline-none focus:border-[#00A19B] min-h-[100px] resize-none"
                  placeholder="Enter session notes..."
                />
              </div>

              <div className="flex gap-4 pt-4 mt-4 border-t border-[#333]">
                <button
                  onClick={() => {
                    saveSession(focusTime, focusLogCategory, focusLogDesc || 'No debrief provided.');
                    setFocusTime(0);
                    setFocusLogDesc('');
                    setShowFocusLog(false);
                    sendMessage("Debrief logged to telemetry. Ready for next stint.", "soft");
                  }}
                  className="flex-1 bg-[#00A19B]/10 border border-[#00A19B] text-[#00A19B] font-mono text-xs py-2 uppercase tracking-widest hover:bg-[#00A19B] hover:text-[#111] transition-colors"
                >
                  Submit Log
                </button>
                <button
                  onClick={() => {
                    setFocusTime(0);
                    setFocusLogDesc('');
                    setShowFocusLog(false);
                    sendMessage("Debrief discarded.", "soft");
                  }}
                  className="flex-1 bg-[#222] border border-[#333] text-[#888] font-mono text-xs py-2 uppercase tracking-widest hover:border-[#FF2800] hover:text-[#FF2800] transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copilot Config Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-[#0A0A0A]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,161,155,0.1)]">
            <div className="text-[#00A19B] font-mono tracking-[0.2em] mb-6 border-b border-[#333] pb-2 text-sm flex items-center gap-2">
              <Settings size={16} /> COPILOT ENGINE CONFIG
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#888] font-mono uppercase mb-2 tracking-wider">Base URL</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={e => updateConfig({ baseUrl: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] text-sm text-[#E6E6E6] font-mono p-2 focus:outline-none focus:border-[#00A19B]"
                  placeholder="https://api.openai.com/v1"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#888] font-mono uppercase mb-2 tracking-wider">Model Name</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={e => updateConfig({ model: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] text-sm text-[#E6E6E6] font-mono p-2 focus:outline-none focus:border-[#00A19B]"
                  placeholder="gpt-4o-mini"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#888] font-mono uppercase mb-2 tracking-wider">Bearer API Key (Local Storage Only)</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => updateConfig({ apiKey: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] text-sm text-[#E6E6E6] font-mono p-2 focus:outline-none focus:border-[#00A19B]"
                  placeholder="sk-..."
                />
              </div>

              <div className="flex gap-4 pt-4 mt-4 border-t border-[#333]">
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="flex-1 bg-[#00A19B]/10 border border-[#00A19B] text-[#00A19B] font-mono text-xs py-2 uppercase tracking-widest hover:bg-[#00A19B] hover:text-[#111] transition-colors"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
