import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  registerDecorator,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Custom validator: asserts that the decorated property equals another property on the same object.
 */
function MatchesProperty(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'matchesProperty',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: {
        message: `${propertyName} must match ${property}`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints as string[];
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return value === relatedValue;
        },
      },
    });
  };
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The password-reset token sent to the user by email',
    example: 'a1b2c3d4e5f6...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description:
      'New password — minimum 8 characters, must contain at least one uppercase letter, ' +
      'one lowercase letter, one digit, and one special character (!@#$%^&*)',
    minLength: 8,
    maxLength: 128,
    example: 'NewSecure@456',
  })
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @MaxLength(128, { message: 'password must not exceed 128 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*)',
  })
  password: string;

  @ApiProperty({
    description: 'Must exactly match the password field',
    example: 'NewSecure@456',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o: ResetPasswordDto) => o.confirmPassword !== undefined)
  @MatchesProperty('password', { message: 'confirmPassword must match password' })
  confirmPassword: string;
}
