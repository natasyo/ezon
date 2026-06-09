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
import { CustomFieldsService } from '../services/custom-fields.service.js';
import { CategoriesService } from '../../categories/services/categories.service.js';
import { CreateCustomFieldDto } from '../dto/create-custom-field.dto.js';
import { UpdateCustomFieldDto } from '../dto/update-custom-field.dto.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';

@Controller('warehouse/custom-fields')
@UseGuards(AuthGuard)
export class CustomFieldsController {
  constructor(
    private readonly customFieldsService: CustomFieldsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @Render('custom-fields/list')
  async list(@Session() session?: Record<string, any>) {
    const configs = await this.customFieldsService.findAll();
    return {
      title: 'Дополнительные поля',
      user: session?.user ?? null,
      configs,
    };
  }

  @Get('create')
  @Render('custom-fields/create')
  async createForm(@Session() session?: Record<string, any>) {
    const categories = await this.categoriesService.findAll();
    return {
      title: 'Новое поле',
      user: session?.user ?? null,
      categories,
    };
  }

  @Post()
  @Redirect('/warehouse/custom-fields')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateCustomFieldDto) {
    await this.customFieldsService.create(dto);
    return {};
  }

  @Get(':id/edit')
  @Render('custom-fields/edit')
  async editForm(
    @Param('id') id: string,
    @Session() session?: Record<string, any>,
  ) {
    const [config, categories] = await Promise.all([
      this.customFieldsService.findById(id),
      this.categoriesService.findAll(),
    ]);
    return {
      title: `Редактировать: ${config.label}`,
      user: session?.user ?? null,
      config,
      categories,
    };
  }

  @Post(':id')
  @Redirect('/warehouse/custom-fields')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateCustomFieldDto) {
    await this.customFieldsService.update(id, dto);
    return {};
  }

  @Post(':id/delete')
  @Redirect('/warehouse/custom-fields')
  async remove(@Param('id') id: string) {
    await this.customFieldsService.remove(id);
    return {};
  }
}
