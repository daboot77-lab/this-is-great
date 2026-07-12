import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  Map, 
  ArrowRight, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Code, 
  Download, 
  Copy, 
  Calendar, 
  Inbox, 
  Earth,
  Heart,
  HelpCircle,
  Clock,
  Settings,
  Eye,
  EyeOff,
  Key,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { streamlitCodeString } from "./codeString";
import GyeonwooCharacter from "./components/GyeonwooCharacter";
import JignyeoCharacter from "./components/JignyeoCharacter";

const STORAGE_KEY = "gyeonwoo_gemini_key";

async function generateWishBlessing(apiKey: string, name: string, wishContent: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `당신은 하늘나라의 견우와 직녀입니다. 지상에서 ${name}이라는 분이 "「${wishContent}」"라는 소원을 은하수로 보내왔습니다.
견우와 직녀의 목소리로, 따뜻하고 시적인 한국어 축복 메시지를 2~3문장으로 짧게 작성해주세요.
형식: "견우: [견우의 말] / 직녀: [직녀의 말]" 형식으로 작성하되, 내용은 자연스럽고 감동적으로 써주세요.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text ?? "";
}

// Define the steps of our state machine
type Step = "ready" | "spring_autumn" | "chilseok" | "bridge" | "wish" | "complete";

// Interface for saved wishes
interface Wish {
  id: number;
  name: string;
  content: string;
  time: string;
}

export default function App() {
  // 1. Core State variables
  const [step, setStep] = useState<Step>(() => {
    const savedStep = sessionStorage.getItem("gyeonwoo_step");
    return (savedStep as Step) || "ready";
  });

  const [wishes, setWishes] = useState<Wish[]>(() => {
    const savedWishes = sessionStorage.getItem("gyeonwoo_wishes");
    return savedWishes ? JSON.parse(savedWishes) : [];
  });

  const [nameInput, setNameInput] = useState("");
  const [wishInput, setWishInput] = useState("");
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanderOpen, setIsExpanderOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"simulator" | "code">("simulator");
  const [copied, setCopied] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  // API Key settings state
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? "");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyText, setShowApiKeyText] = useState(false);
  const [rememberKey, setRememberKey] = useState<boolean>(() => !!localStorage.getItem(STORAGE_KEY));
  const [aiWishResponse, setAiWishResponse] = useState<string | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  // States to track active voice narration & dialog bubbles
  const [currentSpeaker, setCurrentSpeaker] = useState<"narrator" | "gyeonwoo" | "jignyeo" | null>(null);
  const [spokenText, setSpokenText] = useState("");
  const [koVoices, setKoVoices] = useState<SpeechSynthesisVoice[]>([]);

  // References for timeline timers to prevent memory leaks and parallel execution bugs
  const timersRef = useRef<any[]>([]);
  const previousStep = useRef<Step | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpinningRef = useRef(isSpinning);
  const stepRef = useRef(step);

  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Clean up all running timeline timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // Handle fallback/safety-net auto-advance
  useEffect(() => {
    if (!isSpinning) return;
    
    // Clear any previous advance timers
    clearAllTimers();

    const delay = audioEnabled ? 100000 : 9000; // 100s safety net if talking, 9s if silent
    
    const advanceTimeout = setTimeout(() => {
      if (step === "spring_autumn") {
        setStep("chilseok");
      } else if (step === "chilseok") {
        setStep("bridge");
      } else if (step === "bridge") {
        setStep("wish");
      }
    }, delay);
    
    timersRef.current.push(advanceTimeout);
    return () => clearTimeout(advanceTimeout);
  }, [step, isSpinning, audioEnabled]);

  // Monitor voice changes for speech synthesis
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const allVoices = window.speechSynthesis.getVoices();
        const filtered = allVoices.filter(v => v.lang.includes("ko"));
        setKoVoices(filtered);
      }
    };
    updateVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // 2. Persist state changes in sessionStorage
  useEffect(() => {
    sessionStorage.setItem("gyeonwoo_step", step);
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem("gyeonwoo_wishes", JSON.stringify(wishes));
  }, [wishes]);

  // 3. Korean TTS (Web Speech API) helper
  const speakKorean = (text: string, options?: { pitch?: number; rate?: number; voice?: SpeechSynthesisVoice }) => {
    if (!audioEnabled) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = options?.rate || 0.95;
      utterance.pitch = options?.pitch || 1.0;

      if (options?.voice) {
        utterance.voice = options.voice;
      } else {
        const voices = window.speechSynthesis.getVoices();
        const koVoice = voices.find(v => v.lang.includes("ko"));
        if (koVoice) {
          utterance.voice = koVoice;
        }
      }
      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Drama sequence speech synthesis (Narrator, Gyeonwoo, Jignyeo in turn with voice features)
  const speakStepSequence = (currentStep: Step) => {
    if (!audioEnabled) return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const narration = getNarrationText(currentStep);
    const gyeonwoo = getGyeonwooDialogue(currentStep);
    const jignyeo = getJignyeoDialogue(currentStep);

    // Filter Korean voices to find suitable male/female or general voices
    const voices = window.speechSynthesis.getVoices();
    const ko = voices.filter(v => v.lang.includes("ko"));
    
    // Attempt to detect male or female Korean voices based on naming patterns
    const maleVoice = ko.find(v => {
      const name = v.name.toLowerCase();
      return name.includes("male") || name.includes("남성") || name.includes("gildong") || name.includes("minsu") || name.includes("sangwook") || name.includes("hyeondo") || (name.includes("heami") === false && name.includes("yumi") === false && name.includes("kyuri") === false && name.includes("yuna") === false && name.includes("seoyon") === false && name.includes("chohee") === false && name.includes("sinji") === false && name.includes("nuri") === false && name.includes("google") === false);
    }) || ko[0] || null;

    const femaleVoice = ko.find(v => {
      const name = v.name.toLowerCase();
      return name.includes("female") || name.includes("여성") || name.includes("yumi") || name.includes("kyuri") || name.includes("heami");
    }) || ko[0] || null;

    const baseVoice = ko[0] || null;

    // Build the sequential reading queue with speaker metadata
    const queue: { text: string; pitch: number; rate: number; voice: SpeechSynthesisVoice | null; speaker: "narrator" | "gyeonwoo" | "jignyeo" }[] = [];

    // 1. Narrator (calm voice)
    if (narration) {
      queue.push({ text: narration, pitch: 1.0, rate: 0.95, voice: baseVoice, speaker: "narrator" });
    }

    // 2. Gyeonwoo (Altair - Deep resonant male voice applied to his entire dialogue block)
    if (gyeonwoo) {
      let pitch = 0.72; // Deep resonant baritone male voice by default (preventing cracking)
      let rate = 0.88;  // Thicker slower rate
      if (currentStep === "spring_autumn") {
        pitch = 0.65;  // Even deeper sorrowful baritone voice (safe DSP range)
        rate = 0.82;   // Slower sobbing rate
      } else if (currentStep === "chilseok") {
        pitch = 0.68;  // Earnest deep baritone voice
        rate = 0.85;   // Earnest rate
      }
      // Always assign maleVoice or baseVoice so pitch changes are applied to a Korean voice
      queue.push({ text: gyeonwoo, pitch, rate, voice: maleVoice || baseVoice, speaker: "gyeonwoo" });
    }

    // 3. Jignyeo (Vega - Delicate high-pitch female voice)
    if (jignyeo) {
      let pitch = 1.45; // Sweet bright female voice by default
      let rate = 1.02;
      if (currentStep === "spring_autumn") {
        pitch = 1.30;  // High-pitched weeping female voice
        rate = 0.85;   // Very slow tearful rate
      } else if (currentStep === "chilseok") {
        pitch = 1.40;  // High-pitched pleading female voice
        rate = 0.95;   // Frantic earnest rate
      }
      queue.push({ text: jignyeo, pitch, rate, voice: femaleVoice || baseVoice, speaker: "jignyeo" });
    }

    let currentIdx = 0;
    const playNext = () => {
      if (currentIdx >= queue.length) {
        setCurrentSpeaker(null);
        setSpokenText("");
        
        // Voice-driven automatic progression
        if (isSpinningRef.current) {
          const cur = stepRef.current;
          if (cur === "spring_autumn") {
            setStep("chilseok");
          } else if (cur === "chilseok") {
            setStep("bridge");
          } else if (cur === "bridge") {
            setStep("wish");
          }
        }
        return;
      }
      if (!audioEnabled) return;

      const item = queue[currentIdx];
      
      // Update states to trigger real-time visuals/subtitles and character speech bubbles
      setCurrentSpeaker(item.speaker);
      setSpokenText(item.text);

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = "ko-KR";
      utterance.pitch = item.pitch;
      utterance.rate = item.rate;
      if (item.voice) {
        utterance.voice = item.voice;
      }

      utterance.onend = () => {
        currentIdx++;
        playNext();
      };
      utterance.onerror = () => {
        currentIdx++;
        playNext();
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    playNext();
  };

  // Trigger TTS voice when step changes
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;

    const timer = setTimeout(() => {
      speakStepSequence(step);
    }, 150);

    return () => clearTimeout(timer);
  }, [step, audioEnabled]);

  // Timed timeline auto-scrolling engine (Pure Click triggered workflow)
  const startTimeline = () => {
    if (step !== "ready") return;
    
    clearAllTimers();
    setIsSpinning(true);
    
    // 즉시 '헤어져 있던 봄/가을' 상태로 전환하여 이들의 이별 이야기를 들려줍니다.
    setStep("spring_autumn");
  };

  // Reset the entire playground back to clean state
  const resetSimulator = () => {
    clearAllTimers();
    setIsSpinning(false);
    setStep("ready");
    setNameInput("");
    setWishInput("");
    setSelectedWish(null);
    setErrorMessage(null);
    setAiWishResponse(null);
    speakKorean("지구에서 다시 한 번 하늘을 관측해 보세요.");
  };

  // Handle wish submission
  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    const strippedName = nameInput.trim();
    const strippedWish = wishInput.trim();
    if (!strippedName) {
      setErrorMessage("⚠️ 이름을 입력해주세요! 소원 비는 분을 식별하기 위해 성함이 필요합니다.");
      speakKorean("이름을 입력해주세요!");
      return;
    }
    if (!strippedWish) {
      setErrorMessage("⚠️ 소원 편지 내용이 완전히 비어있습니다! 한 글자라도 정성스레 적어주셔야 전달이 가능합니다.");
      speakKorean("소원 편지 내용을 적어주세요.");
      return;
    }

    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    
    const newWish: Wish = {
      id: wishes.length + 1,
      name: strippedName,
      content: strippedWish,
      time: timeString
    };

    setWishes(prev => [...prev, newWish]);
    setNameInput("");
    setWishInput("");
    setErrorMessage(null);
    setAiWishResponse(null);
    setStep("complete");

    // Gemini AI 축복 메시지 생성
    if (apiKey) {
      setIsGeneratingResponse(true);
      try {
        const blessing = await generateWishBlessing(apiKey, strippedName, strippedWish);
        setAiWishResponse(blessing);
      } catch {
        setAiWishResponse(null);
      } finally {
        setIsGeneratingResponse(false);
      }
    }
  };

  // Re-play current narration
  const handleReplayAudio = () => {
    speakStepSequence(step);
  };

  // Copy python code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(streamlitCodeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download app.py file
  const handleDownloadCode = () => {
    const blob = new Blob([streamlitCodeString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "app.py";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Define Gyeonwoo / Jignyeo coordinates based on current step (Implementing Flattened Sky Dome illusion)
  const getCoordinates = () => {
    switch (step) {
      case "ready":
        // 처음부터 헤어져 있던(떨어져 있던) 상태로 시작하여 은하수 양 끝에 위치시킵니다.
        return {
          altair: { left: "8%", bottom: "25%", opacity: 1, scale: 1 },
          vega: { right: "8%", bottom: "25%", opacity: 1, scale: 1 },
          milkyWayOpacity: 0.12,
          bridgeDisplay: false,
          letterDisplay: false,
        };
      case "spring_autumn":
        // [착시 반영] 지평선 근처 (낮게 위치), 눈으로 보는 거리가 가장 멀리 떨어져 있음 (8% left/right, 간격 최대)
        return {
          altair: { left: "8%", bottom: "25%", opacity: 1, scale: 1 },
          vega: { right: "8%", bottom: "25%", opacity: 1, scale: 1 },
          milkyWayOpacity: 0.12, // 봄/가을은 흐릿한 강가
          bridgeDisplay: false,
          letterDisplay: false,
        };
      case "chilseok":
        // [착시 반영] 중천 꼭대기 (높은 위치), 두 별의 시각적 거리가 대폭 좁아짐 (31% left/right, 간격 최소)
        return {
          altair: { left: "31%", bottom: "65%", opacity: 1, scale: 1 },
          vega: { right: "31%", bottom: "65%", opacity: 1, scale: 1 },
          milkyWayOpacity: 0.95, // 칠월칠석에는 최고의 밀도로 눈부심
          bridgeDisplay: false,
          letterDisplay: false,
        };
      case "bridge":
        // 오작교로 인해 서로 만나 한가운데서 애정 표현 (46.5% left / 46.5% right로 완벽하게 포옹하는 연출)
        return {
          altair: { left: "46.5%", bottom: "65%", opacity: 1, scale: 1.15 },
          vega: { right: "46.5%", bottom: "65%", opacity: 1, scale: 1.15 },
          milkyWayOpacity: 0.95,
          bridgeDisplay: true,
          letterDisplay: false,
        };
      case "wish":
        return {
          altair: { left: "46.5%", bottom: "65%", opacity: 1, scale: 1.15 },
          vega: { right: "46.5%", bottom: "65%", opacity: 1, scale: 1.15 },
          milkyWayOpacity: 0.90,
          bridgeDisplay: true,
          letterDisplay: true, // 소원 편지 하강 완료
        };
      case "complete":
        return {
          altair: { left: "46.5%", bottom: "65%", opacity: 1, scale: 1.15 },
          vega: { right: "46.5%", bottom: "65%", opacity: 1, scale: 1.15 },
          milkyWayOpacity: 1.0,
          bridgeDisplay: true,
          letterDisplay: false,
        };
    }
  };

  const coords = getCoordinates();

  // Define Earth's orbit coordinates based on step for the dynamic heliocentric simulation
  const getEarthPosition = () => {
    switch (step) {
      case "ready":
      case "spring_autumn":
        // Earth is far off on the left/back of its orbit
        return { left: "22%", bottom: "28px" };
      case "chilseok":
        // Earth has revolved to the front/center (closest to the zenith stars)
        return { left: "50%", bottom: "10px" };
      case "bridge":
      case "wish":
      case "complete":
        return { left: "50%", bottom: "10px" };
      default:
        return { left: "22%", bottom: "28px" };
    }
  };

  return (
    <div className="min-h-screen bg-[#03030d] text-white font-sans selection:bg-purple-500 selection:text-white pb-16">
      {/* Upper Navigation bar with modern layout */}
      <header className="sticky top-0 z-30 bg-[#050514]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="font-display font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-sky-300">
              견우와 직녀 은하수 시뮬레이터
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button 
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                if (!audioEnabled) {
                  setTimeout(() => speakKorean("한국어 나레이션 음성이 활성화되었습니다."), 100);
                } else {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                audioEnabled 
                  ? "bg-purple-950/40 border-purple-500/50 text-purple-200" 
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
              title={audioEnabled ? "음성 나레이션 켜짐" : "음성 나레이션 꺼짐"}
              id="audio_toggle_btn"
            >
              <Volume2 className={`w-3.5 h-3.5 ${audioEnabled ? "animate-bounce" : ""}`} />
              {audioEnabled ? "나레이션 ON" : "음성 OFF"}
            </button>

            {/* API Key Settings Button */}
            <button
              onClick={() => {
                setApiKeyInput(apiKey);
                setShowApiSettings(v => !v);
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                apiKey
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
              title="Gemini API 키 설정"
              id="api_settings_btn"
            >
              <Key className="w-3.5 h-3.5" />
              {apiKey ? "AI 연결됨" : "API 키"}
            </button>

            {/* Main Tabs */}
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveTab("simulator")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === "simulator"
                    ? "bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab_simulator_btn"
              >
                관측 시뮬레이터
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                  activeTab === "code"
                    ? "bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab_code_btn"
              >
                <Code className="w-3 h-3" />
                파이썬 코드 (app.py)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* API Key Settings Panel */}
      <AnimatePresence>
        {showApiSettings && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="sticky top-[61px] z-20 bg-[#07071a]/95 backdrop-blur-md border-b border-white/10 px-4 py-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <Key className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-emerald-300 mb-1">Gemini API 키 설정</p>
                  <p className="text-[11px] text-gray-400 mb-3">
                    API 키를 입력하면 소원 제출 시 견우와 직녀의 AI 축복 메시지를 받을 수 있습니다.{" "}
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline hover:text-sky-300">
                      키 발급 →
                    </a>
                  </p>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1 max-w-sm">
                      <input
                        type={showApiKeyText ? "text" : "password"}
                        value={apiKeyInput}
                        onChange={e => setApiKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 pr-9 font-mono"
                        id="api_key_input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKeyText(v => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showApiKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberKey}
                        onChange={e => setRememberKey(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      기억하기
                    </label>
                    <button
                      onClick={() => {
                        const trimmed = apiKeyInput.trim();
                        setApiKey(trimmed);
                        if (rememberKey && trimmed) {
                          localStorage.setItem(STORAGE_KEY, trimmed);
                        } else {
                          localStorage.removeItem(STORAGE_KEY);
                        }
                        setShowApiSettings(false);
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      저장
                    </button>
                    {apiKey && (
                      <button
                        onClick={() => {
                          setApiKey("");
                          setApiKeyInput("");
                          localStorage.removeItem(STORAGE_KEY);
                          setShowApiSettings(false);
                        }}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-xs rounded-lg transition-all"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowApiSettings(false)} className="text-gray-500 hover:text-white text-xs mt-0.5">✕</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {activeTab === "simulator" ? (
          <div className="space-y-6">
            
            {/* 1. Visual Sky Dome Canvas */}
            <div className="relative">
              {/* Sky Box Canvas container */}
              <div 
                className="w-full h-[400px] rounded-2xl relative overflow-hidden border border-white/15 shadow-2xl transition-all duration-1000 ease-in-out"
                style={{
                  background: getSkyGradient(step),
                  boxShadow: "inset 0 0 50px rgba(0, 0, 0, 0.9)"
                }}
              >
                {/* 2-1. Twinkling Stars Background */}
                <div className="absolute inset-0 opacity-40 animate-slow-spin pointer-events-none">
                  {[...Array(25)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute rounded-full bg-white animate-twinkle"
                      style={{
                        width: (i % 3) + 1 + "px",
                        height: (i % 3) + 1 + "px",
                        top: `${(i * 17) % 100}%`,
                        left: `${(i * 23) % 100}%`,
                        animationDelay: `${(i * 0.4).toFixed(1)}s`,
                        animationDuration: `${1.5 + (i % 3)}s`
                      }}
                    />
                  ))}
                </div>

                {/* 2-2. Milky Way River */}
                <div 
                  className={`absolute left-1/2 top-0 -translate-x-1/2 w-40 h-[120%] rotate-[15deg] filter blur-xl transition-all duration-1000 ease-in-out pointer-events-none ${
                    step !== "ready" && step !== "spring_autumn" ? "animate-milkyway-glow" : ""
                  }`}
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(160, 200, 255, 0.6) 0%, rgba(138, 58, 255, 0.25) 50%, rgba(0,0,0,0) 80%)",
                    opacity: coords.milkyWayOpacity,
                  }}
                />
                 {(step === "bridge" || step === "wish" || step === "complete") && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {/* Bridge arch line */}
                    <div className="absolute left-[38%] right-[38%] bottom-[64.5%] h-0.5 border-b border-dashed border-yellow-400/35"></div>
                    
                    {/* Animated Birds forming the physical bridge - Flying up dynamically with Spring Physics */}
                    {[
                      { id: 1, left: "43%", bottom: "63.5%", delay: 0.1, emoji: "🐦‍⬛" },
                      { id: 2, left: "46.5%", bottom: "63.0%", delay: 0.25, emoji: "🐦" },
                      { id: 3, left: "50%", bottom: "62.5%", delay: 0.4, emoji: "🐦‍⬛" },
                      { id: 4, left: "53.5%", bottom: "63.0%", delay: 0.55, emoji: "🐦" },
                      { id: 5, left: "57%", bottom: "63.5%", delay: 0.7, emoji: "🐦‍⬛" },
                    ].map((bird) => (
                      <motion.div
                        key={bird.id}
                        initial={{ 
                          y: 350, 
                          x: bird.id % 2 === 0 ? -150 : 150, 
                          opacity: 0, 
                          scale: 0.2,
                          rotate: bird.id % 2 === 0 ? -35 : 35
                        }}
                        animate={{ 
                          y: 0, 
                          x: 0, 
                          opacity: 1, 
                          scale: 1,
                          rotate: 0
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 85,
                          damping: 12,
                          delay: bird.delay
                        }}
                        className="absolute text-xl select-none"
                        style={{
                          left: bird.left,
                          bottom: bird.bottom,
                        }}
                      >
                        <span className="inline-block animate-bounce">{bird.emoji}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* 2-4. Altair (견우성) - Slowly closes in synchronized with Earth's orbit change */}
                <div 
                  className={`absolute text-center z-20 ${
                    (step === "bridge" || step === "wish" || step === "complete") ? "animate-walk" : ""
                  }`}
                  style={{
                    left: coords.altair.left,
                    bottom: coords.altair.bottom,
                    opacity: coords.altair.opacity,
                    transform: `translateX(-50%) scale(${coords.altair.scale})`,
                    transition: isSpinning ? "all 4500ms cubic-bezier(0.4, 0, 0.2, 1)" : "none"
                  }}
                >
                  <div className="flex flex-col items-center relative">
                     {/* Gyeonwoo Speech Bubble synced with real-time active speaker */}
                    <AnimatePresence>
                      {currentSpeaker === "gyeonwoo" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -15 }}
                          className="absolute bottom-[115%] mb-2 bg-[#090b21]/95 border border-blue-400/60 text-blue-100 text-[11px] px-3.5 py-2 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.25)] z-50 w-56 text-left leading-relaxed font-sans"
                        >
                          <div className="relative">
                            {spokenText}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#090b21]/95 z-40 mt-[-1px]" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-blue-400/60 -z-10" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <span className="text-[10px] font-mono font-bold text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] animate-pulse">
                      ⭐ 알타이르
                    </span>
                    <GyeonwooCharacter 
                      expression={step === "ready" ? "neutral" : (step === "spring_autumn" || step === "chilseok") ? "sad" : "happy"} 
                      className="mt-1 drop-shadow-[0_0_12px_rgba(30,58,138,0.5)]" 
                    />
                    <span className="text-[9px] bg-black/75 text-blue-200 border border-blue-900/50 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap font-bold">
                      견우 (Altair)
                    </span>
                  </div>
                </div>

                {/* 2-5. Vega (직녀성) - Slowly closes in synchronized with Earth's orbit change */}
                <div 
                  className={`absolute text-center z-20 ${
                    (step === "bridge" || step === "wish" || step === "complete") ? "animate-walk" : ""
                  }`}
                  style={{
                    right: coords.vega.right,
                    bottom: coords.vega.bottom,
                    opacity: coords.vega.opacity,
                    transform: `translateX(50%) scale(${coords.vega.scale})`,
                    transition: isSpinning ? "all 4500ms cubic-bezier(0.4, 0, 0.2, 1)" : "none"
                  }}
                >
                  <div className="flex flex-col items-center relative">
                    {/* Jignyeo Speech Bubble synced with real-time active speaker */}
                    <AnimatePresence>
                      {currentSpeaker === "jignyeo" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -15 }}
                          className="absolute bottom-[115%] mb-2 bg-[#1b0818]/95 border border-pink-400/60 text-pink-100 text-[11px] px-3.5 py-2 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.25)] z-50 w-56 text-left leading-relaxed font-sans"
                        >
                          <div className="relative">
                            {spokenText}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#1b0818]/95 z-40 mt-[-1px]" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-pink-400/60 -z-10" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <span className="text-[10px] font-mono font-bold text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.8)] animate-pulse">
                      베가 ⭐
                    </span>
                    <JignyeoCharacter 
                      expression={step === "ready" ? "neutral" : (step === "spring_autumn" || step === "chilseok") ? "sad" : "happy"} 
                      className="mt-1 drop-shadow-[0_0_12px_rgba(190,24,93,0.5)]" 
                    />
                    <span className="text-[9px] bg-black/75 text-pink-200 border border-pink-900/50 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap font-bold">
                      직녀 (Vega)
                    </span>
                  </div>
                </div>

                {/* Pulsing Love Heart rising and fading during embrace */}
                {(step === "bridge" || step === "wish" || step === "complete") && (
                  <motion.div
                    initial={{ scale: 0, y: 15, opacity: 0 }}
                    animate={{ scale: [1, 1.4, 1], y: [15, -15, -45], opacity: [0, 1, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2.5, 
                      ease: "easeInOut" 
                    }}
                    className="absolute left-1/2 bottom-[66%] -translate-x-1/2 z-35 text-3xl drop-shadow-[0_0_12px_rgba(239,68,68,0.95)] pointer-events-none"
                  >
                    ❤️
                  </motion.div>
                )}

                {/* 2-6. Flying Bird Carrier with Wish Letter (💌 wish 단계 특수 연출) */}
                {step === "wish" && (
                  <motion.div
                    initial={{ x: "-50%", y: -250, scale: 0.4, opacity: 0, rotate: -25 }}
                    animate={{ 
                      x: ["-50%", "-15%", "-75%", "-50%"], 
                      y: [-250, -50, 60, 110], 
                      scale: [0.4, 0.7, 0.9, 1.0], 
                      opacity: [0, 1, 1, 1],
                      rotate: [-25, 10, -15, 0]
                    }}
                    transition={{ 
                      duration: 3.2, 
                      ease: "easeInOut" 
                    }}
                    className="absolute left-1/2 z-30 flex flex-col items-center pointer-events-none"
                    style={{ bottom: "18%" }}
                  >
                    <span className="text-3xl animate-bounce">🐦‍⬛</span>
                    <span className="text-2xl -mt-2 drop-shadow-[0_0_8px_gold]">💌</span>
                    <div className="bg-yellow-950/95 text-yellow-300 border border-yellow-500/40 text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap mt-1 font-bold">
                      지구의 나에게 전달된 기적의 소원 편지!
                    </div>
                  </motion.div>
                )}

                {/* 2-7. Cumulative Wish Stars (Always shining permanently in the Milky Way across ALL steps!) */}
                {wishes.map((w, index) => {
                  const leftPos = ((index * 23 + 15) % 70) + 15;
                  const bottomPos = ((index * 13 + 35) % 25) + 40;
                  return (
                    <button
                      key={w.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid triggering orbit clicks
                        setSelectedWish(w);
                        const textToSpeak = `은하수 밤하늘에 새겨진 기적의 소망 별무리입니다. 기원자 ${w.name}님의 고결한 소망. ${w.content}`;
                        speakKorean(textToSpeak, { pitch: 1.15, rate: 0.92 });
                      }}
                      className="absolute text-lg hover:scale-150 transition-all duration-300 active:scale-90 z-30 cursor-pointer drop-shadow-[0_0_10px_gold] hover:drop-shadow-[0_0_18px_rgba(253,224,71,1)] animate-twinkle"
                      style={{
                        left: `${leftPos}%`,
                        bottom: `${bottomPos}%`,
                        animationDelay: `${index * 0.3}s`,
                        animationDuration: `${1.5 + (index % 3) * 0.5}s`
                      }}
                      title={`소원 별 ${w.id} (${w.name}): 클릭해서 감미로운 기원 음성 듣기`}
                    >
                      ✨
                    </button>
                  );
                })}

                {/* Heliocentric Orbit Track Line */}
                <div 
                  className="absolute left-[12%] right-[12%] bottom-[16px] h-[36px] rounded-full border border-dashed border-white/10 pointer-events-none z-10" 
                  style={{ transform: "rotateX(60deg)" }}
                />
                
                {/* Glowing Sun in the Center of Orbit */}
                <div className="absolute left-[35%] bottom-[25px] -translate-x-1/2 -translate-y-1/2 text-xl select-none pointer-events-none drop-shadow-[0_0_12px_rgba(249,115,22,0.85)] animate-pulse z-10">
                  ☀️
                </div>

                {/* 2-8. Earth (Observer) revolving and rotating on the Orbit */}
                <motion.div 
                  initial={{ left: "22%", bottom: "28px" }}
                  animate={getEarthPosition()}
                  transition={{ duration: isSpinning ? 4.5 : 0, ease: "easeInOut" }}
                  className="absolute -translate-x-1/2 text-center z-25 cursor-pointer group"
                  onClick={() => {
                    if (step === "ready") {
                      startTimeline();
                    } else {
                      handleReplayAudio();
                    }
                  }}
                >
                  <div className="relative">
                    {/* Pulsing indicator if ready */}
                    {step === "ready" && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold animate-bounce whitespace-nowrap border border-green-300">
                        지구를 클릭해 공전하기 🌍
                      </span>
                    )}
                    <span className="text-sm animate-float block">🧑‍🚀</span>
                    <span className={`text-3xl leading-none select-none block transition-all ${isSpinning ? "animate-spin-slow text-green-400 scale-110" : "group-hover:scale-110"}`} id="earth_globe_indicator">🌍</span>
                    <span className="text-[9px] bg-black/85 text-green-300 border border-green-500/50 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap block font-bold">
                      {isSpinning ? "지구 자전 및 공전 중..." : "지구 (관찰자)"}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Float Audio replay helper */}
              <button
                onClick={handleReplayAudio}
                className="absolute right-3 bottom-3 bg-black/60 hover:bg-black/80 text-white/90 p-2 rounded-lg border border-white/10 text-xs flex items-center gap-1 transition-all z-20"
                title="음성 나레이션 다시 듣기"
                id="replay_audio_bubble_btn"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>나레이션 다시듣기</span>
              </button>
            </div>

            {/* 3. Text Narration & Dialogue Board (Streamlit st.info style) */}
            <div className="bg-[#12122b] border border-indigo-500/30 rounded-xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-950 p-2 rounded-lg border border-indigo-500/30 text-indigo-400 mt-0.5">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase font-bold block mb-1">
                    현재 단계 은하수 나레이션 ({step === "ready" ? "대기 중" : isSpinning && step !== "complete" && step !== "wish" ? "자동 전개 중 ⏳" : "안착 완료"})
                  </span>
                  <p className="text-sm text-gray-200 leading-relaxed font-sans">
                    {getNarrationText(step)}
                  </p>
                </div>
              </div>

              {/* Characters Dialogues on relevant steps */}
              {step !== "ready" && step !== "complete" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5 animate-fade-in">
                  <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-lg flex gap-2.5 items-start">
                    <span className="text-2xl mt-0.5 select-none">🧔</span>
                    <div className="text-xs">
                      <span className="font-bold text-blue-300 block mb-1">견우 (알타이르)</span>
                      <p className="text-gray-300 italic leading-relaxed">
                        {getGyeonwooDialogue(step)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-pink-950/20 border border-pink-900/30 p-3 rounded-lg flex gap-2.5 items-start">
                    <span className="text-2xl mt-0.5 select-none">👸</span>
                    <div className="text-xs">
                      <span className="font-bold text-pink-300 block mb-1">직녀 (베가)</span>
                      <p className="text-gray-300 italic leading-relaxed">
                        {getJignyeoDialogue(step)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Action Steps & Form Handler */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                <Map className="w-4 h-4 text-purple-400" />
                은하수 타임라인 자동 전개 보드
              </h3>

              <div className="flex flex-col gap-3">
                {step === "ready" && (
                  <div>
                    <p className="text-xs text-gray-400 mb-3">
                      지구 캐릭터(🌍)를 누르거나, 아래 관측 시작 단추를 클릭하면 봄, 가을, 여름 칠월칠석, 오작교 결합까지 원클릭 자동 시나리오가 펼쳐집니다.
                    </p>
                    <button
                      onClick={startTimeline}
                      className="w-full bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 border border-purple-500/30 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-900/30 transition-all active:scale-98 cursor-pointer"
                      id="start_simulation_direct_btn"
                    >
                      <Earth className="w-4 h-4 text-green-300" />
                      지구에서 하늘 올려다보기 (관측 개시)
                    </button>
                  </div>
                )}

                {/* Auto animation states in-progress panels */}
                {isSpinning && step === "spring_autumn" && (
                  <div className="bg-red-950/15 border border-red-900/30 p-3.5 rounded-xl animate-pulse">
                    <span className="text-[10px] font-mono text-red-300 block mb-1">1단계 진행 중 (봄/가을 지평선 고도)</span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      지구가 공전 중입니다... 현재 두 별은 지평선 끝에 갇혀 천공 평평화 착시로 인해 거리가 엄청나게 벌어져 보입니다. 5초 후 자동으로 여름철 중천으로 이동합니다.
                    </p>
                  </div>
                )}

                {isSpinning && step === "chilseok" && (
                  <div className="bg-cyan-950/15 border border-cyan-900/30 p-3.5 rounded-xl animate-pulse">
                    <span className="text-[10px] font-mono text-cyan-300 block mb-1">2단계 진행 중 (여름철 칠월칠석 중천 고도)</span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      지구가 추가 공전하여 칠월칠석 한가운데 중천에 서서히 도달합니다. 착시 인지 왜곡이 사라져 두 연인 성좌의 거리가 매우 가깝게 좁아집니다. 5초 후 자동으로 은하수 오작교 다리가 이어집니다.
                    </p>
                  </div>
                )}

                {isSpinning && step === "bridge" && (
                  <div className="bg-green-950/15 border border-green-900/30 p-3.5 rounded-xl animate-pulse">
                    <span className="text-[10px] font-mono text-green-300 block mb-1">3단계 진행 중 (오작교 다리 만남)</span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      까마귀와 까치들이 모여 다리를 놓아 드디어 마침내 감격적인 만남이 성사되었습니다! 두 연인의 축복 속에 5초 후 자동으로 소원 편지 봉투가 하강합니다.
                    </p>
                  </div>
                )}

                {/* Only display wish submission form on wish state */}
                {step === "wish" && (
                  <form onSubmit={handleSubmitWish} className="space-y-4 animate-slide-up">
                    <div className="text-xs text-yellow-200 bg-yellow-950/30 border border-yellow-900/40 p-3.5 rounded-xl leading-relaxed shadow-lg">
                      ✉️ <strong>기적의 소원 봉투 수신 완료:</strong> 두 연인이 까마귀의 부리에 튼튼히 물려 내려보낸 편지봉투가 마침내 지구 앞마당에 떨어졌습니다. 은하수에 각인해 영구히 간직할 소원 내용을 정성스레 적어보세요.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                          👤 소원 비는 이 이름:
                        </label>
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => {
                            setNameInput(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          placeholder="예: 홍길동"
                          className="w-full bg-black/40 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                          id="wish_name_input_field"
                          autoFocus
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                          ✨ 은하수에 전송할 소망 편지 작성:
                        </label>
                        <input
                          type="text"
                          value={wishInput}
                          onChange={(e) => {
                            setWishInput(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          placeholder="예: 온 가족이 건강하고 원하던 시험에 합격하기를!"
                          className="w-full bg-black/40 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                          id="wish_text_input_field"
                        />
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="bg-red-950/40 border border-red-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-red-200 animate-pulse">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 border border-yellow-400/30 text-black font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-lg shadow-yellow-950/20 cursor-pointer"
                      id="submit_wish_btn"
                    >
                      <Send className="w-4 h-4" />
                      은하수로 소원 별 쏘아 올리기 🚀
                    </button>
                  </form>
                )}

                {step === "complete" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-green-950/20 border border-green-500/30 p-4 rounded-xl text-center">
                      <div className="inline-flex p-2 bg-green-950 rounded-full border border-green-500/30 text-green-400 mb-2">
                        <CheckCircle2 className="w-6 h-6 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-semibold text-green-300">은하수 소원 별 안착 성공</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        소중한 서원이 하늘 은하수에 전송되어 아름다운 나만의 별무리 성좌로 환하게 타올랐습니다.
                      </p>
                    </div>

                    {wishes.length > 0 && (
                      <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-lg">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-yellow-400 uppercase block mb-1">
                          방금 보낸 소원 성취 편지 (기원자: {wishes[wishes.length - 1].name})
                        </span>
                        <p className="text-xs text-gray-300 italic bg-black/25 p-2 rounded border border-white/5 font-sans leading-relaxed">
                          「 {wishes[wishes.length - 1].content} 」
                        </p>
                      </div>
                    )}

                    {/* AI 축복 메시지 */}
                    {isGeneratingResponse && (
                      <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-xl flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                        <span className="text-xs text-purple-300">견우와 직녀가 축복 메시지를 전하고 있습니다...</span>
                      </div>
                    )}
                    {aiWishResponse && !isGeneratingResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-purple-950/30 to-indigo-950/30 border border-purple-400/30 p-4 rounded-xl"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300 mb-2">
                          <Sparkles className="w-3 h-3" />
                          <span>견우와 직녀의 AI 축복 메시지</span>
                        </div>
                        <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-line">{aiWishResponse}</p>
                      </motion.div>
                    )}
                    {!apiKey && !isGeneratingResponse && (
                      <div className="bg-white/[0.02] border border-dashed border-white/10 p-3 rounded-xl text-center">
                        <p className="text-[11px] text-gray-500">
                          <button onClick={() => { setApiKeyInput(""); setShowApiSettings(true); }} className="text-emerald-400 underline hover:text-emerald-300 cursor-pointer">API 키를 등록</button>하면 견우와 직녀의 AI 축복 메시지를 받을 수 있어요 ✨
                        </p>
                      </div>
                    )}

                    <button
                      onClick={resetSimulator}
                      className="w-full bg-white/10 hover:bg-white/15 border border-white/20 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                      id="restart_simulation_btn"
                    >
                      <RotateCcw className="w-4 h-4 text-purple-400" />
                      처음부터 다시 정밀 관측하기 🔄
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Saved Wishes Stars Storage Container */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
              <h3 className="text-base font-display font-semibold text-white mb-1.5 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-yellow-400" />
                🗃️ 나의 은하수 소원 별 보관함
              </h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                사용자가 은하수로 보낸 소중한 소망들의 이력입니다. 별 단추를 클릭해 당시 내용을 음성 보이스로 되새겨 보세요.
              </p>

              {wishes.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">
                  현재 수놓아진 소원 별이 존재하지 않습니다. 지구를 클릭해 시뮬레이션을 가동해 보세요!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {wishes.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        setSelectedWish(w);
                        const textToSpeak = `소원 보관함의 ${w.id}번째 소원 별무리입니다. 기원자 ${w.name}님 소망 내용. ${w.content}`;
                        speakKorean(textToSpeak, { pitch: 1.10, rate: 0.90 });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all active:scale-95 cursor-pointer ${
                        selectedWish?.id === w.id
                          ? "bg-gradient-to-r from-yellow-950/60 to-purple-950/60 border-yellow-500/60 text-white"
                          : "bg-white/[0.02] border-white/10 text-gray-300 hover:bg-white/[0.06] hover:border-white/20"
                      }`}
                      id={`wish_box_btn_${w.id}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-yellow-400 mb-1">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        <span>소원 별 {w.id}번</span>
                      </div>
                      <p className="text-xs truncate font-sans text-gray-100 font-medium">
                        <strong>{w.name}:</strong> {w.content}
                      </p>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{w.time.split(" ")[0]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Individual Wish Detail Modal */}
              {selectedWish && (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-gradient-to-r from-yellow-950/20 via-purple-950/20 to-black/30 border border-yellow-500/40 p-4 rounded-xl relative"
                >
                  <button
                    onClick={() => setSelectedWish(null)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-white text-xs bg-white/5 px-2.5 py-1 rounded-md border border-white/10 cursor-pointer"
                    id="close_selected_wish_btn"
                  >
                    ✕ 닫기
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-yellow-400 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>소원 별 {selectedWish.id}번 기적의 상세 정보 (기원자: {selectedWish.name})</span>
                  </div>

                  <p className="text-sm text-gray-100 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5 font-sans mb-3 font-semibold">
                    「 {selectedWish.content} 」
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>기록 시간: {selectedWish.time}</span>
                    </div>
                    <button 
                      onClick={() => speakKorean(`소원 보관함에 고이 간직된 ${selectedWish.name}님의 고결한 염원입니다. ${selectedWish.content}`, { pitch: 1.12, rate: 0.90 })}
                      className="text-xs text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                      id="replay_selected_speech_btn"
                    >
                      <Volume2 className="w-3 h-3 animate-bounce" />
                      <span>소리로 다시 듣기</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          /* 6. Python Source Code Tab */
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-400" />
                    파이썬 단일 파일 MVP 소스 코드 (app.py)
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    코딩 초보자분이 복사해서 바로 로컬에서 실행하실 수 있는 Streamlit 풀스택 코드입니다.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3.5 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    id="copy_code_btn"
                  >
                    <Copy className="w-3.5 h-3.5 text-purple-300" />
                    {copied ? "복사 완료!" : "코드 전체 복사"}
                  </button>

                  <button
                    onClick={handleDownloadCode}
                    className="px-3.5 py-2 text-xs font-bold bg-purple-800 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
                    id="download_code_btn"
                  >
                    <Download className="w-3.5 h-3.5" />
                    app.py 다운로드
                  </button>
                </div>
              </div>

              {/* Instructions on how to run locally */}
              <div className="bg-purple-950/15 border border-purple-500/20 rounded-xl p-4 text-xs space-y-2 mb-4 leading-relaxed">
                <span className="font-bold text-purple-200 block">🚀 로컬 PC에서 3분 만에 구동하는 방법:</span>
                <ol className="list-decimal pl-4 space-y-1 text-gray-300">
                  <li>파이썬 설치 후, 명령창(CMD/터미널)에서 <code className="bg-black/60 text-yellow-300 px-1.5 py-0.5 rounded font-mono">pip install streamlit</code> 명령을 입력해 설치합니다.</li>
                  <li>위의 <strong>[app.py 다운로드]</strong> 버튼을 클릭하여 파이썬 파일을 내 컴퓨터에 저장합니다.</li>
                  <li>터미널에서 저장된 폴더 경로로 이동 후 <code className="bg-black/60 text-yellow-300 px-1.5 py-0.5 rounded font-mono">streamlit run app.py</code> 명령을 입력하면 웹 브라우저에서 바로 실행됩니다!</li>
                </ol>
              </div>

              {/* Large styled Code Editor simulation */}
              <div className="relative border border-white/10 rounded-xl overflow-hidden bg-[#020208] text-xs font-mono shadow-inner max-h-[500px] overflow-y-auto">
                <div className="sticky top-0 bg-white/[0.04] px-4 py-2 text-[10px] text-gray-500 flex justify-between items-center border-b border-white/5">
                  <span>PYTHON SCRIPT</span>
                  <span>UTF-8 • app.py</span>
                </div>
                <pre className="p-4 text-gray-300 overflow-x-auto leading-relaxed text-[11px] font-mono">
                  <code>{streamlitCodeString}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="mt-16 text-center text-xs text-gray-600 font-mono">
        <p>© 2026 Gyeonwoo & Jignyeo Apparent Sky Illusion MVP. All rights reserved.</p>
        <p className="mt-1 text-[10px]">Made with Heart, React & Python Streamlit Specs</p>
      </footer>
    </div>
  );
}

// 7. Helper functions for formatting sky and steps

function getSkyGradient(step: Step): string {
  switch (step) {
    case "ready":
      return "linear-gradient(180deg, #020208 0%, #06061c 100%)";
    case "spring_autumn":
      return "linear-gradient(180deg, #010106 0%, #0c0512 100%)";
    case "chilseok":
      return "linear-gradient(180deg, #050215 0%, #170d3e 100%)";
    case "bridge":
    case "wish":
      return "linear-gradient(180deg, #0d082c 0%, #1d1054 100%)";
    case "complete":
      return "linear-gradient(180deg, #02020d 0%, #0f0827 100%)";
    default:
      return "linear-gradient(180deg, #020208 0%, #06061c 100%)";
  }
}

function getNarrationText(step: Step): string {
  switch (step) {
    case "ready":
      return "하늘나라 은하수 동쪽에서 부지런히 소를 몰던 늠름한 목동 견우와, 서쪽에서 밤낮없이 아름다운 비단을 짜던 목수이자 공주인 단아한 직녀가 살고 있었습니다.";
    case "spring_autumn":
      return "서로 깊은 사랑에 빠져 본분을 잊자 크게 노한 옥황상제는 두 사람을 은하수 너머로 추방하고 일 년에 단 한 번, 칠월칠석에만 만날 수 있게 하였습니다. 봄과 가을에는 드넓은 은하수를 사이에 두고 하염없이 서로를 향해 눈물지을 뿐이었습니다.";
    case "chilseok":
      return "기다리던 칠석날 밤, 마침내 두 연인은 하늘 가장 높은 곳으로 올라와 서로 눈앞에 반짝이는 상대를 마주했습니다. 그러나 가로막은 은하수 강물이 너무 거세고 아득하여, 서로에게 가닿지 못해 발만 동동 구르며 애끓는 탄식을 내뱉었습니다.";
    case "bridge":
      return "이 애처로운 슬픔을 차마 보지 못한 지상의 수많은 까마귀와 까치들이 일제히 날아올라 은하수 위를 덮고 자신들의 날개를 엮어 아름다운 다리 '오작교'를 놓아주었습니다. 마침내 두 사람은 은하수 한가운데에서 서로를 굳게 얼싸안으며 눈물의 재회를 나눕니다.";
    case "wish":
      return "꿈결 같은 상봉의 감격을 이룬 견우와 직녀는 이 고결한 사랑과 화합의 축복을 지상의 선한 관찰자분들에게 전하고자 까마귀 편에 기적의 황금 봉투를 딸려 보냈습니다. 이제 은하수 밤하늘에 새겨 넣을 당신의 진실한 소망을 적어 올릴 시간입니다.";
    case "complete":
      return "축하합니다! 당신의 고결하고 따뜻한 마음이 가득 담긴 소원이 하늘 저 높이 날아가 은하수 속에서 꺼지지 않고 불타오르는 찬란한 소원 별자리 성좌로 눈부시게 등극하였습니다. 두 연인의 사랑의 수호가 여러분의 염원을 영원히 보살펴 줄 것입니다.";
    default:
      return "";
  }
}

function getGyeonwooDialogue(step: Step): string {
  switch (step) {
    case "spring_autumn":
      return "사랑하는 나의 직녀여... 드넓고 푸른 은하수 너머로 그대의 실루엣만 흐릿하게 보일 뿐, 이 한겨울같이 차갑고 넓은 강물을 건널 방법이 전혀 없구려. 내 부르는 목소리는 거센 바람에 그대에게 닿지도 못하고 흩어지는구려... 너무나 보고 싶소!";
    case "chilseok":
      return "오! 드디어 칠월칠석의 은하수 정수리 끝에서 그대의 단아한 모습이 눈이 시리도록 가깝게 빛나고 있소! 하지만 이 거센 은하수의 은빛 물결을 건널 길이 없으니 이 어찌 애타는 비극이란 말이오! 직녀여, 손을 뻗어 보시오!";
    case "bridge":
      return "아! 마침내 수많은 까마귀와 까치들이 날개를 펴 다리를 놓아주었구려! 나의 직녀여, 그대의 고운 손을 꼭 부여잡으니 일 년 동안 쌓인 서러운 고독이 눈 녹듯 사라지오! 우리의 사랑은 은하수보다 깊소!";
    default:
      return "";
  }
}

function getJignyeoDialogue(step: Step): string {
  switch (step) {
    case "spring_autumn":
      return "견우님... 은하수 동쪽 하늘에서 베틀을 잡고 비단을 짜보지만, 서쪽 끝에 계신 님의 늠름한 모습이 너무 아득하여 가슴이 메어집니다. 매일같이 길쌈을 하는 동안 제 눈물이 흘러내려 베틀의 실을 모두 적셔버렸나이다...";
    case "chilseok":
      return "오늘이 바로 고대하던 칠석날이거늘, 하늘 한가운데에서 눈앞에 선명히 반짝이는 견우님을 마주하고도 굽이치는 은하수 강물에 막혀 발만 동동 구르고 있습니다. 가로막힌 이 물줄기가 이토록 잔인할 수 있단 말입니까!";
    case "bridge":
      return "견우님! 오작교 다리가 마침내 놓여 품에 안기게 되었습니다! 견우님의 가슴 벅찬 온기가 고스란히 전해져와 천 년 같은 눈물이 멈추지 않습니다. 이 찬란하고 애틋한 기적의 인연을 우리를 지켜봐 주시는 관찰자님께 축복으로 바치옵니다.";
    default:
      return "";
  }
}
