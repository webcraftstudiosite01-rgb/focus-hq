import React, { useState, useEffect } from 'react';
import { MessageTemplate } from '../../types';
import { useApp } from '../../store/AppContext';
import { X, MessageSquareQuote } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit?: MessageTemplate | null;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  templateToEdit,
}) => {
  const { addTemplate, updateTemplate } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Первый контакт');
  const [text, setText] = useState('');

  useEffect(() => {
    if (templateToEdit) {
      setTitle(templateToEdit.title);
      setCategory(templateToEdit.category);
      setText(templateToEdit.text);
    } else {
      setTitle('');
      setCategory('Первый контакт');
      setText('');
    }
  }, [templateToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    if (templateToEdit) {
      updateTemplate(templateToEdit.id, {
        title: title.trim(),
        category: category.trim(),
        text: text.trim(),
      });
    } else {
      addTemplate({
        title: title.trim(),
        category: category.trim(),
        text: text.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {templateToEdit ? 'Редактировать шаблон' : 'Новый шаблон сообщения'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Название шаблона <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Например: Холодный аутрич в Telegram (Стоматологии)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Категория / Этап
            </label>
            <input
              type="text"
              placeholder="Первый контакт, Follow-up, Переговоры"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Текст сообщения <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              placeholder="Введите текст скрипта для быстрой вставки..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all"
            >
              {templateToEdit ? 'Сохранить изменения' : 'Создать шаблон'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
