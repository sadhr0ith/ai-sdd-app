import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, Map, FileText, Layout } from 'lucide-react';
import Button from './Button';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Witaj w SpecAI Kit!",
    icon: <BookOpen className="w-8 h-8 text-blue-600" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 text-lg font-medium leading-relaxed">
          To narzędzie pomoże Ci pisać profesjonalną dokumentację, nawet jeśli nigdy wcześniej tego nie robiłeś.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          W świecie IT, zanim napiszemy kod, tworzymy "Specyfikacje". To tak jak <strong>projekt architektoniczny domu</strong> przed wylaniem fundamentów.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mt-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-1">Dlaczego to ważne?</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Bez planu (Specyfikacji) programiści często budują złe rzeczy. SpecAI działa jak Twój bardzo doświadczony starszy kolega, który zadaje właściwe pytania i układa Twój pomysł w profesjonalny dokument.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Krok 1: Co chcesz zbudować?",
    icon: <Map className="w-8 h-8 text-purple-600" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          W zależności od tego, na jakim etapie jesteś, potrzebujesz innego dokumentu. Użyjmy analogii budowy domu:
        </p>
        
        <div className="space-y-3 mt-4">
          <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md mr-3 shrink-0">
              <FileText className="w-5 h-5 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">Mam pomysł na pokój (PRD)</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Wybierz <strong>PRD</strong>, jeśli wiesz CO chcesz zrobić (np. "Chcę dodać logowanie przez Google"), ale nie wiesz jeszcze jak to zakodować. To opis dla ludzi, nie dla komputerów.
              </p>
            </div>
          </div>

          <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
             <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-md mr-3 shrink-0">
              <Layout className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">Projektuję instalację (System Design)</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Wybierz <strong>System Design</strong>, jeśli planujesz technikalia: bazy danych, API, serwery. To techniczny plan dla inżynierów.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Krok 2: Opisz to po swojemu",
    icon: <Layout className="w-8 h-8 text-amber-600" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Nie musisz używać trudnych słów. AI zna standardy (Spec Kit). Ty po prostu opisz problem własnymi słowami.
        </p>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100 text-[10px] font-bold px-2 py-1 rounded-bl">PRZYKŁAD</div>
          <p className="font-medium text-gray-900 dark:text-white mb-2">Co wpisujesz Ty:</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-white dark:bg-gray-800 p-2 rounded border border-amber-100 dark:border-amber-800">
            "Chcę zrobić czat dla pracowników. Musi być bezpieczny i działać na telefonach. Nie chcemy na razie wysyłania plików, tylko tekst."
          </p>
          
          <div className="flex justify-center my-2">
            <span className="text-amber-500 font-bold">⬇️ SpecAI zamienia to na: ⬇️</span>
          </div>

          <p className="font-medium text-gray-900 dark:text-white mb-2">Co dostajesz:</p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside bg-white dark:bg-gray-800 p-2 rounded border border-amber-100 dark:border-amber-800 space-y-1">
            <li><strong>Goal:</strong> Secure real-time messaging implementation...</li>
            <li><strong>Non-Goal:</strong> File transfer protocol (out of scope)...</li>
            <li><strong>Security:</strong> End-to-end encryption requirement...</li>
            <li><strong>Mobile:</strong> Responsive design strategy...</li>
          </ul>
        </div>
      </div>
    )
  }
];

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const currentStep = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 p-1.5 rounded-lg text-sm">🎓</span>
            Poradnik dla początkujących
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-50 dark:bg-gray-800 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              {currentStep.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{currentStep.title}</h3>
          </div>
          {currentStep.content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
          <div className="flex space-x-1.5">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-2 rounded-full transition-all duration-300 ${i === step ? 'bg-blue-600 dark:bg-blue-500 w-6' : 'bg-gray-300 dark:bg-gray-700'}`} 
              />
            ))}
          </div>
          <div className="flex space-x-3">
            {step > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => setStep(s => s - 1)}
                className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Wstecz
              </Button>
            )}
            <Button 
              variant="primary" 
              onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : onClose()}
              className="shadow-lg shadow-blue-500/30 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {step < STEPS.length - 1 ? (
                <span className="flex items-center">Dalej <ChevronRight className="w-4 h-4 ml-1" /></span>
              ) : "Zaczynamy!"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;