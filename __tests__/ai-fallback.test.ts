import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withFallback } from '../BrandLib/ai-client';

describe('AI Fallback Mechanism', () => {
  it('should success with primary model', async () => {
    const mockPrimaryFn = vi.fn().mockResolvedValue('success');
    const result = await withFallback(mockPrimaryFn);
    
    expect(result).toBe('success');
    expect(mockPrimaryFn).toHaveBeenCalledTimes(1);
  });

  it('should fallback to secondary model on failure', async () => {
    const mockPrimaryFn = vi.fn()
      .mockRejectedValueOnce(new Error('Primary Failed'))
      .mockResolvedValueOnce('fallback_success');
    
    // withFallback calls primaryFn(defaultModel) then primaryFn(geminiModel)
    // We expect primaryFn to be called twice.
    
    const result = await withFallback(mockPrimaryFn);
    
    expect(result).toBe('fallback_success');
    expect(mockPrimaryFn).toHaveBeenCalledTimes(2);
  });

  it('should throw if both fail', async () => {
    const mockPrimaryFn = vi.fn().mockRejectedValue(new Error('Total Failure'));
    
    await expect(withFallback(mockPrimaryFn)).rejects.toThrow('Total Failure');
    expect(mockPrimaryFn).toHaveBeenCalledTimes(2);
  });
});
