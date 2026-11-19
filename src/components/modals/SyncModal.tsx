import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import QRCode from 'qrcode';
import {
  X, Cloud, RefreshCw, Check, Copy, ExternalLink, QrCode, Smartphone,
  Laptop, ShieldCheck, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const {
    syncConfig,
    syncStatus,
    lastSyncTime,
    syncNow,
    updateSyncConfig,
    getMobilePairingUrl,
  } = useApp();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Local state for advanced inputs
  const [tokenInput, setTokenInput] = useState(syncConfig.token || '');
  const [gistInput, setGistInput] = useState(syncConfig.gistId || '');

  const pairingUrl = getMobilePairingUrl();

  useEffect(() => {
    if (pairingUrl) {
      QRCode.toDataURL(pairingUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url: string) => setQrCodeDataUrl(url))
        .catch((err: unknown) => console.warn('QR error:', err));
    }
  }, [pairingUrl, isOpen]);

  if (!isOpen) return null;

  const handleCopyPairingLink = async () => {
    try {
      await navigator.clipboard.writeText(pairingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await syncNow();
    setIsManualSyncing(false);
  };

  const handleSaveAdvanced = (e: React.FormEvent) => {
    e.preventDefault();
    updateSyncConfig({
      token: tokenInput.trim(),
      gistId: gistInput.trim(),
    });
    handleManualSync();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Облачная синхронизация Focus HQ
              </h2>
              <p className="text-xs text-slate-400">
                Единый прогресс между ноутбуком и телефоном в реальном времени
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Status Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncStatus === 'syncing' ? 'bg-amber-400' : syncStatus === 'error' ? 'bg-rose-400' : 'bg-emerald-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  syncStatus === 'syncing' ? 'bg-amber-500' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                }`} />
              </span>

              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Облако подключено (GitHub Gist)</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {syncStatus === 'syncing'
                    ? 'Синхронизация данных...'
                    : lastSyncTime
                    ? `Последняя синхронизация: ${lastSyncTime}`
                    : 'Готово к синхронизации'}
                </div>
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isManualSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-indigo-500' : ''}`} />
              <span>{isManualSyncing ? 'Синхронизация...' : 'Обновить сейчас'}</span>
            </button>
          </div>

          {/* Connect Phone Card (QR & Link) */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Подключить телефон за 5 секунд
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Отсканируйте QR-код камерой смартфона или скопируйте ссылку и отправьте себе в Избранное в Telegram / WhatsApp. Телефон автоматически подключится к вашей базе!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
              {/* QR Image */}
              {qrCodeDataUrl ? (
                <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 shrink-0">
                  <img
                    src={qrCodeDataUrl}
                    alt="Focus HQ Mobile Sync QR"
                    className="w-36 h-36 rounded-lg block"
                  />
                  <span className="block text-[10px] text-center font-semibold text-slate-500 mt-1">
                    Наведите камеру
                  </span>
                </div>
              ) : (
                <div className="w-36 h-36 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
              )}

              {/* Instructions and copy button */}
              <div className="flex-1 space-y-3 w-full">
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center shrink-0 font-bold">1</span>
                    <span>Отсканируйте код или откройте ссылку на телефоне</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center shrink-0 font-bold">2</span>
                    <span>Все задачи, цели и клиенты загрузятся мгновенно</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center shrink-0 font-bold">3</span>
                    <span>Любое изменение на телефоне сразу появится на ноутбуке</span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleCopyPairingLink}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Ссылка скопирована в буфер!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Скопировать ссылку для телефона</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Sync Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Автоматическая синхронизация при изменениях
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Сохранять данные в облако через 2 сек после добавления или завершения задачи
              </span>
            </div>
            <input
              type="checkbox"
              checked={syncConfig.autoSync}
              onChange={(e) => updateSyncConfig({ autoSync: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Advanced / Credentials Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 font-semibold"
            >
              <span>Параметры подключения (GitHub Token & Gist ID)</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <form onSubmit={handleSaveAdvanced} className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Gist ID
                  </label>
                  <input
                    type="text"
                    value={gistInput}
                    onChange={(e) => setGistInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    GitHub Personal Access Token
                  </label>
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
                  >
                    Сохранить параметры
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Footer */}
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
