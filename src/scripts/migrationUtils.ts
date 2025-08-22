// Migration Utilities - Helper functions for blog migration process

import fs from 'fs/promises';
import path from 'path';

export interface MigrationStats {
  startTime: Date;
  endTime?: Date;
  totalPosts: number;
  processedPosts: number;
  successfulMigrations: number;
  failedMigrations: number;
  totalImages: number;
  processedImages: number;
  successfulImageUploads: number;
  failedImageUploads: number;
  errors: MigrationError[];
  warnings: string[];
}

export interface MigrationError {
  type: 'post' | 'image' | 'validation' | 'database';
  postId?: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface MigrationBackup {
  timestamp: Date;
  originalData: any[];
  migratedPostIds: number[];
  imageMapping: { [originalUrl: string]: string };
}

export class MigrationLogger {
  private logFile: string;
  private stats: MigrationStats;

  constructor(logDir: string = './migration-logs') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(logDir, `migration-${timestamp}.log`);
    
    this.stats = {
      startTime: new Date(),
      totalPosts: 0,
      processedPosts: 0,
      successfulMigrations: 0,
      failedMigrations: 0,
      totalImages: 0,
      processedImages: 0,
      successfulImageUploads: 0,
      failedImageUploads: 0,
      errors: [],
      warnings: []
    };
  }

  async init(): Promise<void> {
    const logDir = path.dirname(this.logFile);
    await fs.mkdir(logDir, { recursive: true });
    
    await this.log('📝 BLOG MIGRATION LOG STARTED', 'INFO');
    await this.log(`🕒 Start Time: ${this.stats.startTime.toISOString()}`, 'INFO');
  }

  async log(message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO'): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    // Write to file
    try {
      await fs.appendFile(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
    
    // Also output to console
    const emoji = {
      'INFO': 'ℹ️',
      'WARN': '⚠️',
      'ERROR': '❌',
      'SUCCESS': '✅'
    }[level];
    
    console.log(`${emoji} ${message}`);
  }

  logError(error: MigrationError): void {
    this.stats.errors.push(error);
    this.log(`ERROR: ${error.message} (Type: ${error.type}${error.postId ? `, Post: ${error.postId}` : ''})`, 'ERROR');
  }

  logWarning(message: string): void {
    this.stats.warnings.push(message);
    this.log(`WARNING: ${message}`, 'WARN');
  }

  updateStats(updates: Partial<MigrationStats>): void {
    Object.assign(this.stats, updates);
  }

  getStats(): MigrationStats {
    return { ...this.stats };
  }

  async generateReport(): Promise<string> {
    this.stats.endTime = new Date();
    const duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();
    const durationMinutes = Math.round(duration / (1000 * 60));
    
    const report = `
╔══════════════════════════════════════════════════════════════════════╗
║                          MIGRATION REPORT                           ║
╚══════════════════════════════════════════════════════════════════════╝

⏱️  TIMING
   Start Time: ${this.stats.startTime.toISOString()}
   End Time: ${this.stats.endTime.toISOString()}
   Duration: ${durationMinutes} minutes

📝 BLOG POSTS
   Total Posts: ${this.stats.totalPosts}
   Processed: ${this.stats.processedPosts}
   Successful: ${this.stats.successfulMigrations}
   Failed: ${this.stats.failedMigrations}
   Success Rate: ${((this.stats.successfulMigrations / this.stats.totalPosts) * 100).toFixed(1)}%

🖼️  IMAGES
   Total Images: ${this.stats.totalImages}
   Processed: ${this.stats.processedImages}
   Successful Uploads: ${this.stats.successfulImageUploads}
   Failed Uploads: ${this.stats.failedImageUploads}
   Success Rate: ${this.stats.totalImages > 0 ? ((this.stats.successfulImageUploads / this.stats.totalImages) * 100).toFixed(1) : '0'}%

${this.stats.errors.length > 0 ? `
🚨 ERRORS (${this.stats.errors.length})
${this.stats.errors.map(error => `   - [${error.type}] ${error.message}${error.postId ? ` (Post: ${error.postId})` : ''}`).join('\n')}
` : '✅ No errors encountered!'}

${this.stats.warnings.length > 0 ? `
⚠️  WARNINGS (${this.stats.warnings.length})
${this.stats.warnings.map(warning => `   - ${warning}`).join('\n')}
` : '✅ No warnings!'}

📊 SUMMARY
   ${this.stats.successfulMigrations === this.stats.totalPosts ? '🎉 ALL POSTS MIGRATED SUCCESSFULLY!' : '⚠️  Some posts failed to migrate'}
   ${this.stats.successfulImageUploads === this.stats.totalImages ? '🎉 ALL IMAGES UPLOADED SUCCESSFULLY!' : '⚠️  Some images failed to upload'}

📄 Full log available at: ${this.logFile}
`;

    await this.log('📊 Migration completed - generating final report', 'INFO');
    await fs.appendFile(this.logFile, '\n' + report);
    
    return report;
  }
}

export class BackupManager {
  private backupDir: string;

  constructor(backupDir: string = './migration-backups') {
    this.backupDir = backupDir;
  }

  async init(): Promise<void> {
    await fs.mkdir(this.backupDir, { recursive: true });
  }

  async createBackup(originalData: any[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `blog-data-backup-${timestamp}.json`);
    
    const backup: MigrationBackup = {
      timestamp: new Date(),
      originalData,
      migratedPostIds: [],
      imageMapping: {}
    };

    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    
    return backupFile;
  }

  async updateBackup(backupFile: string, updates: Partial<MigrationBackup>): Promise<void> {
    try {
      const existing = JSON.parse(await fs.readFile(backupFile, 'utf-8')) as MigrationBackup;
      const updated = { ...existing, ...updates };
      await fs.writeFile(backupFile, JSON.stringify(updated, null, 2));
    } catch (error) {
      console.warn(`Warning: Failed to update backup file: ${error}`);
    }
  }

  async loadBackup(backupFile: string): Promise<MigrationBackup | null> {
    try {
      const data = await fs.readFile(backupFile, 'utf-8');
      return JSON.parse(data) as MigrationBackup;
    } catch (error) {
      console.error(`Failed to load backup: ${error}`);
      return null;
    }
  }
}

export class ProgressTracker {
  private currentStep: string = '';
  private stepProgress: number = 0;
  private totalSteps: number = 0;
  private completedSteps: number = 0;

  setTotalSteps(total: number): void {
    this.totalSteps = total;
  }

  setCurrentStep(step: string, progress: number = 0): void {
    this.currentStep = step;
    this.stepProgress = progress;
  }

  completeStep(): void {
    this.completedSteps++;
    this.stepProgress = 100;
  }

  getOverallProgress(): number {
    if (this.totalSteps === 0) return 0;
    return Math.round(((this.completedSteps + (this.stepProgress / 100)) / this.totalSteps) * 100);
  }

  getProgressDisplay(): string {
    const overall = this.getOverallProgress();
    const progressBar = this.generateProgressBar(overall);
    
    return `
📊 Migration Progress: ${overall}% ${progressBar}
🔄 Current Step: ${this.currentStep}
📈 Step Progress: ${this.stepProgress}%
✅ Completed Steps: ${this.completedSteps}/${this.totalSteps}
`;
  }

  private generateProgressBar(percentage: number, length: number = 20): string {
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required environment variables
  if (!process.env.GCS_PROJECT_ID) {
    errors.push('GCS_PROJECT_ID environment variable is required');
  }

  if (!process.env.GCS_BUCKET_NAME) {
    errors.push('GCS_BUCKET_NAME environment variable is required');
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    errors.push('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
  }

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL environment variable is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default {
  MigrationLogger,
  BackupManager,
  ProgressTracker,
  validateEnvironment,
  formatBytes,
  formatDuration,
  delay,
  generateUniqueId
};