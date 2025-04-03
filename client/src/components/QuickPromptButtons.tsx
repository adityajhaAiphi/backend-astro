import React from 'react';
import { QuickPrompt } from '@/types/chat';

interface QuickPromptButtonsProps {
  prompts: QuickPrompt[];
  onPromptClick: (promptId: string) => void;
}

export const QuickPromptButtons: React.FC<QuickPromptButtonsProps> = ({
  prompts,
  onPromptClick,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg shadow-inner">
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          onClick={() => onPromptClick(prompt.id)}
          className="flex items-center justify-center gap-3 px-4 py-3 
                   text-base font-medium rounded-xl 
                   bg-white hover:bg-amber-50 
                   text-gray-800 hover:text-amber-600
                   shadow-sm hover:shadow-md
                   transition-all duration-200 ease-in-out
                   border border-amber-200 hover:border-amber-300
                   group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
            {prompt.icon}
          </span>
          <span>{prompt.text}</span>
        </button>
      ))}
    </div>
  );
};
