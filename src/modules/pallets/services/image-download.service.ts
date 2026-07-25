import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from '../../../tools/minio/minio.service.js';
import { PrismaService } from '../../../tools/prisma/prisma.service.js';

@Injectable()
export class ImageDownloadService {
  private readonly logger = new Logger(ImageDownloadService.name);

  constructor(
    private readonly minio: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Фоновая загрузка изображений товара.
   * Скачивает внешние URL → загружает в Minio → обновляет БД.
   * Вызывается асинхронно, не блокирует импорт.
   */
  downloadProductImagesInBackground(
    productId: string,
    imageUrls: string[],
  ): void {
    // Запускаем без await — полностью асинхронно
    void this.downloadAndReplace(productId, imageUrls);
  }

  private async downloadAndReplace(
    productId: string,
    imageUrls: string[],
  ): Promise<void> {
    try {
      const minioUrls = await this.minio.replaceUrlsWithMinio(imageUrls);

      // Обновляем товар в БД — заменяем URL + ставим флаг загрузки
      await this.prisma.product.update({
        where: { id: productId },
        data: { images: minioUrls, imagesLoaded: true },
      });

      this.logger.log(
        `✅ Фото товара ${productId} загружены: ${minioUrls.length} шт.`,
      );
    } catch (err) {
      this.logger.error(`❌ Ошибка загрузки фото товара ${productId}:`, err);
    }
  }
}
