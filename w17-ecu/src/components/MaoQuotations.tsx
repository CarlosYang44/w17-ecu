import { useState, useEffect } from 'react';
import { ShieldAlert, Crosshair, KeyRound, Loader2, Save } from 'lucide-react';

type AnxietyLevel = 'L1' | 'L2' | 'L3';

interface Quote {
  text: string;
  source: string;
}

const QUOTATIONS: Record<AnxietyLevel, Quote[]> = {
  L1: [
    { text: "星星之火，可以燎原。", source: "《星星之火，可以燎原》" },
    { text: "前途是光明的，道路是曲折的。", source: "《关于重庆谈判》" },
    { text: "世上无难事，只要肯登攀。", source: "《水调歌头·重上井冈山》" },
    { text: "错误和挫折教训了我们，使我们比较地聪明起来了，我们的情就办得好一些。", source: "《论人民民主专政》" }
  ],
  L2: [
    { text: "战略上藐视敌人，战术上重视敌人。", source: "在莫斯科共产党和工人党代表会议上的讲话" },
    { text: "不要发慌。你要对付他，就要摸他的规律。你摸清了他的规律，就能对付他了。", source: "在中共八届十中全会上的讲话" },
    { text: "我们的责任，是向人民负责。即使是失误，只要是为了人民，也就值得。", source: "《为人民服务》" },
    { text: "什么叫工作，工作就是斗争。那些地方有困难、有问题，需要我们去解决。我们是为着解决困难去工作、去斗争的。", source: "《关于重庆谈判》" }
  ],
  L3: [
    { text: "丢掉幻想，准备斗争。", source: "《丢掉幻想，准备斗争》" },
    { text: "扫帚不到，灰尘照例不会自己跑掉。", source: "《抗日战争胜利后的时局和我们的方针》" },
    { text: "下定决心，不怕牺牲，排除万难，去争取胜利。", source: "《愚公移山》" },
    { text: "在战略上要藐视一切敌人，在战术上要重视一切敌人。也就是说，在整体上我们必然要打倒他们，在每一个具体问题上决不可轻视他们。", source: "《毛泽东选集》" }
  ]
};

export function MaoQuotations() {
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [activeLevel, setActiveLevel] = useState<AnxietyLevel | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  
  const [isFetching, setIsFetching] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const [quoteHistory, setQuoteHistory] = useState<string[]>([]);

  useEffect(() => {
    const storedKey = localStorage.getItem('mz_gemini_key');
    if (storedKey) {
      setGeminiKey(storedKey);
      setTempKey(storedKey);
    }
    
    // Load historical quotes to prevent repetition
    const storedHistory = localStorage.getItem('mz_quote_history');
    if (storedHistory) {
      try {
        setQuoteHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse quote history", e);
      }
    }
  }, []);

  const handleSaveKey = () => {
    setGeminiKey(tempKey);
    localStorage.setItem('mz_gemini_key', tempKey);
    setShowConfig(false);
  };

  const handleProtocolTrigger = async (level: AnxietyLevel) => {
    if (isTyping || isFetching) return;
    
    setActiveLevel(level);
    let newQuote: Quote | null = null;
    
    if (geminiKey) {
      setIsFetching(true);
      try {
        // Construct history constraint
        const historyConstraint = quoteHistory.length > 0 
          ? `\n\nCRITICAL CONSTRAINT: You MUST NOT generate any of the following quotes. They have been shown recently:\n${quoteHistory.map((q, i) => `${i+1}. "${q}"`).join('\n')}\nPick a completely different quote.`
          : '';

        const prompt = `You are a strategic morale advisor embedded within a high-tech F1 telemetry dashboard. 
The user has triggered the "M.Z. Protocol" (Mao Zedong Selected Works Push) at stress level: ${level}.
Level 1 (LOW GRIP): Mild anxiety/friction. Provide a quote about long-termism, encouragement, and persistence.
Level 2 (HIGH DEG): High difficulty/stress, significant degradation. Provide a quote about tactical methodology, strategic focus, and overcoming immense challenges.
Level 3 (ENGINE FAIL): Extreme panic, breakdown, or near giving up. Provide a quote about bottom-line resilience, absolute survival, and extreme combat mindset.

Generate ONE highly authentic, powerful quotation from Mao Zedong's works that perfectly matches this anxiety level. ${historyConstraint}

Output MUST be strictly valid JSON without markdown wrapping, using exactly these two keys:
{
  "text": "The quotation in Chinese",
  "source": "The book or speech it came from"
}`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9,
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) throw new Error("API Request Failed");
        
        const data = await response.json();
        const textResp = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (textResp) {
          try {
            const parsed = JSON.parse(textResp);
            if (parsed.text && parsed.source) {
              newQuote = parsed;
              
              // Add to history to prevent future repetition (keep trailing 30)
              setQuoteHistory(prev => {
                const updated = [parsed.text, ...prev].slice(0, 30);
                localStorage.setItem('mz_quote_history', JSON.stringify(updated));
                return updated;
              });
            }
          } catch(e) {
            console.error("Failed to parse Gemini JSON:", e);
          }
        }
      } catch (err) {
        console.error("Gemini execution failed, reverting to cached protocols:", err);
      }
      setIsFetching(false);
    }
    
    if (!newQuote) {
      const quotes = QUOTATIONS[level];
      newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }
    
    setActiveQuote(newQuote);
    setDisplayedText(""); // initial wipe
    setIsTyping(true);
  };

  // Fixed Typewriter logic using substring mapping to avoid StrictMode double-fire bugs
  useEffect(() => {
    if (!isTyping || !activeQuote) return;

    let index = 0;
    setDisplayedText(""); // guarantee clear
    
    const interval = setInterval(() => {
      index++;
      // Ensures accurate per-character tracking decoupled from prev state captures
      setDisplayedText(activeQuote.text.substring(0, index));

      if (index >= activeQuote.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 40); 

    return () => clearInterval(interval);
  }, [activeQuote, isTyping]);

  return (
    <div className="mt-6 pt-6 border-t border-[#333] relative">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] tracking-widest text-[#FFD700] p-1 font-mono uppercase flex items-center gap-2 border border-[#FFD700]/30 bg-[#FFD700]/5 rounded-sm px-2">
          <ShieldAlert className="w-3 h-3 text-[#FFD700]" /> 
          Strategic Override: M.Z. Protocol
        </div>
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className={`p-1 rounded transition-colors ${geminiKey ? 'text-[#00A19B] bg-[#00A19B]/10 hover:bg-[#00A19B]/20' : 'text-[#888] hover:text-[#E6E6E6]'}`}
          title="Configure API Connection"
        >
          <KeyRound className="w-3 h-3" />
        </button>
      </div>

      {showConfig && (
        <div className="mb-3 p-2 border border-[#333] bg-[#0F0F0F] rounded-sm flex gap-2 overflow-hidden">
          <input 
            type="password"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="Gemini API Key..."
            className="flex-1 bg-transparent text-[#E6E6E6] text-[10px] font-mono focus:outline-none placeholder:text-[#555]"
          />
          <button onClick={handleSaveKey} className="text-[#00A19B] hover:text-[#fff] transition-colors shrink-0">
            <Save className="w-3 h-3" />
          </button>
        </div>
      )}
      
      <div className="flex gap-2 mb-3">
        {(['L1', 'L2', 'L3'] as AnxietyLevel[]).map((level) => {
          const isActive = activeLevel === level;
          const config = {
            L1: { label: 'LOW GRIP', color: '#00A19B', hover: 'hover:bg-[#00A19B]/20', border: 'border-[#00A19B]/30', text: 'text-[#00A19B]' },
            L2: { label: 'HIGH DEG', color: '#FFD700', hover: 'hover:bg-[#FFD700]/20', border: 'border-[#FFD700]/30', text: 'text-[#FFD700]' },
            L3: { label: 'ENGINE FAIL', color: '#FF2800', hover: 'hover:bg-[#FF2800]/20', border: 'border-[#FF2800]/30', text: 'text-[#FF2800]' },
          }[level];

          return (
            <button
              key={level}
              onClick={() => handleProtocolTrigger(level)}
              disabled={isTyping || isFetching}
              className={`flex-1 flex max-w-full overflow-hidden items-center justify-center py-1.5 px-1 border rounded-sm text-[9px] font-mono tracking-wider transition-all
                ${isActive ? `bg-[${config.color}]/10 border-[${config.color}]` : `${config.border} bg-[#111]`}
                ${!(isTyping || isFetching) && config.hover} ${config.text}
                ${(isTyping || isFetching) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title="Assess Stress Level"
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {level}: {config.label}
              </div>
            </button>
          )
        })}
      </div>

      <div className="min-h-[85px] bg-[#0A0A0A] border border-[#333] p-3 rounded-sm relative overflow-hidden flex flex-col justify-center">
        <div className="absolute inset-0 pointer-events-none z-10 opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        
        {isFetching ? (
          <div className="flex flex-col items-center justify-center gap-2 z-20">
            <Loader2 className="w-4 h-4 text-[#00A19B] animate-spin" />
            <div className="text-[9px] text-[#00A19B] font-mono tracking-widest uppercase animate-pulse">
              Engineering Context...
            </div>
          </div>
        ) : !activeQuote ? (
          <div className="text-[#444] text-[10px] font-mono uppercase tracking-widest text-center">
            Awaiting Protocol Invocation...
          </div>
        ) : (
          <div className="relative z-20">
            <div className={`text-sm font-semibold mb-2 leading-relaxed tracking-wide font-serif
              ${activeLevel === 'L1' ? 'text-[#00A19B]' : activeLevel === 'L2' ? 'text-[#FFD700]' : 'text-[#FF2800]'}
            `}>
              {displayedText.length > 0 && `"${displayedText}${isTyping ? '"' : '"'}`}
              {isTyping && <span className="animate-[pulse_0.4s_ease-in-out_infinite] inline-block w-1.5 h-3 bg-current ml-0.5 align-middle" />}
            </div>
            {!isTyping && displayedText.length > 0 && (
              <div className="text-[10px] text-[#888] font-mono tracking-widest uppercase flex items-center justify-end gap-1 mt-2 border-t border-[#222] pt-2">
                <Crosshair className="w-3 h-3 text-[var(--accent-color)]" style={{ '--accent-color': activeLevel === 'L1' ? '#00A19B' : activeLevel === 'L2' ? '#FFD700' : '#FF2800' } as React.CSSProperties} />
                — {activeQuote.source}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
