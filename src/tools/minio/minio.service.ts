import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { extname } from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.getOrThrow<string>('MINIO_BUCKET');
    this.client = new Minio.Client({
      endPoint: config.getOrThrow<string>('MINIO_ENDPOINT'),
      port: config.get<number>('MINIO_PORT', 9000),
      useSSL: config.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: config.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: config.getOrThrow<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Bucket «${this.bucket}» создан`);
      }
    } catch (err) {
      this.logger.error('Ошибка проверки/создания bucket Minio:', err);
    }
  }

  /** Загрузить файл (Buffer) в Minio, вернуть URL */
  async upload(
    file: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    const ext = extname(originalName) || '.jpg';
    const objectName = `products/${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;

    await this.client.putObject(this.bucket, objectName, file, file.length, {
      'Content-Type': mimeType,
    });

    // Публичный URL
    const protocol =
      this.config.get<string>('MINIO_USE_SSL', 'false') === 'true'
        ? 'https'
        : 'http';
    const endpoint = this.config.getOrThrow<string>('MINIO_ENDPOINT');
    const port = this.config.get<number>('MINIO_PORT', 9000);

    return `${protocol}://${endpoint}:${port}/${this.bucket}/${objectName}`;
  }

  /** Удалить объект по URL */
  async deleteByUrl(url: string): Promise<void> {
    try {
      // Извлекаем objectName из URL: http://host:port/bucket/objectName
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      // Первый сегмент — bucket, остальное — objectName
      if (pathParts.length >= 2 && pathParts[0] === this.bucket) {
        const objectName = pathParts.slice(1).join('/');
        await this.client.removeObject(this.bucket, objectName);
      }
    } catch (err) {
      this.logger.warn(`Не удалось удалить объект ${url}:`, err);
    }
  }

  /** Проверить, является ли URL нашим Minio-URL */
  isMinioUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const endpoint = this.config.getOrThrow<string>('MINIO_ENDPOINT');
      return urlObj.hostname.includes(endpoint);
    } catch {
      return false;
    }
  }
}
