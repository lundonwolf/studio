'use server';

/**
 * @fileOverview Predicts travel time between two locations considering typical traffic conditions.
 *
 * - predictTravelTime - A function that estimates travel time based on departure time and addresses.
 * - PredictTravelTimeInput - The input type for the predictTravelTime function.
 * - PredictTravelTimeOutput - The return type for the predictTravelTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictTravelTimeInputSchema = z.object({
  startAddress: z.string().describe('The starting street address.'),
  endAddress: z.string().describe('The destination street address.'),
  departureTime: z.string().datetime().describe('The planned departure time in ISO format.'),
});
export type PredictTravelTimeInput = z.infer<typeof PredictTravelTimeInputSchema>;

const PredictTravelTimeOutputSchema = z.object({
    estimatedDuration: z.number().describe('The estimated travel duration in minutes.'),
    trafficSummary: z.string().describe('A brief summary of the expected traffic conditions.'),
});
export type PredictTravelTimeOutput = z.infer<typeof PredictTravelTimeOutputSchema>;

export async function predictTravelTime(input: PredictTravelTimeInput): Promise<PredictTravelTimeOutput> {
  return predictTravelTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictTravelTimePrompt',
  input: {schema: PredictTravelTimeInputSchema},
  output: {schema: PredictTravelTimeOutputSchema},
  prompt: `You are a traffic prediction expert. Your task is to estimate the travel time between two locations at a specific time of day.

Analyze the provided start and end addresses and the departure time. Based on typical traffic patterns for that route and time (e.g., rush hour, school zones, mid-day lull), estimate the travel duration in minutes.

Provide a brief summary explaining your reasoning (e.g., "Expect heavy morning rush hour traffic," or "Traffic should be light at this time.").

Start Address: {{{startAddress}}}
End Address: {{{endAddress}}}
Departure Time: {{{departureTime}}}

Return only the estimated duration and the summary.
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
