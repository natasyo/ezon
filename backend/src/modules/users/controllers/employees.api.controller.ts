import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiAuthGuard } from '../../../shared/guards/api-auth.guard.js';
import { UsersService } from '../services/users.service.js';
import { CreateEmployeeDto } from '../dto/create-employee.dto.js';
import { UpdateEmployeeDto } from '../dto/update-employee.dto.js';

@Controller('api/employees')
@UseGuards(ApiAuthGuard)
export class EmployeesApiController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');
    const { password: _password, ...result } = user;
    return result;
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateEmployeeDto) {
    return this.usersService.createEmployee(dto);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Post(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Post(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.usersService.reactivate(id);
  }
}
