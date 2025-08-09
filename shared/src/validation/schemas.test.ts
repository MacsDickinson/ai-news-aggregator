import { describe, it, expect } from 'vitest';
import { GenerateDraftRequestSchema } from './schemas';

describe('validation schemas', () => {
  it('should validate GenerateDraftRequestSchema', () => {
    const validRequest = {
      platform: 'linkedin' as const,
      itemId: '123e4567-e89b-12d3-a456-426614174000',
    };
    
    const result = GenerateDraftRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid platform', () => {
    const invalidRequest = {
      platform: 'invalid',
      itemId: '123e4567-e89b-12d3-a456-426614174000',
    };
    
    const result = GenerateDraftRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});