import { Exclude, Expose, Transform } from 'class-transformer';
import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  name?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  isSupervisor: boolean;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isSupervisor?: boolean;
}

export class UserResponseDto {
  @Expose()
  @Transform(({ value }) => {
    // Ensure password is excluded from the response
    if (value && value.password) {
      const { password, ...rest } = value;
      return rest;
    }
    return value;
  })
  user: UserDto;

  @Expose()
  accessToken: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
