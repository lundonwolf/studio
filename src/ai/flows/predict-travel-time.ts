'use server';

/**
 * @fileOverview Predicts travel time between two locations based on departure time.
 *
 * - predictTravelTime - A function that estimates travel time based on start and end addresses and a departure time.
 * - PredictTravelTimeInput - The input type for the predictTravelTime function.
 * - PredictTravelTimeOutput - The return type for the predictTravelTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictTravelTimeInputSchema = z.object({
  startAddress: z.string().describe('The starting street address.'),
  endAddress: z.string().describe('The destination street address.'),
  departureTime: z.string().describe('The desired departure time (e.g., "9:00 AM").'),
});
export type PredictTravelTimeInput = z.infer<
  typeof PredictTravelTimeInputSchema
>;

const PredictTravelTimeOutputSchema = z.object({
  estimatedDuration: z.number().describe('The estimated travel duration in minutes.'),
  trafficSummary: z.string().describe('A brief summary of the expected traffic conditions at the specified departure time.'),
  distance: z.string().describe('The total distance of the route.'),
});
export type PredictTravelTimeOutput = z.infer<
  typeof PredictTravelTimeOutputSchema
>;

export async function predictTravelTime(
  input: PredictTravelTimeInput
): Promise<PredictTravelTimeOutput> {
  return predictTravelTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictTravelTimePrompt',
  input: {schema: PredictTravelTimeInputSchema},
  output: {schema: PredictTravelTimeOutputSchema},
  prompt: `You are an expert traffic analyst. Based on historical data, predict the travel time between the start and end address for the given departure time.

Start Address: {{{startAddress}}}
End Address: {{{endAddress}}}
Departure Time: {{{departureTime}}}

Provide the estimated duration in minutes, a summary of expected traffic, and the approximate distance.
`,
});

const predictTravelTimeFlow = ai.defineFlow(
  {
    name: 'predictTravelTimeFlow',
    inputSchema: PredictTravelTimeInputSchema,
    outputSchema: PredictTravelTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
