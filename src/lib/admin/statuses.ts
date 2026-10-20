export const statuses = ['NEW', 'REVIEWING', 'CLOSED'] as const;
export type QuoteStatus = typeof statuses[number];
