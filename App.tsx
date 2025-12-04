import React, { useState, useEffect, useRef } from 'react';
import { SpecType, SpecHistoryItem } from './types';
import { generateSpecStream } from './services/gemini';
import MarkdownRenderer from './components/MarkdownRenderer';
import HistorySidebar from './components/HistorySidebar';
import Button from './components/Button';
import TutorialModal from './components/TutorialModal';
import InstallModal from './components/InstallModal';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { 
  Menu, Sparkles, Copy, Check, Download, Settings2, Lightbulb, HelpCircle,
  FileText, Server, Layout, ListChecks, Code2, Database, Workflow, Brain, 
  Terminal, Laptop, Save, Map, Moon, Sun, AlertCircle, Loader, TestTube2, 
  Container, ShieldCheck, Smartphone, RefreshCw, ArrowRightLeft, Layers,
  Box, TableProperties, Network, Bot, Cpu
} from 'lucide-react';

// Definitions for the UI to explain technical terms to beginners
const SPEC_DEFINITIONS: Record<string, { title: string, subtitle: string, desc: string, icon: React.ReactNode, placeholder: string }> = {
  // --- PROJECT MANAGEMENT ---
  [SpecType.EPIC_BREAKDOWN]: {
    title: "Epic / Duży Projekt",
    subtitle: "Roadmap & Breakdown",
    desc: "Rozbicie dużego projektu biznesowego na User Stories i zadania techniczne.",
    icon: <Map className="w-5 h-5" />,
    placeholder: "Np. PM chce wdrożyć 'Program Lojalnościowy'. Ma być naliczanie punktów, wymiana na nagrody..."
  },
  [SpecType.PRD]: {
    title: "Product Requirement",
    subtitle: "PRD Document",
    desc: "Definicja funkcjonalności od strony biznesowej i UX.",
    icon: <FileText className="w-5 h-5" />,
    placeholder: "Np. Chcę dodać 'Tryb Ciemny' do aplikacji. Musi przełączać się automatycznie..."
  },
  [SpecType.USER_STORY]: {
    title: "User Stories",
    subtitle: "Agile Stories",
    desc: "Krótkie historyjki i kryteria akceptacji dla zespołu.",
    icon: <ListChecks className="w-5 h-5" />,
    placeholder: "Np. Jako administrator chcę móc zablokować użytkownika, aby zapobiec spamowi..."
  },

  // --- SOFTWARE ENGINEERING ---
  [SpecType.SYSTEM_DESIGN]: {
    title: "System Architecture",
    subtitle: "RFC / Design Doc",
    desc: "Wysokopoziomowy projekt architektury, mikroserwisów i baz.",
    icon: <Server className="w-5 h-5" />,
    placeholder: "Np. Planuję system powiadomień real-time obsługujący 1 mln użytkowników..."
  },
  [SpecType.API]: {
    title: "REST / GraphQL API",
    subtitle: "API Contract",
    desc: "Definicja endpointów, requestów, response i błędów.",
    icon: <Code2 className="w-5 h-5" />,
    placeholder: "Np. Endpoint POST /api/orders do składania zamówień. Musi przyjmować listę produktów..."
  },
  [SpecType.DB_SCHEMA]: {
    title: "SQL / NoSQL Schema",
    subtitle: "Database Design",
    desc: "Tabele, relacje, indeksy i strategie migracji.",
    icon: <Database className="w-5 h-5" />,
    placeholder: "Np. Schemat bazy dla sklepu internetowego: Users, Orders, Products..."
  },
  [SpecType.COMPONENT]: {
    title: "Frontend Component",
    subtitle: "UI Spec",
    desc: "Propsy, stany, zdarzenia i dostępność (a11y).",
    icon: <Layout className="w-5 h-5" />,
    placeholder: "Np. Komponent 'DataGrid' z filtrowaniem i sortowaniem po stronie klienta..."
  },
  [SpecType.MOBILE_APP]: {
    title: "Mobile App Arch",
    subtitle: "iOS / Android",
    desc: "Nawigacja, offline-first, permisje i zarządzanie stanem.",
    icon: <Smartphone className="w-5 h-5" />,
    placeholder: "Np. Aplikacja kurierska ze śledzeniem GPS w tle i skanerem kodów QR..."
  },
  [SpecType.PYTHON_MODULE]: {
    title: "Python Module",
    subtitle: "Script / Lib",
    desc: "Klasy, funkcje, typy i logika algorytmiczna.",
    icon: <Terminal className="w-5 h-5" />,
    placeholder: "Np. Moduł 'PdfExtractor' do wyciągania tekstu i tabel z faktur..."
  },
  [SpecType.SECURITY_REVIEW]: {
    title: "Security Review",
    subtitle: "Threat Model",
    desc: "Analiza zagrożeń (STRIDE), autoryzacja i szyfrowanie.",
    icon: <ShieldCheck className="w-5 h-5" />,
    placeholder: "Np. Audyt bezpieczeństwa dla systemu płatności kartami kredytowymi..."
  },

  // --- DATA & BIG DATA ---
  [SpecType.DATA_PIPELINE]: {
    title: "Data Pipeline (ETL)",
    subtitle: "Ingestion & Process",
    desc: "Przepływ danych: Źródło -> Transformacja -> Cel.",
    icon: <Workflow className="w-5 h-5" />,
    placeholder: "Np. Pobieranie danych z Salesforce co godzinę, anonimizacja i zapis do BigQuery..."
  },
  [SpecType.DATA_WAREHOUSE]: {
    title: "Data Warehouse",
    subtitle: "Analytics Modeling",
    desc: "Modelowanie wymiarowe (Star Schema), Data Marts.",
    icon: <TableProperties className="w-5 h-5" />,
    placeholder: "Np. Hurtownia danych sprzedażowych. Tabele faktów: Sprzedaż, Wymiary: Czas, Klient, Produkt..."
  },
  [SpecType.DATA_GOVERNANCE]: {
    title: "Data Governance",
    subtitle: "Catalog & Policy",
    desc: "Zarządzanie jakością danych, katalogiem i RODO/PII.",
    icon: <Box className="w-5 h-5" />,
    placeholder: "Np. Polityka retencji danych klientów i maskowanie kolumn PII w hurtowni..."
  },

  // --- AI & MACHINE LEARNING ---
  [SpecType.AI_MODEL]: {
    title: "AI / ML Model",
    subtitle: "Training Spec",
    desc: "Architektura sieci, feature engineering i metryki.",
    icon: <Brain className="w-5 h-5" />,
    placeholder: "Np. Model klasyfikacji obrazów do wykrywania usterek na linii produkcyjnej..."
  },
  [SpecType.LLM_RAG]: {
    title: "LLM & RAG System",
    subtitle: "GenAI App",
    desc: "Vector DB, chunking, prompty i kontekst.",
    icon: <Bot className="w-5 h-5" />,
    placeholder: "Np. Chatbot dla HR odpowiadający na pytania z firmowych PDFów (Regulaminy)..."
  },
  [SpecType.MLOPS_PIPELINE]: {
    title: "MLOps Pipeline",
    subtitle: "Deployment",
    desc: "Wdrażanie modeli, monitoring driftu i retraining.",
    icon: <Cpu className="w-5 h-5" />,
    placeholder: "Np. Pipeline do automatycznego trenowania modelu cenowego co tydzień..."
  },

  // --- OPERATIONS ---
  [SpecType.DEVOPS_CONFIG]: {
    title: "DevOps & Cloud",
    subtitle: "Infra as Code",
    desc: "Terraform/K8s, CI/CD, środowiska.",
    icon: <Container className="w-5 h-5" />,
    placeholder: "Np. Infrastruktura AWS ECS Fargate + RDS. Pipeline GitHub Actions..."
  },
  [SpecType.TEST_PLAN]: {
    title: "QA Test Plan",
    subtitle: "Testing Strategy",
    desc: "Scenariusze testowe, E2E, wydajność.",
    icon: <TestTube2 className="w-5 h-5" />,
    placeholder: "Np. Plan testów dla koszyka zakupowego: happy path, błędy płatności..."
  },

  // --- MAINTENANCE & EVOLUTION ---
  [SpecType.LEGACY_REFACTOR]: {
    title: "Refactoring Plan",
    subtitle: "Tech Debt",
    desc: "Plan naprawy starego kodu (Legacy).",
    icon: <RefreshCw className="w-5 h-5" />,
    placeholder: "Np. Refaktoryzacja monolitu PHP do mikroserwisów Node.js. Strategia..."
  },
  [SpecType.MIGRATION_PLAN]: {
    title: "Migration Plan",
    subtitle: "Move & Upgrade",
    desc: "Migracja danych lub zmiana technologii.",
    icon: <ArrowRightLeft className="w-5 h-5" />,
    placeholder: "Np. Migracja bazy z Oracle na PostgreSQL przy zerowym przestoju..."
  },
  [SpecType.FEATURE_ADDITION]: {
    title: "Add Feature",
    subtitle: "Existing Project",
    desc: "Dodanie nowej funkcji do istniejącego systemu.",
    icon: <Layers className="w-5 h-5" />,
    placeholder: "Np. Dodanie logowania 2FA do istniejącego panelu admina..."
  }
};

const CATEGORIES = [
  {
    title: "Zarządzanie Projektem",
    types: [SpecType.EPIC_BREAKDOWN, SpecType.PRD, SpecType.USER_STORY]
  },
  {
    title: "Inżynieria Oprogramowania",
    types: [SpecType.SYSTEM_DESIGN, SpecType.API, SpecType.DB_SCHEMA, SpecType.COMPONENT, SpecType.MOBILE_APP, SpecType.PYTHON_MODULE, SpecType.SECURITY_REVIEW]
  },
  {
    title: "Data & Big Data",
    types: [SpecType.DATA_PIPELINE, SpecType.DATA_WAREHOUSE, SpecType.DATA_GOVERNANCE]
  },
  {
    title: "AI & Machine Learning",
    types: [SpecType.AI_MODEL, SpecType.LLM_RAG, SpecType.MLOPS_PIPELINE]
  },
  {
    title: "DevOps & QA",
    types: [SpecType.DEVOPS_CONFIG, SpecType.TEST_PLAN]
  },
  {
    title: "Utrzymanie & Rozwój (Brownfield)",
    types: [SpecType.FEATURE_ADDITION, SpecType.LEGACY_REFACTOR, SpecType.MIGRATION_PLAN]
  }
];

const EXAMPLES = [
  {
    type: SpecType.EPIC_BREAKDOWN,
    label: "Start: Telemedycyna",
    text: "Epic: e-Wizyty",
    prompt: "Otrzymałem Epic: 'Platforma do zdalnych konsultacji lekarskich'.\n\nKluczowe wymagania:\n1. Wideo-rozmowy w przeglądarce (WebRTC).\n2. Zintegrowany system e-Recept.\n3. Bezpieczeństwo danych medycznych (RODO/HIPAA).\n\nProszę o breakdown projektu, architekturę i analizę ryzyk."
  },
  {
    type: SpecType.LLM_RAG,
    label: "AI: Asystent HR",
    text: "RAG: Baza Wiedzy HR",
    prompt: "Zaprojektuj system RAG (Retrieval Augmented Generation) dla działu HR.\n- Cel: Chatbot odpowiadający na pytania o urlopy i benefity.\n- Źródło: PDFy z regulaminem pracy i intranet.\n- Bezpieczeństwo: Chatbot NIE MOŻE mieć dostępu do danych płacowych (filtrowanie uprawnień)."
  },
  {
    type: SpecType.DATA_PIPELINE,
    label: "Data: Retail Stream",
    text: "Data: Analiza Kas POS",
    prompt: "Specyfikacja potoku danych Real-Time dla sieci marketów.\n- Źródło: 2000 kas fiskalnych wysyłających paragony (JSON).\n- Cel: Wykrywanie fraudów i aktualizacja stanów magazynowych w <5 sekund.\n- Stack: Apache Kafka, Spark Streaming, Redis (cache stanow), BigQuery (analityka)."
  },
  {
    type: SpecType.DEVOPS_CONFIG,
    label: "Ops: Skalowalność",
    text: "Infra: VOD Streaming",
    prompt: "Zaprojektuj infrastrukturę dla serwisu VOD (wideo na żądanie) spodziewającego się nagłych skoków ruchu (premiere).\n- Wymagania: Global CDN, Multi-region failover (AWS).\n- Skalowalność: Auto-scaling podów K8s na podstawie metryk CPU i liczby requestów.\n- Cache: Strategia dla Redis Cluster."
  },
  {
    type: SpecType.LEGACY_REFACTOR,
    label: "Legacy: E-commerce",
    text: "Refactor: Koszyk",
    prompt: "Plan wycięcia modułu 'Checkout' z monolitu (Magento 1) do mikroserwisu (Node.js/TypeScript).\n- Powód: Błędy concurrency przy Black Friday.\n- Strategia: Wzorzec Strangler Fig.\n- Wyzwanie: Synchronizacja sesji użytkownika i stanów magazynowych między starym a nowym systemem."
  }
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<SpecType>(SpecType.EPIC_BREAKDOWN);
  const [generatedContent, setGeneratedContent] = useState('');
  const [history, setHistory] = useState<SpecHistoryItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // Draft state
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  
  // Ref for auto-scrolling
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Debounce ref for auto-save
  const saveTimeoutRef = useRef<number | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('spec-kit-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
    
    // Check for draft
    const savedDraft = localStorage.getItem('spec-kit-draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.prompt) {
          setPrompt(parsed.prompt);
          setHasDraft(true);
        }
        if (parsed.selectedType) {
          setSelectedType(parsed.selectedType);
        }
      } catch (e) {
        console.error("Failed to parse draft");
      }
    }
  }, []);

  // Save history to local storage
  useEffect(() => {
    localStorage.setItem('spec-kit-history', JSON.stringify(history));
  }, [history]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auto-save draft effect
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (prompt) {
      saveTimeoutRef.current = window.setTimeout(() => {
        const draftData = {
          prompt,
          selectedType,
          timestamp: Date.now()
        };
        localStorage.setItem('spec-kit-draft', JSON.stringify(draftData));
        setDraftSaved(true);
        setHasDraft(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [prompt, selectedType]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setInputError("Pole opisu nie może być puste.");
      return;
    }
    
    if (prompt.trim().length < 15) {
      setInputError("Opis jest zbyt krótki. Podaj więcej szczegółów (min. 15 znaków), aby AI mogło przygotować dokładną specyfikację.");
      return;
    }

    setInputError(null);
    setIsGenerating(true);
    setGeneratedContent('');
    
    const newId = Date.now().toString();
    const tempTitle = prompt.split('\n')[0].substring(0, 40) + (prompt.length > 40 ? '...' : '');
    
    const newItem: SpecHistoryItem = {
      id: newId,
      title: tempTitle,
      type: selectedType,
      content: '',
      timestamp: Date.now(),
      originalPrompt: prompt
    };
    
    setCurrentId(newId);
    
    try {
      let finalContent = '';
      await generateSpecStream(prompt, selectedType, (chunk) => {
        setGeneratedContent(chunk);
        finalContent = chunk;
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      });

      setHistory(prev => [{...newItem, content: finalContent}, ...prev]);
      
    } catch (error) {
      console.error("Generation failed", error);
      setGeneratedContent(prev => prev + "\n\n**Error:** Failed to generate specification. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistory = (item: SpecHistoryItem) => {
    setCurrentId(item.id);
    setGeneratedContent(item.content);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    if (currentId === id) {
      handleNew();
    }
  };

  const handleEditHistory = (e: React.MouseEvent, item: SpecHistoryItem) => {
    e.stopPropagation();
    setCurrentId(null);
    setGeneratedContent('');
    setPrompt(item.originalPrompt || item.title);
    setSelectedType(item.type);
    setSidebarOpen(false);
    setInputError(null);
  };

  const handleNew = () => {
    setCurrentId(null);
    setGeneratedContent('');
    setPrompt('');
    setInputError(null);
    setSidebarOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    // Use imported module
    if (!html2pdf) {
      alert("Biblioteka PDF nie została jeszcze załadowana.");
      setIsDownloadingPDF(false);
      return;
    }
    
    const element = document.getElementById('markdown-content');
    if (!element) {
      setIsDownloadingPDF(false);
      return;
    }

    try {
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.backgroundColor = 'white';
      clone.style.color = 'black';
      clone.classList.remove('dark');
      
      const allElements = clone.getElementsByTagName("*");
      for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i] as HTMLElement;
          el.style.color = 'black';
          el.style.borderColor = '#e5e7eb';
      }
      
      const buttons = clone.querySelectorAll('button, a');
      buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');

      document.body.appendChild(clone);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0px';
      clone.style.width = '800px';

      const opt = {
        margin:       10,
        filename:     `spec-${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(clone).save();
      document.body.removeChild(clone);
    } catch (e) {
      console.error("PDF Export Error", e);
      alert("Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedContent], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `spec-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
  };

  const handleExampleClick = (example: typeof EXAMPLES[0]) => {
    setSelectedType(example.type);
    setPrompt(example.prompt);
    setInputError(null);
  };

  const handleSaveDraft = () => {
    const draftData = {
      prompt,
      selectedType,
      timestamp: Date.now()
    };
    localStorage.setItem('spec-kit-draft', JSON.stringify(draftData));
    setDraftSaved(true);
    setHasDraft(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleLoadDraft = () => {
    const savedDraft = localStorage.getItem('spec-kit-draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setPrompt(parsed.prompt || '');
        if (parsed.selectedType) {
          setSelectedType(parsed.selectedType);
        }
        setInputError(null);
      } catch (e) {
        console.error("Failed to load draft");
      }
    }
  };

  return (
    <div className={`flex h-screen bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-200`}>
      <HistorySidebar 
        history={history}
        currentId={currentId}
        onSelect={handleSelectHistory}
        onNew={handleNew}
        onDelete={handleDeleteHistory}
        onEdit={handleEditHistory}
        isOpen={sidebarOpen}
      />
      
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      <InstallModal isOpen={showInstall} onClose={() => setShowInstall(false)} />

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 transition-colors duration-200">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">
                {currentId ? (history.find(h => h.id === currentId)?.title || 'Specyfikacja') : 'Nowa Specyfikacja'}
              </h1>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white md:hidden">SpecAI</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={toggleDarkMode}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Przełącz tryb ciemny"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowInstall(true)}
              className="hidden sm:flex dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              title="Instalacja lokalna"
            >
              <Laptop className="w-4 h-4 mr-2" />
              <span>Instalacja</span>
            </Button>

            <Button
              variant="secondary"
              className="mr-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              onClick={() => setShowTutorial(true)}
            >
              <HelpCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Jak zacząć?</span>
              <span className="sm:hidden">Pomoc</span>
            </Button>

            {generatedContent && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={handleCopy}
                  title="Copy Markdown"
                  className="hidden sm:flex dark:text-gray-400 dark:hover:text-white"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDownloadPDF}
                  title="Download PDF"
                  disabled={isDownloadingPDF}
                  className="hidden sm:flex dark:text-gray-400 dark:hover:text-white"
                >
                  {isDownloadingPDF ? <Loader className="w-4 h-4 animate-spin text-blue-500" /> : <FileText className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDownload}
                  title="Download Markdown"
                  className="hidden sm:flex dark:text-gray-400 dark:hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 md:p-8 scroll-smooth transition-colors duration-200">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {!generatedContent && !isGenerating ? (
               <div className="flex flex-col items-center justify-center animate-fade-in-up pb-10">
                 <div className="text-center space-y-4 mb-8">
                   <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800">
                     <Settings2 className="w-8 h-8" />
                   </div>
                   <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Co dzisiaj budujemy?</h2>
                   <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                     Wybierz kategorię i typ specyfikacji, a AI wcieli się w odpowiednią rolę eksperta.
                   </p>
                 </div>

                 <div className="w-full bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-200 dark:border-gray-800 transition-colors duration-200">
                   <div className="space-y-6">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">1. Wybierz typ dokumentu</label>
                       
                       <div className="space-y-8">
                         {CATEGORIES.map((category, catIndex) => (
                           <div key={catIndex}>
                             <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3 flex items-center">
                               <div className="w-1 h-4 bg-blue-500 rounded-full mr-2"></div>
                               {category.title}
                             </h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {category.types.map((type) => {
                                  const def = SPEC_DEFINITIONS[type];
                                  if (!def) return null;
                                  const isSelected = selectedType === type;
                                  return (
                                    <button
                                      key={type}
                                      onClick={() => setSelectedType(type)}
                                      className={`text-left p-3 rounded-lg border transition-all duration-200 relative overflow-hidden group flex flex-col h-full ${
                                        isSelected 
                                          ? 'bg-gray-900 dark:bg-blue-600 border-gray-900 dark:border-blue-600 shadow-lg transform -translate-y-0.5' 
                                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className={`p-1.5 rounded-md ${
                                          isSelected 
                                            ? 'bg-gray-800 dark:bg-blue-700 text-white' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                                          }`}>
                                          {def.icon}
                                        </div>
                                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-300"></div>}
                                      </div>
                                      <div className={`font-bold text-sm mb-0.5 ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{def.title}</div>
                                      <div className={`text-[10px] uppercase tracking-wide mb-1.5 ${isSelected ? 'text-gray-400 dark:text-blue-100' : 'text-gray-500 dark:text-gray-500'}`}>{def.subtitle}</div>
                                      <div className={`text-xs leading-relaxed mt-auto line-clamp-2 ${isSelected ? 'text-gray-300 dark:text-blue-50' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {def.desc}
                                      </div>
                                    </button>
                                  );
                                })}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     <div className="relative pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                       <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                         2. Opisz zadanie
                         <span className="normal-case font-normal text-gray-400 ml-2">(Kontekst, cel, ograniczenia)</span>
                       </label>
                       <div className="relative group">
                        <textarea
                          value={prompt}
                          onChange={(e) => {
                            setPrompt(e.target.value);
                            if (inputError) setInputError(null);
                          }}
                          placeholder={SPEC_DEFINITIONS[selectedType]?.placeholder || "Opisz co chcesz zrobić..."}
                          className={`w-full h-40 px-5 py-4 rounded-xl border focus:ring-2 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-400 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-all text-base leading-relaxed shadow-inner ${
                            inputError 
                              ? 'border-red-300 dark:border-red-700 focus:ring-red-500' 
                              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
                          }`}
                        />
                        
                        {inputError && (
                          <div className="absolute top-full left-0 mt-2 text-xs text-red-500 dark:text-red-400 font-medium flex items-center animate-fade-in bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-md border border-red-100 dark:border-red-800/30">
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> 
                            {inputError}
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                           <Button
                              variant="ghost"
                              onClick={handleSaveDraft}
                              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm h-8 px-3"
                              title="Zapisz szkic na później"
                           >
                             {draftSaved ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-600 dark:text-green-400"/> : <Save className="w-3.5 h-3.5 mr-1.5"/>}
                             <span className="text-xs font-medium">{draftSaved ? 'Zapisano' : 'Zapisz szkic'}</span>
                           </Button>
                           
                           {hasDraft && !prompt && (
                              <Button
                                variant="ghost"
                                onClick={handleLoadDraft}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50/80 dark:bg-blue-900/40 backdrop-blur-sm border border-blue-100 dark:border-blue-800 shadow-sm h-8 px-3"
                                title="Wczytaj ostatni zapisany szkic"
                              >
                                <span className="text-xs font-medium">Wczytaj szkic</span>
                              </Button>
                           )}
                        </div>

                        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                            <span className="text-xs text-gray-400 hidden sm:inline">AI sformatuje to za Ciebie</span>
                            <Button 
                              onClick={handleGenerate} 
                              disabled={!prompt.trim()} 
                              className="shadow-xl"
                              icon={<Sparkles className="w-4 h-4" />}
                            >
                              Generuj Specyfikację
                            </Button>
                        </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Quick Start Examples */}
                 <div className="mt-10 w-full max-w-5xl px-4">
                    <div className="flex items-center justify-center space-x-2 mb-4 opacity-70">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Przykładowe Prompty:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {EXAMPLES.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => handleExampleClick(ex)}
                          className="text-left p-3 rounded-xl border border-transparent bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
                        >
                          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide group-hover:text-blue-700 dark:group-hover:text-blue-300">{ex.label}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{ex.text}</div>
                        </button>
                      ))}
                    </div>
                 </div>
               </div>
            ) : (
              /* Results View */
              <div className="flex flex-col space-y-6">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                         {SPEC_DEFINITIONS[selectedType]?.subtitle || selectedType}
                       </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium text-sm md:text-base line-clamp-2">{prompt}</p>
                  </div>
                  <Button 
                     variant="secondary"
                     onClick={handleNew}
                     className="shrink-0 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                   >
                     Nowy Dokument
                   </Button>
                </div>

                <div id="markdown-content" className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 min-h-[500px] p-6 md:p-12 relative transition-colors duration-200">
                   {generatedContent ? (
                     <MarkdownRenderer content={generatedContent} />
                   ) : (
                     <div className="flex items-center justify-center h-64 text-gray-400">
                       <div className="animate-pulse flex flex-col items-center space-y-4">
                         <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                            <Sparkles className="w-6 h-6 text-blue-400 animate-spin-slow" />
                         </div>
                         <div className="text-center">
                           <div className="text-gray-900 dark:text-white font-medium mb-1">Analizuję Twój pomysł...</div>
                           <div className="text-sm text-gray-400">Dobieram odpowiednie sekcje Spec Kit</div>
                         </div>
                       </div>
                     </div>
                   )}
                   
                   {isGenerating && generatedContent && (
                     <div className="flex items-center justify-center py-4">
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full text-xs font-medium border border-gray-100 dark:border-gray-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                          <span className="ml-2">Piszę dalszą część...</span>
                        </div>
                     </div>
                   )}
                   <div ref={bottomRef} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}