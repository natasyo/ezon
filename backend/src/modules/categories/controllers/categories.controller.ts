import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Render,
  Redirect,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Session,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';

@Controller('warehouse/categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiExcludeEndpoint()
  @Render('categories/list')
  async list(@Session() session?: Record<string, any>) {
    const categories = await this.categoriesService.findAll();
    return { title: 'Категории', user: session?.user ?? null, categories };
  }

  @Get('create')
  @ApiExcludeEndpoint()
  @Render('categories/create')
  createForm(@Session() session?: Record<string, any>) {
    return { title: 'Новая категория', user: session?.user ?? null };
  }

  @Post()
  @Redirect('/warehouse/categories')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateCategoryDto) {
    await this.categoriesService.create(dto);
    return {};
  }

  @Get(':id/edit')
  @ApiExcludeEndpoint()
  @Render('categories/edit')
  async editForm(@Param('id') id: string, @Session() session?: Record<string, any>) {
    const category = await this.categoriesService.findById(id);
    return { title: `Редактировать: ${category.name}`, user: session?.user ?? null, category };
  }

  @Post(':id')
  @Redirect('/warehouse/categories')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    await this.categoriesService.update(id, dto);
    return {};
  }

  @Post(':id/delete')
  @ApiExcludeEndpoint()
  @Redirect('/warehouse/categories')
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return {};
  }
}
