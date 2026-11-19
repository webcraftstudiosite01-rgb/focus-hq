import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../../types';
import { useApp } from '../../store/AppContext';
import { getTodayString } from '../../utils/dateUtils';
import { X, DollarSign, User, Link as LinkIcon, Briefcase, Calendar, FileText } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, leadToEdit }) => {
  const { addLead, updateLead } = useApp();

  const [name, setName] = useState('');
  const [contactLink, setContactLink] = useState('');
  const [niche, setNiche] = useState('E-commerce');
  const [status, setStatus] = useState<LeadStatus>('contacted');
  const [price, setPrice] = useState<number>(500);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(getTodayString());

  const commonNiches = [
    'HoReCa / Рестораны',
    'Стоматология / Медицина',
    'E-commerce / Ритейл',
    'Спорт и фитнес',
    'Юридические услуги',
    'Автосервисы / Недвижимость',
    'Строительство / Ремонт',
    'Онлайн-образование',
  ];

  useEffect(() => {
    if (leadToEdit) {
      setName(leadToEdit.name);
      setContactLink(leadToEdit.contactLink);
      setNiche(leadToEdit.niche);
      setStatus(leadToEdit.status);
      setPrice(leadToEdit.price);
      setNotes(leadToEdit.notes);
      setDate(leadToEdit.date);
    } else {
      setName('');
      setContactLink('');
      setNiche('E-commerce');
      setStatus('contacted');
      setPrice(500);
      setNotes('');
      setDate(getTodayString());
    }
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (leadToEdit) {
      updateLead(leadToEdit.id, {
        name: name.trim(),
        contactLink: contactLink.trim(),
        niche: niche.trim(),
        status,
        price: Number(price) || 0,
        notes: notes.trim(),
        date,
      });
    } else {
      addLead({
        name: name.trim(),
        contactLink: contactLink.trim(),
        niche: niche.trim(),
        status,
        price: Number(price) || 0,
        notes: notes.trim(),
        date,
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
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {leadToEdit ? 'Редактировать клиента / лида' : 'Новый лид в CRM'}
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
          {/* Client Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              <User className="w-3.5 h-3.5" /> Имя клиента / Название компании <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Например: Иван (Клиника «Дента»)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Contact link */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              <LinkIcon className="w-3.5 h-3.5" /> Ссылка на контакт (Telegram / WhatsApp / Email / Сайт)
            </label>
            <input
              type="text"
              placeholder="https://t.me/username или email"
              value={contactLink}
              onChange={(e) => setContactLink(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Niche & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Ниша / Сфера
              </label>
              <input
                type="text"
                list="lead-niches"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Выберите нишу"
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="lead-niches">
                {commonNiches.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Чек сделки ($)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Статус воронки
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="contacted">Связались (отправлено)</option>
                <option value="replied">Ответил (интерес)</option>
                <option value="negotiating">Переговоры / КП</option>
                <option value="won">Сделка (Выиграно 🎉)</option>
                <option value="lost">Отказ (Проиграно)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Дата контакта
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              <FileText className="w-3.5 h-3.5" /> Заметки по сделке
            </label>
            <textarea
              rows={3}
              placeholder="О чем договорились, боли клиента, требования по сайту..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Footer Submit */}
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
              {leadToEdit ? 'Сохранить изменения' : 'Добавить лида'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
