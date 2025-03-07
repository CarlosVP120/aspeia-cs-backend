import { Exclude, Expose, Transform } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
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
