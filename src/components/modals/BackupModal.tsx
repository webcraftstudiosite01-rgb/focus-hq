import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { X, Download, Upload, Copy, Check, FileJson, AlertCircle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportDataJSON, importDataJSON } = useApp();

  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-hq-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'Файл резервной копии успешно скачан на устройство!' });
  };

  const handleCopy = async () => {
    try {
      const jsonStr = exportDataJSON();
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setStatusMessage({ type: 'success', text: 'JSON скопирован в буфер обмена!' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Не удалось скопировать в буфер.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
        const res = importDataJSON(content);
        if (res.success) {
          setStatusMessage({ type: 'success', text: 'Все данные успешно восстановлены из файла!' });
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'Ошибка при импорте данных.' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    if (!importText.trim()) {
      setStatusMessage({ type: 'error', text: 'Пожалуйста, вставьте JSON данные.' });
      return;
    }
    const res = importDataJSON(importText);
    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Все данные успешно импортированы!' });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Ошибка при импорте JSON.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Резервная копия данных (JSON)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl flex items-center gap-2 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Экспорт данных
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Скачайте полный файл со всеми задачами, целями, CRM-клиентами и привычками.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                <Download className="w-4 h-4" /> Скачать .json файл
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Скопировано!' : 'Скопировать JSON'}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Импорт данных
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Восстановите данные из сохраненного файла или вставьте JSON вручную.
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer shadow-sm transition-all mb-3">
              <Upload className="w-4 h-4 text-indigo-500" /> Выбрать .json файл с диска
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <div>
              <textarea
                rows={4}
                placeholder="Или вставьте JSON содержимое здесь..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full p-3 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleManualImport}
              className="mt-2.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Применить импорт
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
