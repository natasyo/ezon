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

  /** Скачать изображение по URL и загрузить в Minio, вернуть Minio-URL */
  async downloadFromUrl(imageUrl: string): Promise<string | null> {
    try {
      const resp = await fetch(imageUrl);
      if (!resp.ok) {
        this.logger.warn(
          `Не удалось скачать ${imageUrl}: статус ${resp.status}`,
        );
        return null;
      }

      const buffer = Buffer.from(await resp.arrayBuffer());
      const contentType = resp.headers.get('content-type') || 'image/jpeg';

      // Определяем имя файла из URL
      let fileName = 'image.jpg';
      try {
        const urlPath = new URL(imageUrl).pathname;
        const basename = urlPath.split('/').pop() || 'image.jpg';
        if (basename.match(/\.(jpg|jpeg|png|webp|gif|bmp)/i)) {
          fileName = basename;
        }
      } catch {
        // оставляем image.jpg
      }

      const minioUrl = await this.upload(buffer, fileName, contentType);
      return minioUrl;
    } catch (err) {
      this.logger.warn(`Ошибка скачивания ${imageUrl}:`, err);
      return null;
    }
  }

  /** Заменить все внешние URL в массиве на Minio-URL (фоновая загрузка) */
  async replaceUrlsWithMinio(urls: string[]): Promise<string[]> {
    const result: string[] = [];
    for (const url of urls) {
      if (this.isMinioUrl(url)) {
        result.push(url);
      } else {
        const minioUrl = await this.downloadFromUrl(url);
        if (minioUrl) {
          result.push(minioUrl);
          this.logger.log(`📷 ${url} → ${minioUrl}`);
        } else {
          // Оставляем оригинальный URL если не удалось скачать
          result.push(url);
        }
      }
    }
    return result;
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
