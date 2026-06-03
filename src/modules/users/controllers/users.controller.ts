import { Controller, Post, Get, Body, Render, Redirect, UsePipes, ValidationPipe } from "@nestjs/common";
import { UsersService } from "../services/users.service.js";
import { RegisterDto } from "../dto/register.dto.js";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("register")
  @Render("auth/register")
  registerForm() {
    return { title: "Регистрация" };
  }

  @Post("register")
  @Redirect("/auth/login")
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() dto: RegisterDto) {
    await this.usersService.create(dto);
    return {};
  }
}
