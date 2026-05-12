import { loginSchema } from './auth';

describe('loginSchema', () => {
  it('should accept a valid email and password', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject an empty email', () => {
    const invalidData = {
      email: '',
      password: 'password123',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required.');
    }
  });

  it('should reject an invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter a valid email address.');
    }
  });

  it('should reject a short password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'short',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 6 characters.');
    }
  });

  it('should reject missing fields', () => {
    const invalidData = {};
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
