export const COUNTRIES = [
  { name: 'United States', code: '+1' },
  { name: 'Canada', code: '+1' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'Germany', code: '+49' },
  { name: 'Australia', code: '+61' },
  { name: 'India', code: '+91' },
  { name: 'France', code: '+33' },
  { name: 'Japan', code: '+81' },
] as const;

export const PHONE_CODE_OPTIONS = Array.from(
  COUNTRIES.reduce((map, country) => {
    const list = map.get(country.code) ?? [];
    map.set(country.code, [...list, country.name]);
    return map;
  }, new Map<string, string[]>())
).map(([code, countries]) => ({ code, countries }));
