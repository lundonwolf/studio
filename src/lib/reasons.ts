import type { CheckoutReason } from './types';

export const defaultReasons: CheckoutReason[] = [
    { id: 'reason-1', text: 'Screen not powering on' },
    { id: 'reason-2', text: 'Pixelation issues' },
    { id: 'reason-3', text: 'Physical damage to screen' },
    { id: 'reason-4', text: 'Connectivity problems' },
];
