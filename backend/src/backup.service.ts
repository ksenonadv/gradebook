import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {

  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.resolve(__dirname, '../../backups');
  private readonly retentionDays: number;

  constructor(private readonly configService: ConfigService) {
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(
        this.backupDir, 
        { 
          recursive: true 
        }
      );
    }

    this.retentionDays = parseInt(
      this.configService.get(
        'BACKUP_RETENTION_DAYS'
      ) || '7'
    );
  }

  @Cron('0 0 * * *')
  async handleBackup() {
    
    if (!(await this.isDockerAvailable())) {
      return this.logger.error(
        '❌ Docker is not available. Skipping backup.'
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;

    const pgUser = this.configService.get('PGDB_USER');
    const pgPass = this.configService.get('PGDB_PASS');
    const pgHost = this.configService.get('PGDB_HOST');
    const pgPort = this.configService.get('PGDB_PORT');
    const pgDb   = this.configService.get('PGDB_NAME');

    const docker = spawn('docker', [
      'run', '--rm',
      '-v', `${this.backupDir}:/backups`,
      'postgres',
      'bash', '-c',
      `export PGPASSWORD='${pgPass}' && pg_dump -U ${pgUser} -h ${pgHost} -p ${pgPort} ${pgDb} > /backups/${filename}`
    ]);
    
    docker.stderr.on('data', (data) => {
      this.logger.error(`❌ Backup Error: ${data}`);
    });
    
    docker.on('close', (code) => {
      if (code === 0) {
        this.logger.log(`✅ Backup completed: ${filename}`);
        this.deleteOldBackups();
      } else {
        this.logger.error(`🚨 Backup failed with exit code ${code}`);
      }
    });

  }

  private deleteOldBackups() {
    
    const files = fs.readdirSync(this.backupDir);
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;

    files.forEach((file) => {
      const fullPath = path.join(this.backupDir, file);
      const stats = fs.statSync(fullPath);
      const ageInDays = (now - stats.mtimeMs) / msInDay;

      if (ageInDays > this.retentionDays) {
        fs.unlinkSync(fullPath);
        this.logger.log(`🗑️ Deleted old backup: ${file}`);
      }
    });
  }

  private async isDockerAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      exec('docker info', (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
