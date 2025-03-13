import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signupDto: SignupDto) {
    return this.authService.signUp(
      signupDto.email,
      signupDto.password,
      signupDto.name,
    );
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers() {
    try {
      return this.authService.getAllUsers();
    } catch (error) {
      throw new HttpException(
        'Error al obtener usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('refreshToken')
  async refreshToken(@Req() req: any) {
    return this.authService.refreshToken(req.user);
  }
}
