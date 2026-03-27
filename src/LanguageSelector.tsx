import { Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      <div className="flex gap-2">
        <button
          onClick={() => setLanguage('es')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            language === 'es'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Español
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            language === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
}
