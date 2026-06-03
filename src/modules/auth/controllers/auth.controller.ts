import { Controller, Get, Post, Body, Render, Redirect, Session, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "../services/auth.service.js";
import { LoginDto } from "../dto/login.dto.js";

interface SessionData {
  user?: { id: string; email: string; userName: string; displayName: string | null };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("login")
  @Render("auth/login")
  loginForm() {
    return { title: "Вход", error: null };
  }

  @Post("login")
  @Redirect("/")
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() dto: LoginDto, @Session() session: SessionData) {
    try {
      const user = await this.authService.validateUser(dto.email, dto.password);
      session.user = {
        id: user.id,
        email: user.email,
        userName: user.userName,
        displayName: user.displayName,
      };
      return { url: "/" };
    } catch {
      return { url: "/auth/login?error=1" };
    }
  }

  @Get("logout")
  @Redirect("/")
  logout(@Session() session: SessionData) {
    session.user = undefined;
    return {};
  }
}
