import React from 'react';
import { SpecHistoryItem, SpecType } from '../types';
import { FileText, Clock, Plus, Trash2, Pencil } from 'lucide-react';

interface HistorySidebarProps {
  history: SpecHistoryItem[];
  currentId: string | null;
  onSelect: (item: SpecHistoryItem) => void;
  onNew: () => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onEdit: (e: React.MouseEvent, item: SpecHistoryItem) => void;
  isOpen: boolean;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  history, 
  currentId, 
  onSelect, 
  onNew,
  onDelete,
  onEdit,
  isOpen
}) => {
  return (
    <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 dark:text-white tracking-tight">SpecAI Kit</span>
        </div>
      </div>

      <div className="p-3 bg-white dark:bg-gray-900">
        <button 
          onClick={onNew}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Spec
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 bg-white dark:bg-gray-900">
        <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 mt-4">Recent Specs</h3>
        <div className="space-y-1">
          {history.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-600 px-2 italic">No history yet</div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`group relative w-full text-left px-3 py-2.5 rounded-md text-sm flex items-start space-x-3 transition-colors cursor-pointer pr-14 ${
                  currentId === item.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                }`}
              >
                <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${currentId === item.id ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    <span className="truncate">{item.type}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1 pl-2 bg-gradient-to-l from-white via-white to-transparent dark:from-gray-800 dark:via-gray-800">
                  <button 
                    onClick={(e) => onEdit(e, item)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Edit Prompt"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => onDelete(e, item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;