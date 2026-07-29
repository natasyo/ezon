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
import { CellsService } from '../services/cells.service.js';
import { CreateCellDto } from '../dto/create-cell.dto.js';
import { UpdateCellDto } from '../dto/update-cell.dto.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';

@Controller('warehouse/cells')
@UseGuards(AuthGuard)
export class CellsController {
  constructor(private readonly cellsService: CellsService) {}

  @Get()
  @ApiExcludeEndpoint()
  @Render('cells/list')
  async list(@Session() session?: Record<string, any>) {
    const cells = await this.cellsService.findAll();
    return { title: 'Ячейки', user: session?.user ?? null, cells };
  }

  @Get('create')
  @ApiExcludeEndpoint()
  @Render('cells/create')
  createForm(@Session() session?: Record<string, any>) {
    return { title: 'Новая ячейка', user: session?.user ?? null };
  }

  @Post()
  @Redirect('/warehouse/cells')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateCellDto) {
    await this.cellsService.create(dto);
    return {};
  }

  @Get(':id/edit')
  @ApiExcludeEndpoint()
  @Render('cells/edit')
  async editForm(@Param('id') id: string, @Session() session?: Record<string, any>) {
    const cell = await this.cellsService.findById(id);
    return { title: `Редактировать: ${cell.name}`, user: session?.user ?? null, cell };
  }

  @Post(':id')
  @Redirect('/warehouse/cells')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateCellDto) {
    await this.cellsService.update(id, dto);
    return {};
  }

  @Post(':id/delete')
  @ApiExcludeEndpoint()
  @Redirect('/warehouse/cells')
  async remove(@Param('id') id: string) {
    await this.cellsService.remove(id);
    return {};
  }
}
