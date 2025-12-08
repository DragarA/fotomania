import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { TestDataFactory } from '../../../../test/utils/test-data.factory';
import { AuthService } from '../auth.service';

import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      // Arrange
      const testUser = TestDataFactory.createUser();
      authService.validateUser.mockResolvedValue(testUser);

      // Act
      const result = await strategy.validate('test@example.com', 'password');

      // Assert
      expect(result).toEqual(testUser);
      expect(authService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      );
      expect(authService.validateUser).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      authService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        strategy.validate('test@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        strategy.validate('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');

      expect(authService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword'
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      authService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        strategy.validate('nonexistent@example.com', 'password')
      ).rejects.toThrow(UnauthorizedException);

      expect(authService.validateUser).toHaveBeenCalledWith(
        'nonexistent@example.com',
        'password'
      );
    });

    it('should handle email field correctly', async () => {
      // Arrange
      const testUser = TestDataFactory.createUser({
        email: 'specific@example.com',
      });
      authService.validateUser.mockResolvedValue(testUser);

      // Act
      await strategy.validate('specific@example.com', 'password');

      // Assert
      expect(authService.validateUser).toHaveBeenCalledWith(
        'specific@example.com',
        'password'
      );
    });
  });
});
