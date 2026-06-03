import { Controller, Get, Render, Session } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  home(@Session() session: Record<string, any>) {
    return { title: 'Ezon — Склад', user: session.user };
  }
}
