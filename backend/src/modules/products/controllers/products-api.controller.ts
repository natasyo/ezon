import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiAuthGuard } from '../../../shared/guards/api-auth.guard.js';
import { ProductsService } from '../services/products.service.js';
import { SearchProductDto } from '../dto/search-product.dto.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { BulkUpdateDto } from '../dto/bulk-update.dto.js';
import { MinioService } from '../../../tools/minio/minio.service.js';

@Controller('api/products')
@UseGuards(ApiAuthGuard)
export class ProductsApiController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  list(@Query() query: SearchProductDto) {
    return this.productsService.findAll(query);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(
    @Body() dto: CreateProductDto,
    @Session() session: Record<string, any>,
  ) {
    return this.productsService.create(dto, session?.user?.id);
  }

  @Post('bulk')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  bulkUpdate(@Body() dto: BulkUpdateDto) {
    return this.productsService.bulkUpdate(dto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('sheetName') sheetName?: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Файл не загружен. Выберите .xlsx файл для импорта.',
      );
    }
    return this.productsService.importFromExcel(file, sheetName);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Post(':id/transition')
  transition(@Param('id') id: string) {
    return this.productsService.transitionStatus(id);
  }

  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('photos', 10))
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    if (!photos || photos.length === 0) {
      throw new BadRequestException('Не загружено ни одного файла');
    }
    const urls: string[] = [];
    for (const photo of photos) {
      const url = await this.minioService.upload(
        photo.buffer,
        photo.originalname,
        photo.mimetype,
      );
      urls.push(url);
    }
    return this.productsService.addImages(id, urls);
  }

  @Post(':id/photos/delete')
  async deletePhoto(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    await this.minioService.deleteByUrl(imageUrl);
    return this.productsService.removeImage(id, imageUrl);
  }
}
