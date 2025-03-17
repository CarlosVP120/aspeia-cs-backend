import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @IsEmail(
    {},
    {
      message:
        'Por favor proporciona una dirección de correo electrónico válida',
    },
  )
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}

export class SignupDto {
  @IsEmail(
    {},
    {
      message:
        'Por favor proporciona una dirección de correo electrónico válida',
    },
  )
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string; // Optional field to maintain backward compatibility

  @IsOptional()
  @IsBoolean({ message: 'El campo isSupervisor debe ser un booleano' })
  isSupervisor?: boolean; // Optional field for making a user a supervisor
}
