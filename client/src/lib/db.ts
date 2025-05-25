import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { encrypt, decrypt } from './encryption';

interface VaultItem {
  id?: number;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
  favorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityAlert {
  id?: number;
  type: 'breach' | 'weak' | 'reused';
  description: string;
  metadata?: any;
  resolved?: boolean;
  createdAt: Date;
  vaultItemId?: number;
}

interface ActivityLog {
  id?: number;
  action: string;
  details?: string;
  timestamp: Date;
}

interface UserSettings {
  id?: number;
  theme: 'light' | 'dark' | 'system';
  biometricEnabled: boolean;
  autoLockTimeout: number; // in minutes
  syncEnabled: boolean;
}

interface VaultSchema extends DBSchema {
  vault_items: {
    key: number;
    value: VaultItem;
    indexes: { 'by-category': string };
  };
  security_alerts: {
    key: number;
    value: SecurityAlert;
    indexes: { 'by-type': string; 'by-resolved': boolean };
  };
  activity_logs: {
    key: number;
    value: ActivityLog;
    indexes: { 'by-timestamp': Date };
  };
  settings: {
    key: number;
    value: UserSettings;
  };
}

class LocalDatabase {
  private db: IDBPDatabase<VaultSchema> | null = null;
  private encryptionKey: string | null = null;

  async initialize(encryptionKey: string): Promise<void> {
    this.encryptionKey = encryptionKey;
    
    this.db = await openDB<VaultSchema>('secure-vault-db', 1, {
      upgrade(db) {
        // Create stores
        const vaultStore = db.createObjectStore('vault_items', { keyPath: 'id', autoIncrement: true });
        vaultStore.createIndex('by-category', 'category');
        
        const alertsStore = db.createObjectStore('security_alerts', { keyPath: 'id', autoIncrement: true });
        alertsStore.createIndex('by-type', 'type');
        alertsStore.createIndex('by-resolved', 'resolved');
        
        const logsStore = db.createObjectStore('activity_logs', { keyPath: 'id', autoIncrement: true });
        logsStore.createIndex('by-timestamp', 'timestamp');
        
        db.createObjectStore('settings', { keyPath: 'id', autoIncrement: true });
      },
    });
  }

  isInitialized(): boolean {
    return this.db !== null && this.encryptionKey !== null;
  }

  // Vault Items CRUD
  
  async addVaultItem(item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<VaultItem> {
    if (!this.db || !this.encryptionKey) throw new Error('Database not initialized');
    
    const now = new Date();
    const encryptedItem = {
      ...item,
      password: encrypt(item.password, this.encryptionKey),
      createdAt: now,
      updatedAt: now,
    };
    
    const id = await this.db.add('vault_items', encryptedItem as VaultItem);
    return { ...encryptedItem, id } as VaultItem;
  }
  
  async getVaultItems(): Promise<VaultItem[]> {
    if (!this.db || !this.encryptionKey) throw new Error('Database not initialized');
    
    const items = await this.db.getAll('vault_items');
    return items.map(item => ({
      ...item,
      password: decrypt(item.password, this.encryptionKey!),
    }));
  }
  
  async getVaultItem(id: number): Promise<VaultItem | undefined> {
    if (!this.db || !this.encryptionKey) throw new Error('Database not initialized');
    
    const item = await this.db.get('vault_items', id);
    if (!item) return undefined;
    
    return {
      ...item,
      password: decrypt(item.password, this.encryptionKey),
    };
  }
  
  async updateVaultItem(id: number, updates: Partial<VaultItem>): Promise<VaultItem | undefined> {
    if (!this.db || !this.encryptionKey) throw new Error('Database not initialized');
    
    const item = await this.db.get('vault_items', id);
    if (!item) return undefined;
    
    const updatedItem = {
      ...item,
      ...updates,
      password: updates.password 
        ? encrypt(updates.password, this.encryptionKey)
        : item.password,
      updatedAt: new Date(),
    };
    
    await this.db.put('vault_items', updatedItem);
    
    return {
      ...updatedItem,
      password: decrypt(updatedItem.password, this.encryptionKey),
    };
  }
  
  async deleteVaultItem(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.delete('vault_items', id);
    return true;
  }
  
  // Security Alerts
  
  async addSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'createdAt'>): Promise<SecurityAlert> {
    if (!this.db) throw new Error('Database not initialized');
    
    const newAlert = {
      ...alert,
      resolved: false,
      createdAt: new Date(),
    };
    
    const id = await this.db.add('security_alerts', newAlert as SecurityAlert);
    return { ...newAlert, id } as SecurityAlert;
  }
  
  async getSecurityAlerts(includeResolved: boolean = false): Promise<SecurityAlert[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    if (includeResolved) {
      return this.db.getAll('security_alerts');
    }
    
    return this.db.getAllFromIndex('security_alerts', 'by-resolved', false);
  }
  
  async resolveSecurityAlert(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    const alert = await this.db.get('security_alerts', id);
    if (!alert) return false;
    
    await this.db.put('security_alerts', { ...alert, resolved: true });
    return true;
  }
  
  // Activity Logs
  
  async addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    if (!this.db) throw new Error('Database not initialized');
    
    const newLog = {
      ...log,
      timestamp: new Date(),
    };
    
    const id = await this.db.add('activity_logs', newLog as ActivityLog);
    return { ...newLog, id } as ActivityLog;
  }
  
  async getActivityLogs(limit: number = 20): Promise<ActivityLog[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Get all logs and sort by timestamp descending
    const logs = await this.db.getAll('activity_logs');
    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  // Settings
  
  async getSettings(): Promise<UserSettings> {
    if (!this.db) throw new Error('Database not initialized');
    
    const allSettings = await this.db.getAll('settings');
    if (allSettings.length === 0) {
      // Create default settings
      const defaultSettings: UserSettings = {
        theme: 'light',
        biometricEnabled: false,
        autoLockTimeout: 5,
        syncEnabled: false,
      };
      
      const id = await this.db.add('settings', defaultSettings);
      return { ...defaultSettings, id };
    }
    
    return allSettings[0];
  }
  
  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    if (!this.db) throw new Error('Database not initialized');
    
    const settings = await this.getSettings();
    const updatedSettings = { ...settings, ...updates };
    
    await this.db.put('settings', updatedSettings);
    return updatedSettings;
  }
  
  // Clear all data (for logout)
  
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.clear('vault_items');
    await this.db.clear('security_alerts');
    await this.db.clear('activity_logs');
    // Don't clear settings
    
    this.encryptionKey = null;
  }
}

// Export a singleton instance
export const localDb = new LocalDatabase();
