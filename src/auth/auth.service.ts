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
import { UserDto, UserResponseDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(loginDto: LoginDto): Promise<UserResponseDto> {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
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
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
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
    const users = await this.prisma.user.findMany();
    return users.map((user) => new UserDto(user));
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserDto(user);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Check if email is being updated and if it's already in use
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
    }

    // Hash password if provided
    let hashedPassword;
    if (updateUserDto.password) {
      hashedPassword = await this.hashPassword(updateUserDto.password);
    }

    // Update user with new data
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.name && { name: updateUserDto.name }),
        ...(updateUserDto.email && { email: updateUserDto.email }),
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    return new UserDto(updatedUser);
  }

  async deleteUser(id: number) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Delete the user
    await this.prisma.user.delete({
      where: { id },
    });
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
    // Get the full user object to return
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userData) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Generate a new token
    const token = this.generateToken(userData.id, userData.email);

    const userDto = new UserDto(userData);

    return new UserResponseDto({
      user: userDto,
      accessToken: token,
    });
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const permissionsSet = new Set<string>();
    userWithRoles.userRoles.forEach((userRole) => {
      userRole.role.permissions.forEach((rolePermission) => {
        permissionsSet.add(rolePermission.permission.name);
      });
    });

    return Array.from(permissionsSet);
  }
}
