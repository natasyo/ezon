import {
  BadRequestException,
  Controller,
  Post,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiAuthGuard } from '../../../shared/guards/api-auth.guard.js';
import { PalletImportService } from '../services/pallet-import.service.js';

@Controller('api/pallets')
@UseGuards(ApiAuthGuard)
export class PalletsApiController {
  constructor(private readonly palletImport: PalletImportService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Файл не загружен. Выберите .xlsx файл манифеста.',
      );
    }
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException(
        'Неподдерживаемый тип файла. Принимаются только файлы .xlsx.',
      );
    }
    return this.palletImport.importFromBuffer(file.buffer, session?.user?.id);
  }
}
