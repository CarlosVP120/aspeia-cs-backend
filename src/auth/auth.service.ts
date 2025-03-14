import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/auth.dto';
import { UserDto, UserResponseDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(loginDto: LoginDto): Promise<UserResponseDto> {
    const { email, password } = loginDto;
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.email);

    const userDto = new UserDto(user);

    return new UserResponseDto({
      user: userDto,
      accessToken: token,
    });
  }

  async signUp(
    email: string,
    password: string,
    name?: string,
  ): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create the user
    const user = await this.prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        name, // Include name in the user creation
      },
    });

    const token = this.generateToken(user.id, user.email);

    const userDto = new UserDto(user);

    return new UserResponseDto({
      user: userDto,
      accessToken: token,
    });
  }

  async getAllUsers() {
    const users = await this.prisma.usuario.findMany();
    return users.map((user) => new UserDto(user));
  }

  async getUserById(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserDto(user);
  }

  private generateToken(userId: number, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async refreshToken(user: any): Promise<UserResponseDto> {
    // Generate a new token
    const token = this.generateToken(user.id, user.email);

    // Get the full user object to return
    const userData = await this.prisma.usuario.findUnique({
      where: { id: user.id },
    });

    if (!userData) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userDto = new UserDto(userData);

    return new UserResponseDto({
      user: userDto,
      accessToken: token,
    });
  }
}
