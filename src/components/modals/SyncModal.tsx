import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import QRCode from 'qrcode';
import {
  X, Cloud, RefreshCw, Check, Copy, Smartphone,
  ShieldCheck, ChevronDown, ChevronUp, AlertCircle, ArrowDownToLine, ArrowUpToLine
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

  // Local state for inputs
  const [tokenInput, setTokenInput] = useState(syncConfig.token || '');
  const [gistInput, setGistInput] = useState(syncConfig.gistId || '7c3a657df521b2075c1ee845a1a81b6f');

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pairingUrl = getMobilePairingUrl();

  useEffect(() => {
    if (syncConfig.token) {
      setTokenInput(syncConfig.token);
    }
  }, [syncConfig.token]);

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

  const handlePullFromCloud = async () => {
    setIsManualSyncing(true);
    setActionMessage(null);
    const res = await syncNow('pull');
    setIsManualSyncing(false);
    if (res.success) {
      setActionMessage({ type: 'success', text: 'Свежие данные успешно скачаны из облака!' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Ошибка скачивания из облака' });
    }
  };

  const handlePushToCloud = async () => {
    setIsManualSyncing(true);
    setActionMessage(null);
    const res = await syncNow('push');
    setIsManualSyncing(false);
    if (res.success) {
      setActionMessage({ type: 'success', text: 'Текущие данные успешно отправлены в облако!' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Ошибка отправки в облако' });
    }
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setActionMessage(null);
    const res = await syncNow();
    setIsManualSyncing(false);
    if (res.success) {
      setActionMessage({ type: 'success', text: 'Синхронизация завершена успешно!' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Ошибка синхронизации' });
    }
  };

  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    updateSyncConfig({
      token: tokenInput.trim(),
      gistId: gistInput.trim() || '7c3a657df521b2075c1ee845a1a81b6f',
      autoSync: true,
    });
    setIsManualSyncing(true);
    setActionMessage(null);
    const res = await syncNow('pull');
    setIsManualSyncing(false);
    if (res.success) {
      setActionMessage({ type: 'success', text: 'Связь установлена! Свежие данные успешно скачаны из облака.' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Ошибка загрузки данных из облака' });
    }
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
                Ноутбук ↔ Телефон: единый прогресс и задачи
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
          
          {/* Action Message Alert */}
          {actionMessage && (
            <div
              className={`p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* IF TOKEN IS NOT SET YET */}
          {!syncConfig.token ? (
            <form onSubmit={handleConnectToken} className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Синхронизация пока не включена в этом браузере
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Вставьте ваш GitHub токен (или нажмите «Вставить из буфера»), чтобы подключить это устройство к общей базе:
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  GitHub Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Вставьте токен сюда..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clip = await navigator.clipboard.readText();
                        if (clip) setTokenInput(clip.trim());
                      } catch {
                        // ignore
                      }
                    }}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    Вставить
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                <Cloud className="w-4 h-4" />
                <span>Подключить и загрузить данные</span>
              </button>
            </form>
          ) : (
            /* IF TOKEN IS CONNECTED */
            <div className="space-y-4">
              
              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center justify-between gap-3">
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
                          : 'Связь активна'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleManualSync}
                    disabled={isManualSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-indigo-500' : ''}`} />
                    <span>{isManualSyncing ? 'Синхронизация...' : 'Обновить'}</span>
                  </button>
                </div>

                {/* Direct Force Pull / Push Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                  <button
                    type="button"
                    onClick={handlePullFromCloud}
                    disabled={isManualSyncing}
                    className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Скачать из облака</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePushToCloud}
                    disabled={isManualSyncing}
                    className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ArrowUpToLine className="w-3.5 h-3.5" />
                    <span>Отправить в облако</span>
                  </button>
                </div>
              </div>

              {/* Connect Phone Card (QR & Link) */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Как подключить телефон за 5 секунд
                  </h3>
                </div>

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
                        Камера смартфона
                      </span>
                    </div>
                  ) : (
                    <div className="w-36 h-36 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                  )}

                  {/* Instructions and copy button */}
                  <div className="flex-1 space-y-3 w-full">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Отсканируйте QR-код или скопируйте ссылку и откройте её на телефоне. Ссылка автоматически настроит телефон без ввода ключей!
                    </p>

                    <div>
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
                            <span>Ссылка скопирована!</span>
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

            </div>
          )}

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
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      GitHub Personal Access Token
                    </label>
                    {tokenInput && (
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(tokenInput);
                          setActionMessage({ type: 'success', text: 'Токен скопирован в буфер обмена!' });
                        }}
                        className="text-[11px] text-indigo-500 hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Скопировать</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateSyncConfig({
                        token: '',
                        gistId: '7c3a657df521b2075c1ee845a1a81b6f',
                      });
                      setTokenInput('');
                    }}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Отключить токен
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateSyncConfig({
                        token: tokenInput.trim(),
                        gistId: gistInput.trim(),
                        autoSync: true,
                      });
                      handleManualSync();
                    }}
                    className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
                  >
                    Сохранить параметры
                  </button>
                </div>
              </div>
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
