'use server';

/**
 * @fileOverview A flow to convert a street address into geographic coordinates.
 *
 * - geocodeAddress - A function that takes an address and returns its latitude and longitude.
 * - GeocodeAddressInput - The input type for the geocodeAddress function.
 * - GeocodeAddressOutput - The return type for the geocodeAddress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeocodeAddressInputSchema = z.object({
  address: z.string().describe('The street address to geocode.'),
});
export type GeocodeAddressInput = z.infer<typeof GeocodeAddressInputSchema>;

const GeocodeAddressOutputSchema = z.object({
  latitude: z.number().describe('The latitude of the address.'),
  longitude: z.number().describe('The longitude of the address.'),
});
export type GeocodeAddressOutput = z.infer<typeof GeocodeAddressOutputSchema>;

export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeAddressOutput> {
    return geocodeAddressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'geocodeAddressPrompt',
  input: {schema: GeocodeAddressInputSchema},
  output: {schema: GeocodeAddressOutputSchema},
  prompt: `You are a geocoding expert. Given the following address, determine its latitude and longitude.

Address: {{{address}}}

Return only the coordinates.
`,
});

const geocodeAddressFlow = ai.defineFlow(
  {
    name: 'geocodeAddressFlow',
    inputSchema: GeocodeAddressInputSchema,
    outputSchema: GeocodeAddressOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
