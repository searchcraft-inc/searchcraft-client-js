import { describe, expect, it } from 'vitest';
import { hasPermissions, permissionPresets, permissions } from '../../src/types/index';

describe('auth key permissions', () => {
  it('maps the conventional presets onto the masks operators recognise', () => {
    expect(permissionPresets.READ).toBe(1);
    expect(permissionPresets.INGEST).toBe(15);
    expect(permissionPresets.ADMIN).toBe(63);
  });

  it('exceeds a byte for a super user, so a permission is never one of 1|15|63', () => {
    // SUPER_USER carries READ_ANALYTICS (1 << 8), so it is > 255.
    expect(permissionPresets.SUPER_USER).toBeGreaterThan(255);
    expect(hasPermissions(permissionPresets.SUPER_USER, permissions.READ_ANALYTICS)).toBe(true);
  });

  it('combines levels and add-ons with bitwise OR', () => {
    const { READ, ADMIN, SUPER_USER, AI, ANALYTICS } = permissionPresets;
    expect(AI).toBe(permissions.LLM_RAG_SUMMARIES);
    expect(ANALYTICS).toBe(permissions.READ_ANALYTICS);
    expect(READ | AI).toBe(65);
    expect(READ | AI | ANALYTICS).toBe(321);
    // Every add-on on top of admin still stops short of a super user.
    expect(ADMIN | AI | ANALYTICS).toBe(383);
    expect(SUPER_USER).toBe(511);
  });

  it('tests individual bits', () => {
    expect(hasPermissions(permissionPresets.INGEST, permissions.MODIFY_DOCUMENTS)).toBe(true);
    expect(
      hasPermissions(permissionPresets.INGEST, permissions.SEARCH | permissions.MODIFY_SYNONYMS)
    ).toBe(true);
    expect(hasPermissions(permissionPresets.INGEST, permissions.MODIFY_AUTH)).toBe(false);
  });

  it('supports masks the client does not name', () => {
    const custom = permissions.SEARCH | permissions.READ_ANALYTICS;
    expect(hasPermissions(custom, permissions.READ_ANALYTICS)).toBe(true);
    expect(hasPermissions(custom, permissions.MODIFY_DOCUMENTS)).toBe(false);
  });
});
