import { collect, isAllowedLicense, licenseOf } from '../../scripts/check-licenses';

describe('isAllowedLicense', () => {
  it('accepts permissive licenses', () => {
    for (const l of ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', '0BSD']) {
      expect(isAllowedLicense(l)).toBe(true);
    }
  });

  it('rejects copyleft, proprietary and missing licenses', () => {
    for (const l of [
      'GPL-3.0',
      'AGPL-3.0-only',
      'LGPL-2.1',
      'UNLICENSED',
      'SEE LICENSE IN x',
      '',
      undefined,
      null,
    ]) {
      expect(isAllowedLicense(l)).toBe(false);
    }
  });

  it('handles SPDX expressions', () => {
    expect(isAllowedLicense('(MIT OR GPL-3.0)')).toBe(true);
    expect(isAllowedLicense('MIT AND Apache-2.0')).toBe(true);
    expect(isAllowedLicense('(MIT AND GPL-3.0)')).toBe(false);
    expect(isAllowedLicense('GPL-2.0 OR GPL-3.0')).toBe(false);
  });
});

describe('licenseOf', () => {
  it('reads the old object and array forms', () => {
    expect(licenseOf({ license: 'MIT' })).toBe('MIT');
    expect(licenseOf({ license: { type: 'ISC' } })).toBe('ISC');
    expect(licenseOf({ licenses: [{ type: 'MIT' }, { type: 'Apache-2.0' }] })).toBe(
      'MIT OR Apache-2.0',
    );
    expect(licenseOf({})).toBeUndefined();
  });
});

describe('collect', () => {
  it('flattens a nested npm ls tree without duplicates', () => {
    const tree = {
      dependencies: {
        a: { version: '1.0.0', dependencies: { c: { version: '3.0.0' } } },
        b: { version: '2.0.0', dependencies: { c: { version: '3.0.0' } } },
      },
    };
    expect([...collect(tree).keys()].sort()).toEqual(['a@1.0.0', 'b@2.0.0', 'c@3.0.0']);
  });
});
