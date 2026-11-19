// Cloud Synchronization Service for Focus HQ using Private GitHub Gists
import { AppDataBackup } from '../types';

export interface SyncConfig {
  token: string;
  gistId: string;
  autoSync: boolean;
  lastSyncTime?: string;
  lastSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  lastRemoteUpdatedAt?: number;
}

const SYNC_CONFIG_KEY = 'focus_hq_sync_config';
export const DEFAULT_GIST_ID = '7c3a657df521b2075c1ee845a1a81b6f';

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  token: '',
  gistId: DEFAULT_GIST_ID,
  autoSync: true,
};

export const syncService = {
  getConfig(): SyncConfig {
    try {
      if (typeof window === 'undefined') return DEFAULT_SYNC_CONFIG;

      // Check URL query params for phone pairing (?syncToken=...&gistId=...)
      let urlToken: string | null = null;
      let urlGist: string | null = null;

      const urlParams = new URLSearchParams(window.location.search);
      urlToken = urlParams.get('syncToken');
      urlGist = urlParams.get('gistId');

      if (!urlToken && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.substring(window.location.hash.indexOf('?') + 1);
        const hashParams = new URLSearchParams(hashQuery);
        urlToken = hashParams.get('syncToken');
        urlGist = hashParams.get('gistId');
      }

      if (urlToken && urlToken.trim()) {
        const pairedConfig: SyncConfig = {
          token: urlToken.trim(),
          gistId: (urlGist && urlGist.trim()) || DEFAULT_GIST_ID,
          autoSync: true,
        };
        localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(pairedConfig));

        // Clean up URL without reloading
        const cleanUrl = window.location.pathname + (window.location.hash.split('?')[0] || '');
        window.history.replaceState({}, document.title, cleanUrl);
        return pairedConfig;
      }

      const raw = localStorage.getItem(SYNC_CONFIG_KEY);
      if (!raw) {
        return DEFAULT_SYNC_CONFIG;
      }

      const stored = JSON.parse(raw) as Partial<SyncConfig>;
      const merged: SyncConfig = {
        token: stored.token ? stored.token.trim() : '',
        gistId: (stored.gistId && stored.gistId.trim()) ? stored.gistId.trim() : DEFAULT_GIST_ID,
        autoSync: stored.autoSync !== undefined ? stored.autoSync : true,
        lastSyncTime: stored.lastSyncTime,
        lastSyncStatus: stored.lastSyncStatus,
        lastRemoteUpdatedAt: stored.lastRemoteUpdatedAt,
      };

      return merged;
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
    if (!cfg.token) return '';
    const base = 'https://webcraftstudiosite01-rgb.github.io/focus-hq/';
    return `${base}?syncToken=${encodeURIComponent(cfg.token)}&gistId=${encodeURIComponent(cfg.gistId || DEFAULT_GIST_ID)}`;
  },

  async pushToCloud(data: AppDataBackup): Promise<{ success: boolean; error?: string; timestamp?: number }> {
    const cfg = this.getConfig();
    if (!cfg.token || !cfg.gistId) {
      return { success: false, error: 'Токен GitHub не настроен' };
    }

    try {
      const nowEpoch = Date.now();
      const payload: AppDataBackup = {
        ...data,
        updatedAtTimestamp: nowEpoch,
        exportedAt: new Date(nowEpoch).toISOString(),
      };

      const response = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${cfg.token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `Focus HQ Sync (${new Date(nowEpoch).toLocaleString('ru-RU')})`,
          files: {
            'focus_hq_data.json': {
              content: JSON.stringify(payload, null, 2),
            },
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `Ошибка сервера GitHub: ${response.status}`);
      }

      cfg.lastSyncTime = new Date(nowEpoch).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      cfg.lastSyncStatus = 'success';
      cfg.lastRemoteUpdatedAt = nowEpoch;
      this.saveConfig(cfg);

      return { success: true, timestamp: nowEpoch };
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
      return { success: false, error: 'Токен GitHub не настроен' };
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${cfg.gistId}?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${cfg.token}`,
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
      const remoteTs = parsed.updatedAtTimestamp || (parsed.exportedAt ? new Date(parsed.exportedAt).getTime() : Date.now());
      parsed.updatedAtTimestamp = remoteTs;

      cfg.lastSyncTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      cfg.lastSyncStatus = 'success';
      cfg.lastRemoteUpdatedAt = remoteTs;
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
