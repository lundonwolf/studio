import type { CheckoutReason } from './types';

export const defaultSuccessfulReasons: CheckoutReason[] = [
    { id: 'success-1', text: 'Completed as expected' },
];

export const defaultReasons: CheckoutReason[] = [
    { id: 'reason-1', text: 'Screen not powering on' },
    { id: 'reason-2', text: 'Pixelation issues' },
    { id: 'reason-3', text: 'Physical damage to screen' },
    { id: 'reason-4', text: 'Connectivity problems' },
];
