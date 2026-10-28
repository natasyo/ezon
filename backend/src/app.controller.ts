import { Controller, Get, Render, Session } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiExcludeEndpoint()
  @Render('index')
  home(@Session() session: Record<string, any>) {
    return { title: 'Ezon — Склад', user: session.user };
  }
}
