import { validateConfig } from '../catalog/pricing';
export class QuoteValidationError extends Error {
  constructor(public fields: Record<string, string>) { super('Please check the highlighted fields.'); }
}
function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
export function validateQuote(input: unknown) {
  if (!object(input) || Object.keys(input).some(key => !['configuration', 'contact', 'website', 'consent', 'sourcePublicId', 'priceConfirmation', 'clientTotalCents'].includes(key))) throw new QuoteValidationError({ form: 'Invalid demo request.' });
  let configuration;
  try { configuration = validateConfig(input.configuration); } catch { throw new QuoteValidationError({ configuration: 'Choose valid current desk options.' }); }
  if (typeof input.website !== 'string' || input.website.length > 200 || input.website.trim()) throw new QuoteValidationError({ form: 'Unable to submit this demo request.' });
  if (input.consent !== true) throw new QuoteValidationError({ consent: 'Confirm the demo contact-storage notice.' });
  if (!object(input.contact) || Object.keys(input.contact).some(key => !['name', 'email', 'company', 'country', 'message'].includes(key))) throw new QuoteValidationError({ form: 'Invalid contact fields.' });
  const errors: Record<string, string> = {};
  const contact = { name: '', email: '', company: '', country: '', message: '' };
  for (const [key, limit] of [['name',100],['email',254],['company',120],['country',100],['message',1000]] as const) {
    const raw = input.contact[key] ?? '';
    if (typeof raw !== 'string') { errors[key] = 'Enter text only.'; continue; }
    const value = raw.trim();
    const controls = key === 'message' ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u : /[\u0000-\u001F\u007F]/u;
    if (value.length > limit || controls.test(value)) errors[key] = `Use at most ${limit} characters without control codes.`;
    contact[key] = value;
  }
  if (!contact.name) errors.name = 'Enter a name for this demo request.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(contact.email)) errors.email = 'Enter a valid email address.';
  contact.email = contact.email.toLowerCase();
  if (Object.keys(errors).length) throw new QuoteValidationError(errors);
  const sourcePublicId = input.sourcePublicId;
  if (sourcePublicId !== undefined && (typeof sourcePublicId !== 'string' || !/^[A-Za-z0-9_-]{32}$/.test(sourcePublicId))) throw new QuoteValidationError({ form: 'Invalid source design.' });
  let priceConfirmation: { catalogVersion: string; estimatedTotalCents: number } | undefined;
  if (input.priceConfirmation !== undefined) {
    const value = input.priceConfirmation;
    if (!object(value) || Object.keys(value).length !== 2 || typeof value.catalogVersion !== 'string' || !Number.isSafeInteger(value.estimatedTotalCents) || (value.estimatedTotalCents as number) < 0) throw new QuoteValidationError({ form: 'Invalid estimate confirmation.' });
    priceConfirmation = { catalogVersion: value.catalogVersion, estimatedTotalCents: value.estimatedTotalCents as number };
  }
  // Optional legacy UI total is deliberately untrusted and never stored or used for price.
  if (input.clientTotalCents !== undefined && !Number.isSafeInteger(input.clientTotalCents)) throw new QuoteValidationError({ form: 'Invalid estimate field.' });
  return { configuration, contact, sourcePublicId: sourcePublicId as string | undefined, priceConfirmation };
}
