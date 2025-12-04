import React, { useState, useEffect, useId } from 'react';
import { Copy, Check, Workflow, ExternalLink, AlertTriangle } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

// Helper to handle bold/code inline
const parseInlineStyles = (text: string): React.ReactNode => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-gray-700">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const MermaidBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);
  // Generate a unique ID for this chart instance, sanitize for mermaid
  const uniqueId = `mermaid-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    const renderChart = async () => {
      const mermaid = (window as any).mermaid;
      if (!mermaid) {
        // Retry once if mermaid isn't loaded yet
        setTimeout(() => {
           if ((window as any).mermaid) renderChart();
        }, 500);
        return;
      }

      try {
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose',
        });
        
        // Render the diagram
        const { svg } = await mermaid.render(uniqueId, code);
        setSvgContent(svg);
        setError(null);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError(err);
        setSvgContent(null);
      }
    };

    renderChart();
  }, [code, uniqueId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-blue-200 dark:border-blue-900 overflow-hidden shadow-sm bg-white dark:bg-gray-900/50">
      {/* Mermaid Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-blue-50/80 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
          <Workflow className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Diagram</span>
        </div>
        <div className="flex items-center space-x-3">
            <a 
            href="https://mermaid.live/" 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center"
            title="Otwórz w Mermaid Live Editor"
          >
            Edytuj <ExternalLink className="w-3 h-3 ml-1" />
          </a>
          <button 
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Skopiowano</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Kod</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Content: SVG or Fallback Code */}
      <div className="p-4 bg-white dark:bg-gray-900 overflow-x-auto flex justify-center">
          {error ? (
            <div className="w-full">
               <div className="flex items-center text-amber-600 text-xs mb-2">
                 <AlertTriangle className="w-4 h-4 mr-1" /> Błąd renderowania diagramu. Poniżej znajduje się kod źródłowy:
               </div>
               <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                 <code>{code}</code>
               </pre>
            </div>
          ) : svgContent ? (
             <div 
               className="mermaid-svg-container"
               dangerouslySetInnerHTML={{ __html: svgContent }} 
             />
          ) : (
            <div className="animate-pulse text-xs text-gray-400 py-4">Renderowanie diagramu...</div>
          )}
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  return (
      <div className="my-4 rounded-lg bg-gray-900 dark:bg-gray-950 p-4 overflow-x-auto border border-gray-700 dark:border-gray-800 shadow-sm relative group">
        {language && (
          <div className="absolute top-2 right-2 text-xs text-gray-500 uppercase tracking-wider select-none font-bold">
            {language}
          </div>
        )}
        <pre className="text-sm font-mono text-gray-100 mt-2">
          <code>{code}</code>
        </pre>
      </div>
  );
}

// A simplified markdown renderer. 
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedLines: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    // Handle Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of block
        const code = codeBuffer.join('\n');
        
        if (codeBlockLanguage.toLowerCase() === 'mermaid') {
           renderedLines.push(<MermaidBlock key={`mermaid-${index}`} code={code} />);
        } else {
           renderedLines.push(<CodeBlock key={`code-${index}`} code={code} language={codeBlockLanguage} />);
        }

        codeBuffer = [];
        inCodeBlock = false;
        codeBlockLanguage = '';
      } else {
        // Start of block
        inCodeBlock = true;
        codeBlockLanguage = line.trim().replace('```', '');
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Handle Headers
    if (line.startsWith('### ')) {
      renderedLines.push(<h3 key={index} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-2 flex items-center"><span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3 inline-block"></span>{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('## ')) {
      renderedLines.push(
        <div key={index} className="mt-8 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
             {line.replace('## ', '')}
          </h2>
        </div>
      );
    } else if (line.startsWith('# ')) {
      renderedLines.push(<h1 key={index} className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 mb-6">{line.replace('# ', '')}</h1>);
    } else if (line.startsWith('#### ')) {
       renderedLines.push(<h4 key={index} className="text-base font-bold text-gray-700 dark:text-gray-300 mt-4 mb-2">{line.replace('#### ', '')}</h4>);
    }
    // Handle Lists (Basic support)
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
       renderedLines.push(
        <div key={index} className="flex items-start ml-4 mb-1.5">
          <span className="mr-2 text-blue-500 dark:text-blue-400 font-bold">•</span>
          <span className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{parseInlineStyles(line.replace(/^[-*]\s/, ''))}</span>
        </div>
       );
    }
    // Handle Blockquotes
    else if (line.startsWith('> ')) {
       renderedLines.push(
         <blockquote key={index} className="border-l-4 border-amber-400 pl-4 py-2 my-4 bg-amber-50 dark:bg-amber-900/10 italic text-gray-700 dark:text-gray-300 rounded-r-lg">
           {line.replace('> ', '')}
         </blockquote>
       );
    }
    // Handle Empty Lines
    else if (line.trim() === '') {
      renderedLines.push(<div key={index} className="h-2"></div>);
    }
    // Paragraphs
    else {
      renderedLines.push(
        <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2 text-sm md:text-base">
          {parseInlineStyles(line)}
        </p>
      );
    }
  });

  return <div className="markdown-body w-full">{renderedLines}</div>;
};

export default MarkdownRenderer;