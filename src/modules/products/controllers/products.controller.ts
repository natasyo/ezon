import {
  Controller,
  Get,
  Post,
  Put,
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
import { ApiExcludeEndpoint } from '@nestjs/swagger';
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
  @Render('warehouse/product-create')
  async createForm(@Session() session?: Record<string, any>) {
    const flash = session?.productFlash;
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() photos: Express.Multer.File[],
    @Session() session?: Record<string, any>,
    @Res() res?: Response,
  ) {
    try {
      if (photos && photos.length > 0) {
        const imageUrls: string[] = [];
        for (const photo of photos) {
          const url = await this.minioService.upload(
            photo.buffer,
            photo.originalname,
            photo.mimetype,
          );
          imageUrls.push(url);
        }
        dto.images = imageUrls;
      }

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
          old: dto,
        },
        categories,
        cells,
      });
    }
  }

  @Get('check-unique')
  async checkUnique(
    @Query('field') field: string,
    @Query('value') value: string,
  ) {
    const allowed = new Set(['sku', 'ean', 'asin']);
    if (!field || !allowed.has(field) || !value) {
      return { unique: true };
    }

    const exists = await this.productsService.existsByField(
      field as 'sku' | 'ean' | 'asin',
      value,
    );

    if (!exists) return { unique: true };

    const messages: Record<string, string> = {
      sku: 'Товар с таким SKU уже существует',
      ean: 'Товар с таким EAN уже существует',
      asin: 'Товар с таким ASIN уже существует',
    };
    return { unique: false, message: messages[field] };
  }

  @Get('import')
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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

  @Put(':id')
  @UseInterceptors(FilesInterceptor('photos', 10))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() photos: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
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

      await this.productsService.update(id, dto);
      return res.redirect(`/warehouse/products/${id}`);
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException('Ошибка при обновлении товара');
    }
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

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }

  @Post(':id/transition')
  @ApiExcludeEndpoint()
  async transition(@Param('id') id: string, @Res() res: Response) {
    await this.productsService.transitionStatus(id);
    return res.redirect(`/warehouse/products/${id}`);
  }
}
