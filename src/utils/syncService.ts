// Cloud Synchronization Service for Focus HQ using Private GitHub Gists
import { AppDataBackup } from '../types';

export interface SyncConfig {
  token: string;
  gistId: string;
  autoSync: boolean;
  lastSyncTime?: string;
  lastSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

const SYNC_CONFIG_KEY = 'focus_hq_sync_config';

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  token: '',
  gistId: '7c3a657df521b2075c1ee845a1a81b6f',
  autoSync: false,
};

export const syncService = {
  getConfig(): SyncConfig {
    try {
      if (typeof window === 'undefined') return DEFAULT_SYNC_CONFIG;

      // First check URL query params for phone pairing (?syncToken=...&gistId=...)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('syncToken');
      const urlGist = urlParams.get('gistId');

      if (urlToken && urlGist) {
        const pairedConfig: SyncConfig = {
          token: urlToken,
          gistId: urlGist,
          autoSync: true,
        };
        localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(pairedConfig));

        // Clean up URL without reloading
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        return pairedConfig;
      }

      const stored = localStorage.getItem(SYNC_CONFIG_KEY);
      if (!stored) {
        // Preset with the default user's gist config
        localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(DEFAULT_SYNC_CONFIG));
        return DEFAULT_SYNC_CONFIG;
      }
      return JSON.parse(stored) as SyncConfig;
    } catch (e) {
      console.warn('[SyncService] Failed to read config:', e);
      return DEFAULT_SYNC_CONFIG;
    }
  },

  saveConfig(config: SyncConfig): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
      }
    } catch (e) {
      console.warn('[SyncService] Failed to save config:', e);
    }
  },

  getMobilePairingUrl(config?: SyncConfig): string {
    const cfg = config || this.getConfig();
    if (!cfg.token || !cfg.gistId) return '';
    const base = 'https://webcraftstudiosite01-rgb.github.io/focus-hq/';
    return `${base}?syncToken=${encodeURIComponent(cfg.token)}&gistId=${encodeURIComponent(cfg.gistId)}`;
  },

  async pushToCloud(data: AppDataBackup): Promise<{ success: boolean; error?: string }> {
    const cfg = this.getConfig();
    if (!cfg.token || !cfg.gistId) {
      return { success: false, error: 'Токен или Gist ID не настроены' };
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${cfg.token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `Focus HQ Backup (${new Date().toLocaleString('ru-RU')})`,
          files: {
            'focus_hq_data.json': {
              content: JSON.stringify(data, null, 2),
            },
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `Ошибка сервера GitHub: ${response.status}`);
      }

      cfg.lastSyncTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      cfg.lastSyncStatus = 'success';
      this.saveConfig(cfg);

      return { success: true };
    } catch (err: unknown) {
      console.error('[SyncService] Push failed:', err);
      cfg.lastSyncStatus = 'error';
      cfg.errorMessage = err instanceof Error ? err.message : 'Ошибка отправки в облако';
      this.saveConfig(cfg);
      return { success: false, error: cfg.errorMessage };
    }
  },

  async pullFromCloud(): Promise<{ success: boolean; data?: AppDataBackup; error?: string }> {
    const cfg = this.getConfig();
    if (!cfg.token || !cfg.gistId) {
      return { success: false, error: 'Токен или Gist ID не настроены' };
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
        headers: {
          'Authorization': `token ${cfg.token}`,
          'Accept': 'application/vnd.github+json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки данных из GitHub: ${response.status}`);
      }

      const gist = await response.json();
      const file = gist.files?.['focus_hq_data.json'];
      if (!file || !file.content) {
        return { success: false, error: 'Файл данных не найден в Gist' };
      }

      const parsed = JSON.parse(file.content) as AppDataBackup;
      cfg.lastSyncTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      cfg.lastSyncStatus = 'success';
      this.saveConfig(cfg);

      return { success: true, data: parsed };
    } catch (err: unknown) {
      console.error('[SyncService] Pull failed:', err);
      cfg.lastSyncStatus = 'error';
      cfg.errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки из облака';
      this.saveConfig(cfg);
      return { success: false, error: cfg.errorMessage };
    }
  },
};
