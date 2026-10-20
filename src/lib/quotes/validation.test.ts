import { describe, expect, it } from 'vitest';
import { defaultConfiguration } from '../catalog';
import { validateQuote } from './validation';
const input = { configuration: defaultConfiguration, contact: { name: ' Demo Visitor ', email: ' DEMO@example.com ', company: '', country: '', message: '  Example\nrequest  ' }, website: '', consent: true };
describe('private demo quote boundary', () => {
  it('normalizes bounded text without mixing contact into product configuration', () => {
    const result = validateQuote(input);
    expect(result.contact).toEqual({ name: 'Demo Visitor', email: 'demo@example.com', company: '', country: '', message: 'Example\nrequest' });
    expect(result.configuration).toEqual(defaultConfiguration);
    expect(input.contact.name).toBe(' Demo Visitor ');
  });
  it.each([{ name: '' }, { email: 'invalid' }, { email: 'a@example.com\r\nBcc:other@example.com' }, { name: 'x'.repeat(101) }, { company: 'x'.repeat(121) }, { country: 'x'.repeat(101) }, { message: 'x'.repeat(1001) }, { email: 1 }, { name: 'x\u0000y' }])('rejects invalid contact fields %# without echoing their value', contact => {
    expect(() => validateQuote({ ...input, contact: { ...input.contact, ...contact } })).toThrow('highlighted');
  });
  it('rejects unknown fields, product tampering, missing consent and honeypots', () => {
    for (const value of [null, [], { ...input, admin: true }, { ...input, consent: false }, { ...input, website: 'https://bot.example' }, { ...input, contact: { ...input.contact, privateExtra: 'x' } }, { ...input, configuration: { ...defaultConfiguration, price: 1 } }]) expect(() => validateQuote(value)).toThrow();
  });
  it('discards a client-supplied total and validates a separate current-price acknowledgment', () => {
    expect(validateQuote({ ...input, clientTotalCents: 1 })).not.toHaveProperty('clientTotalCents');
    expect(validateQuote({ ...input, priceConfirmation: { catalogVersion: '1', estimatedTotalCents: 39900 } }).priceConfirmation?.estimatedTotalCents).toBe(39900);
    expect(() => validateQuote({ ...input, priceConfirmation: { catalogVersion: '1', estimatedTotalCents: -1 } })).toThrow();
    expect(() => validateQuote({ ...input, sourcePublicId: '../private' })).toThrow();
  });
  it('treats markup as plain text for later escaped presentation, never executable code', () => {
    expect(validateQuote({ ...input, contact: { ...input.contact, message: '<script>example()</script>' } }).contact.message).toBe('<script>example()</script>');
  });
});
