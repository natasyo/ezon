import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiAuthGuard } from '../../../shared/guards/api-auth.guard.js';
import { CustomFieldsService } from '../services/custom-fields.service.js';
import { CreateCustomFieldDto } from '../dto/create-custom-field.dto.js';
import { UpdateCustomFieldDto } from '../dto/update-custom-field.dto.js';

@Controller('api/custom-fields')
@UseGuards(ApiAuthGuard)
export class CustomFieldsApiController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Get()
  list() {
    return this.customFieldsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customFieldsService.findById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateCustomFieldDto) {
    return this.customFieldsService.create(dto);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateCustomFieldDto) {
    return this.customFieldsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customFieldsService.remove(id);
  }
}
