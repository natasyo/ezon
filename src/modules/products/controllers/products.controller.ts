import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Session,
  Res,
  Render,
  Redirect,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ValidationPipe,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { SearchProductDto } from '../dto/search-product.dto.js';
import { BulkUpdateDto } from '../dto/bulk-update.dto.js';
import { ProductStatus } from '../entities/product-status.enum.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';
import { CategoriesService } from '../../categories/services/categories.service.js';
import { CellsService } from '../../cells/services/cells.service.js';
import { MinioService } from '../../../tools/minio/minio.service.js';

@Controller('warehouse/products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly cellsService: CellsService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  @Render('warehouse/catalog-list')
  async list(
    @Query() query: SearchProductDto,
    @Session() session?: Record<string, any>,
  ) {
    const [result, categories, cells] = await Promise.all([
      this.productsService.findAll(query),
      this.categoriesService.findAll(),
      this.cellsService.findAll(),
    ]);
    return {
      title: 'Каталог товаров',
      user: session?.user ?? null,
      ...result,
      categories,
      cells,
      filters: {
        search: query.search || '',
        sku: query.sku || '',
        ean: query.ean || '',
        asin: query.asin || '',
        condition: query.condition || '',
        status: query.status || '',
        cell: query.cellId || '',
        categoryId: query.categoryId || '',
      },
      statuses: [
        { value: 'ARRIVAL', label: 'Поступление' },
        { value: 'IN_STOCK', label: 'На складе' },
        { value: 'PLACED', label: 'Размещён' },
        { value: 'SOLD', label: 'Продан' },
        { value: 'WRITTEN_OFF', label: 'Списан' },
      ],
      statusLabels: (s: ProductStatus) =>
        this.productsService.getStatusLabel(s),
    };
  }

  @Get('create')
  @Render('warehouse/product-create')
  async createForm(@Session() session?: Record<string, any>) {
    const flash = session?.productFlash;
    // Очищаем flash после прочтения
    if (session) {
      delete session.productFlash;
    }
    const [categories, cells] = await Promise.all([
      this.categoriesService.findAll(),
      this.cellsService.findAll(),
    ]);
    return {
      title: 'Новый товар',
      user: session?.user ?? null,
      flash: flash || null,
      categories,
      cells,
    };
  }

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 10))
  async create(
    @Body() body: Record<string, string>,
    @UploadedFiles() photos: Express.Multer.File[],
    @Session() session?: Record<string, any>,
    @Res() res?: Response,
  ) {
    try {
      // Загружаем фото в Minio и собираем URL'ы
      const imageUrls: string[] = [];
      if (photos && photos.length > 0) {
        for (const photo of photos) {
          const url = await this.minioService.upload(
            photo.buffer,
            photo.originalname,
            photo.mimetype,
          );
          imageUrls.push(url);
        }
      }

      // Собираем DTO из body + загруженных фото
      const dto: CreateProductDto = {
        sku: body.sku,
        name: body.name,
        ean: body.ean || undefined,
        asin: body.asin || undefined,
        categoryId: body.categoryId || undefined,
        condition: body.condition || undefined,
        purchasePrice:
          body.purchasePrice !== undefined && body.purchasePrice !== ''
            ? Number(body.purchasePrice.replace(',', '.'))
            : undefined,
        salePrice:
          body.salePrice !== undefined && body.salePrice !== ''
            ? Number(body.salePrice.replace(',', '.'))
            : undefined,
        cellId: body.cellId || undefined,
        arrivalDate: body.arrivalDate || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      const product = await this.productsService.create(dto, session?.user?.id);
      return res?.redirect(`/warehouse/products/${product.id}`);
    } catch (err: any) {
      let errorMessage: string | null = null;
      const fieldErrors: Record<string, string> = {};

      if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        Object.assign(fieldErrors, err.fieldErrors);
        errorMessage =
          err.fieldErrors[Object.keys(err.fieldErrors)[0]] || 'Ошибка';
      } else if (err instanceof BadRequestException) {
        const response = err.getResponse();
        const msg =
          typeof response === 'object' &&
          response !== null &&
          'message' in response
            ? (response as { message: unknown }).message
            : null;
        if (typeof msg === 'string') {
          errorMessage = msg;
        } else if (Array.isArray(msg)) {
          errorMessage = msg.join('; ');
        } else {
          errorMessage = 'Ошибка валидации';
        }
      } else {
        errorMessage = 'Произошла ошибка при создании товара';
      }

      const [categories, cells] = await Promise.all([
        this.categoriesService.findAll(),
        this.cellsService.findAll(),
      ]);
      return res?.render('warehouse/product-create', {
        title: 'Новый товар',
        user: session?.user ?? null,
        flash: {
          error: errorMessage,
          errors: fieldErrors,
          old: body,
        },
        categories,
        cells,
      });
    }
  }

  @Get('import')
  @Render('warehouse/product-import')
  async importForm(@Session() session?: Record<string, any>) {
    const report = session?.importReport ?? null;
    if (session) delete session.importReport;
    return {
      title: 'Импорт товаров',
      user: session?.user ?? null,
      report,
    };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importFile(
    @UploadedFile() file: Express.Multer.File,
    @Session() session?: Record<string, any>,
    @Res() res?: Response,
  ) {
    if (!file) {
      session!.importReport = {
        error: 'Файл не загружен. Выберите .xlsx файл для импорта.',
        created: 0,
        skipped: 0,
        errors: [] as string[],
      };
      return res?.redirect('/warehouse/products/import');
    }

    const report = await this.productsService.importFromExcel(file);
    session!.importReport = report;
    return res?.redirect('/warehouse/products/import');
  }

  @Get(':id')
  @Render('warehouse/product-card')
  async card(
    @Param('id') id: string,
    @Session() session?: Record<string, any>,
  ) {
    const product = await this.productsService.findById(id);
    const transitions = this.productsService.getAvailableTransitions(
      product.status as ProductStatus,
    );
    return {
      title: product.name,
      user: session?.user ?? null,
      product,
      transitions,
      statusLabel: this.productsService.getStatusLabel.bind(
        this.productsService,
      ),
    };
  }

  @Post('bulk')
  @Redirect('/warehouse/products')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkUpdate(@Body() dto: BulkUpdateDto) {
    await this.productsService.bulkUpdate(dto);
    return {};
  }

  @Post('upload-photos')
  @UseInterceptors(FilesInterceptor('photos', 10))
  async uploadPhotos(
    @UploadedFiles() photos: Express.Multer.File[],
    @Body('productId') productId: string,
    @Res() res: Response,
  ) {
    if (photos && photos.length > 0) {
      const urls: string[] = [];
      for (const photo of photos) {
        const url = await this.minioService.upload(
          photo.buffer,
          photo.originalname,
          photo.mimetype,
        );
        urls.push(url);
      }
      await this.productsService.addImages(productId, urls);
    }
    return res.redirect(`/warehouse/products/${productId}`);
  }

  @Post('delete-photo')
  async deletePhoto(
    @Body('productId') productId: string,
    @Body('imageUrl') imageUrl: string,
    @Res() res: Response,
  ) {
    await this.minioService.deleteByUrl(imageUrl);
    await this.productsService.removeImage(productId, imageUrl);
    return res.redirect(`/warehouse/products/${productId}`);
  }

  @Post(':id')
  @UseInterceptors(FilesInterceptor('photos', 10))
  async update(
    @Param('id') id: string,
    @Body() body: Record<string, string>,
    @UploadedFiles() photos: Express.Multer.File[],
    @Res() res: Response,
  ) {
    // Загружаем новые фото, если есть
    if (photos && photos.length > 0) {
      const urls: string[] = [];
      for (const photo of photos) {
        const url = await this.minioService.upload(
          photo.buffer,
          photo.originalname,
          photo.mimetype,
        );
        urls.push(url);
      }
      await this.productsService.addImages(id, urls);
    }

    // Обновляем текстовые поля
    const dto: UpdateProductDto = {
      name: body.name,
      categoryId: body.categoryId || undefined,
      condition: body.condition || undefined,
      purchasePrice:
        body.purchasePrice !== undefined && body.purchasePrice !== ''
          ? Number(body.purchasePrice.replace(',', '.'))
          : undefined,
      salePrice:
        body.salePrice !== undefined && body.salePrice !== ''
          ? Number(body.salePrice.replace(',', '.'))
          : undefined,
      cellId: body.cellId || undefined,
      ean: body.ean || undefined,
      asin: body.asin || undefined,
    };

    await this.productsService.update(id, dto);
    return res.redirect(`/warehouse/products/${id}`);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }

  @Post(':id/transition')
  async transition(@Param('id') id: string, @Res() res: Response) {
    await this.productsService.transitionStatus(id);
    return res.redirect(`/warehouse/products/${id}`);
  }
}
