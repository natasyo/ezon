import {
  Controller,
  Get,
  Post,
  Res,
  Session,
  Render,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { PalletImportService } from '../services/pallet-import.service.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';

@Controller('warehouse/pallets')
@UseGuards(AuthGuard)
export class PalletsController {
  constructor(private readonly palletImport: PalletImportService) {}

  @Get()
  @ApiExcludeEndpoint()
  @Render('warehouse/pallets-import')
  async importForm(@Session() session?: Record<string, any>) {
    const report = session?.palletReport ?? null;
    const csvPath = session?.palletCsv ?? null;
    if (session) {
      delete session.palletReport;
      delete session.palletCsv;
    }
    return { title: 'Импорт паллет', user: session?.user ?? null, report, csvPath };
  }

  @Post()
  @ApiExcludeEndpoint()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    if (!file) {
      session.palletReport = { total: 0, created: 0, skippedDuplicates: 0, rejected: 0, errors: [], error: 'Файл не загружен. Выберите .xlsx файл манифеста.' };
      return res.redirect('/warehouse/pallets');
    }
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      session.palletReport = { total: 0, created: 0, skippedDuplicates: 0, rejected: 0, errors: [], error: 'Неподдерживаемый тип файла. Принимаются только файлы .xlsx.' };
      return res.redirect('/warehouse/pallets');
    }
    try {
      const report = await this.palletImport.importFromBuffer(file.buffer, session.user?.id);
      if (report.errors.length > 0) {
        const csv = this.palletImport.generateCsvReport(report.errors);
        session.palletCsv = Buffer.from(csv, 'utf-8').toString('base64');
      }
      session.palletReport = report;
    } catch (err: any) {
      session.palletReport = { total: 0, created: 0, skippedDuplicates: 0, rejected: 0, errors: [], error: err?.message || 'Не удалось обработать файл.' };
    }
    return res.redirect('/warehouse/pallets');
  }

  @Get('csv')
  @ApiExcludeEndpoint()
  async downloadCsv(@Session() session: Record<string, any>, @Res() res: Response) {
    const csvBase64 = session?.palletCsv;
    if (!csvBase64) return res.redirect('/warehouse/pallets');
    delete session.palletCsv;
    const csv = Buffer.from(csvBase64, 'base64').toString('utf-8');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="pallet-import-errors.csv"');
    res.send(csv);
  }
}
