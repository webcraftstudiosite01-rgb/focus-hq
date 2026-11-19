import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { Lead, LeadStatus, MessageTemplate } from '../types';
import {
  Briefcase, Plus, Send, DollarSign, TrendingUp, Users, MessageSquareQuote,
  Table as TableIcon, Kanban, Copy, Check, ExternalLink, Edit, Trash2,
  PhoneCall, MessageCircle, FileText
} from 'lucide-react';

interface CRMPageProps {
  onOpenLeadModal: (lead?: Lead) => void;
  onOpenTemplateModal: (template?: MessageTemplate) => void;
  searchQuery: string;
}

export const CRMPage: React.FC<CRMPageProps> = ({
  onOpenLeadModal,
  onOpenTemplateModal,
  searchQuery,
}) => {
  const {
    leads,
    templates,
    changeLeadStatus,
    deleteLead,
    deleteTemplate,
    todayOutreachCount,
    incrementTodayOutreach,
    settings,
  } = useApp();

  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  // CRM status columns configuration
  const stages: { id: LeadStatus; label: string; badge: string; color: string }[] = [
    { id: 'contacted', label: 'Связались (1-й контакт)', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'replied', label: 'Ответил (Интерес)', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', color: 'border-indigo-400 dark:border-indigo-600' },
    { id: 'negotiating', label: 'Переговоры / КП', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', color: 'border-amber-400 dark:border-amber-600' },
    { id: 'won', label: 'Сделка (Выиграно 🎉)', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', color: 'border-emerald-500 dark:border-emerald-500' },
    { id: 'lost', label: 'Отказ', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', color: 'border-rose-300 dark:border-rose-900' },
  ];

  // Filter leads by search
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.niche.toLowerCase().includes(q) ||
        l.notes.toLowerCase().includes(q) ||
        l.contactLink.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  // CRM Analytics Calculations
  const totalLeadsCount = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'won');
  const repliedLeads = leads.filter((l) => l.status !== 'contacted');

  const totalWonIncome = wonLeads.reduce((sum, l) => sum + (Number(l.price) || 0), 0);
  const replyRate = totalLeadsCount > 0 ? Math.round((repliedLeads.length / totalLeadsCount) * 100) : 0;
  const conversionRate = totalLeadsCount > 0 ? Math.round((wonLeads.length / totalLeadsCount) * 100) : 0;

  // Copy template text
  const handleCopyTemplate = async (template: MessageTemplate) => {
    try {
      await navigator.clipboard.writeText(template.text);
      setCopiedTemplateId(template.id);
      setTimeout(() => setCopiedTemplateId(null), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  // Drag and drop for leads
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      changeLeadStatus(leadId, status);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              CRM WebCraft Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Лидогенерация
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Воронка клиентов, статус переговоров, холодный аутрич и шаблоны
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'pipeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Воронка</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Таблица</span>
            </button>
          </div>

          <button
            onClick={() => onOpenLeadModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Новый лид</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Bar & Outreach Target Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Outreach Target Widget with +1 button */}
        <div className="col-span-2 sm:col-span-1 p-5 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Аутрич план дня
            </span>
            <Send className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">{todayOutreachCount}</span>
              <span className="text-xs text-indigo-300">/ {settings.dailyOutreachTarget} сообщений</span>
            </div>
            {/* progress */}
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((todayOutreachCount / (settings.dailyOutreachTarget || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={incrementTodayOutreach}
            className="w-full mt-2 py-2 px-3 bg-white/15 hover:bg-white/25 active:scale-95 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> +1 отправлено
          </button>
        </div>

        {/* Reply Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Конверсия в ответ</span>
            <MessageCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {replyRate}%
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {repliedLeads.length} из {totalLeadsCount} вышли на диалог
            </p>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Хороший отклик аудитории
          </span>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Конверсия в сделку</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {conversionRate}%
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {wonLeads.length} закрытых сделок
            </p>
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            {wonLeads.length} довольных клиентов
          </span>
        </div>

        {/* Total Income */}
        <div className="col-span-2 sm:col-span-1 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Общий доход CRM</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ${totalWonIncome.toLocaleString()}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Сумма всех выигранных проектов
            </p>
          </div>
          <span className="text-[11px] text-slate-400">
            Средний чек: ${wonLeads.length > 0 ? Math.round(totalWonIncome / wonLeads.length) : 0}
          </span>
        </div>

      </div>

      {/* 3. Pipeline / Table View */}
      {viewMode === 'pipeline' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
            const stageSum = stageLeads.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`flex flex-col w-72 shrink-0 rounded-3xl bg-slate-100/70 dark:bg-slate-900/40 border ${stage.color} p-3.5 min-h-[460px]`}
              >
                {/* Stage Header */}
                <div className="pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {stage.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ${stageSum.toLocaleString()}
                  </div>
                </div>

                {/* Lead Cards */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[620px] pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-[11px] text-slate-400">
                      Лиды отсутствуют
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                            {lead.niche}
                          </span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            ${lead.price}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {lead.name}
                        </h4>

                        {lead.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {lead.notes}
                          </p>
                        )}

                        {lead.contactLink && (
                          <a
                            href={lead.contactLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline max-w-full truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{lead.contactLink}</span>
                          </a>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-700">
                          <span>{lead.date}</span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => onOpenLeadModal(lead)}
                              className="text-slate-400 hover:text-indigo-500 p-0.5"
                              title="Редактировать"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Удалить клиента «${lead.name}»?`)) {
                                  deleteLead(lead.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-500 p-0.5"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Клиент / Компания</th>
                  <th className="py-3.5 px-4">Ниша</th>
                  <th className="py-3.5 px-4">Контакты</th>
                  <th className="py-3.5 px-4">Статус</th>
                  <th className="py-3.5 px-4">Чек</th>
                  <th className="py-3.5 px-4">Дата</th>
                  <th className="py-3.5 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Лиды не найдены
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const currentStage = stages.find((s) => s.id === lead.status);
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {lead.name}
                          {lead.notes && (
                            <p className="text-[11px] text-slate-400 font-normal line-clamp-1">{lead.notes}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {lead.niche}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {lead.contactLink ? (
                            <a
                              href={lead.contactLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Ссылка
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => changeLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                          >
                            <option value="contacted">Связались</option>
                            <option value="replied">Ответил</option>
                            <option value="negotiating">Переговоры</option>
                            <option value="won">Сделка 🎉</option>
                            <option value="lost">Отказ</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          ${lead.price}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{lead.date}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenLeadModal(lead)}
                              className="p-1 text-slate-400 hover:text-indigo-600"
                              title="Редактировать"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Удалить клиента «${lead.name}»?`)) {
                                  deleteLead(lead.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Message Templates Section (1-Click Copy) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Шаблоны скриптов и аутрича
              </h2>
              <p className="text-xs text-slate-400">
                Копируйте готовые проверенные скрипты в один клик для Telegram, WhatsApp или Email
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenTemplateModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-500" />
            <span>Новый шаблон</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {tpl.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    {tpl.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 line-clamp-4 select-all">
                  {tpl.text}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleCopyTemplate(tpl)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    copiedTemplateId === tpl.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                  }`}
                >
                  {copiedTemplateId === tpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Скопировано в буфер!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Копировать в 1 клик</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenTemplateModal(tpl)}
                    className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Редактировать шаблон"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Удалить шаблон «${tpl.title}»?`)) {
                        deleteTemplate(tpl.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Удалить"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
