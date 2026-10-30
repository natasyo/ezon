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
import { CellsService } from '../services/cells.service.js';
import { CreateCellDto } from '../dto/create-cell.dto.js';
import { UpdateCellDto } from '../dto/update-cell.dto.js';

@Controller('api/cells')
@UseGuards(ApiAuthGuard)
export class CellsApiController {
  constructor(private readonly cellsService: CellsService) {}

  @Get()
  list() {
    return this.cellsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cellsService.findById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateCellDto) {
    return this.cellsService.create(dto);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateCellDto) {
    return this.cellsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cellsService.remove(id);
  }
}
