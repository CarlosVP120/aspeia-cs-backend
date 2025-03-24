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
  Patch,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/user.dto';

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
  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return this.authService.updateUser(parseInt(id), updateUserDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al actualizar usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    try {
      const userId = parseInt(id);

      // Prevent users from deleting themselves
      if (req.user.id === userId) {
        throw new ForbiddenException('No puedes eliminar tu propio usuario');
      }

      await this.authService.deleteUser(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al eliminar usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('refreshToken')
  async refreshToken(@Req() req: any) {
    return this.authService.refreshToken(req.user);
  }
}
