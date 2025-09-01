/**
 * Basic smoke test to verify test infrastructure
 */

describe('Test Infrastructure', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should handle async tests', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  it('should perform math operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 * 5).toBe(50);
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it('should work with objects', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toHaveProperty('name', 'test');
    expect(obj.value).toBeGreaterThan(40);
  });
});