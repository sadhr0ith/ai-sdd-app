import React, { useState } from 'react';
import { X, Terminal, Check, Copy, Laptop, Monitor, Command, Key } from 'lucide-react';
import Button from './Button';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: "1. Pobierz kod",
      desc: "Utwórz folder dla projektu.",
      cmd: "mkdir spec-ai-kit && cd spec-ai-kit"
    },
    {
      title: "2. Utwórz pliki",
      desc: "Skopiuj zawartość plików (package.json, vite.config.ts, index.html...) do tego folderu.",
      cmd: "# (Ręczne kopiowanie plików)"
    },
    {
      title: "3. Instalacja zależności",
      desc: "Użyj npm, aby pobrać biblioteki.",
      cmd: "npm install"
    },
    {
      title: "4. Konfiguracja API Key",
      desc: "Utwórz plik .env i dodaj swój klucz Gemini (z aistudio.google.com).",
      cmd: "echo 'API_KEY=TwojKluczTutaj' > .env"
    },
    {
      title: "5. Uruchom aplikację",
      desc: "Start lokalnego serwera deweloperskiego.",
      cmd: "npm run dev"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-1.5 rounded-lg">
              <Terminal className="w-5 h-5" />
            </span>
            Instalacja Lokalna
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-50 dark:bg-gray-800 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-950">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start">
            <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Wymagania wstępne</p>
              <p>Musisz mieć zainstalowane <strong>Node.js</strong> (wersja 16 lub nowsza) na swoim komputerze.</p>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc}</p>
                  </div>
                </div>
                <div className="bg-gray-900 dark:bg-gray-950 px-4 py-3 flex items-center justify-between group">
                  <code className="text-gray-100 font-mono text-sm break-all">{step.cmd}</code>
                  {step.cmd !== "# (Ręczne kopiowanie plików)" && (
                    <button
                      onClick={() => handleCopy(step.cmd, index)}
                      className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-700 ml-2 shrink-0"
                      title="Skopiuj komendę"
                    >
                      {copiedStep === index ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <Monitor className="w-4 h-4 mr-2 text-gray-500" />
              Struktura plików
            </h3>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
              <div className="flex flex-col space-y-1">
                <div className="text-gray-800 dark:text-gray-200 font-bold">/spec-ai-kit</div>
                <div className="pl-4">├── .env <span className="text-green-600 dark:text-green-400 font-bold ml-2">← (Utwórz ten plik!)</span></div>
                <div className="pl-4">├── package.json</div>
                <div className="pl-4">├── vite.config.ts</div>
                <div className="pl-4">├── index.html</div>
                <div className="pl-4">├── src/</div>
                <div className="pl-8">├── index.tsx</div>
                <div className="pl-8">├── App.tsx</div>
                <div className="pl-8">├── types.ts</div>
                <div className="pl-8">├── services/</div>
                <div className="pl-12">└── gemini.ts</div>
                <div className="pl-8">└── components/</div>
                <div className="pl-12">├── Button.tsx</div>
                <div className="pl-12">├── MarkdownRenderer.tsx</div>
                <div className="pl-12">├── HistorySidebar.tsx</div>
                <div className="pl-12">├── TutorialModal.tsx</div>
                <div className="pl-12">└── InstallModal.tsx</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;