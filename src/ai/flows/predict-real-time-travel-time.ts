'use server';

/**
 * @fileOverview Predicts travel time between two locations using real-time traffic data from Google Maps API.
 *
 * - predictRealTimeTravelTime - A function that estimates travel time based on start and end addresses.
 * - PredictRealTimeTravelTimeInput - The input type for the predictRealTimeTravelTime function.
 * - PredictRealTimeTravelTimeOutput - The return type for the predictRealTimeTravelTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictRealTimeTravelTimeInputSchema = z.object({
  startAddress: z.string().describe('The starting street address.'),
  endAddress: z.string().describe('The destination street address.'),
});
export type PredictRealTimeTravelTimeInput = z.infer<
  typeof PredictRealTimeTravelTimeInputSchema
>;

const PredictRealTimeTravelTimeOutputSchema = z.object({
  estimatedDuration: z.number().describe('The estimated travel duration in minutes based on current traffic.'),
  trafficSummary: z.string().describe('A brief summary of the expected traffic conditions.'),
  distance: z.string().describe('The total distance of the route.'),
});
export type PredictRealTimeTravelTimeOutput = z.infer<
  typeof PredictRealTimeTravelTimeOutputSchema
>;

const getRealTimeTravelTime = ai.defineTool(
    {
        name: 'getRealTimeTravelTime',
        description: 'Gets the real-time travel duration and distance between two addresses from the Google Maps Directions API.',
        inputSchema: z.object({
            origin: z.string().describe("The starting address or place."),
            destination: z.string().describe("The destination address or place."),
        }),
        outputSchema: z.object({
            duration: z.string().describe("The travel time in traffic as a human-readable string, e.g., '34 mins'"),
            durationInMinutes: z.number().describe("The travel time in minutes, e.g., 34"),
            distance: z.string().describe("The total distance of the route, e.g., '15.4 mi'"),
            summary: z.string().describe("The name of the route, typically the main highway or street, e.g., 'I-55 S'"),
        })
    },
    async (input) => {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error("GOOGLE_MAPS_API_KEY is not set. Returning placeholder data.");
            // Provide a static response to allow UI/flow development without a key.
            return {
                duration: "25 mins",
                durationInMinutes: 25,
                distance: "15 mi",
                summary: "No API Key - Using placeholder data"
            };
        }

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(input.origin)}&destination=${encodeURIComponent(input.destination)}&departure_time=now&key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
                throw new Error(`Directions API failed with status: ${data.status}. ${data.error_message || ''}`);
            }

            const route = data.routes[0];
            const leg = route.legs[0];

            return {
                duration: leg.duration_in_traffic.text,
                durationInMinutes: Math.ceil(leg.duration_in_traffic.value / 60),
                distance: leg.distance.text,
                summary: route.summary || 'No summary available',
            };
        } catch (error) {
            console.error('Error fetching directions:', error);
            throw error;
        }
    }
);


export async function predictRealTimeTravelTime(
  input: PredictRealTimeTravelTimeInput
): Promise<PredictRealTimeTravelTimeOutput> {
  return predictRealTimeTravelTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictRealTimeTravelTimePrompt',
  input: {schema: PredictRealTimeTravelTimeInputSchema},
  output: {schema: PredictRealTimeTravelTimeOutputSchema},
  tools: [getRealTimeTravelTime],
  prompt: `You are a helpful assistant that provides real-time traffic estimates.

Your task is to estimate the travel time between two locations. Use the provided 'getRealTimeTravelTime' tool to get the current traffic conditions and route details from the user's current location.

Start Address: {{{startAddress}}}
End Address: {{{endAddress}}}

Based on the tool's output, generate a user-friendly summary. Return the estimated duration, the distance, and create a brief summary of the trip.
`,
});

const predictRealTimeTravelTimeFlow = ai.defineFlow(
  {
    name: 'predictRealTimeTravelTimeFlow',
    inputSchema: PredictRealTimeTravelTimeInputSchema,
    outputSchema: PredictRealTimeTravelTimeOutputSchema,
  },
  async input => {
    const llmResponse = await prompt(input);
    const toolOutput = llmResponse.toolRequest?.tool?.output;

    if (!toolOutput) {
       // This can happen if the API key is missing and the tool throws an error
       // or if the LLM decides not to call the tool. We'll generate a response based on the output schema.
        return {
            estimatedDuration: 25,
            trafficSummary: "Could not retrieve live traffic data. Showing an average estimate. Ensure GOOGLE_MAPS_API_KEY is set.",
            distance: "15 mi",
        };
    }
    
    // We can just pass the tool output directly if it matches the flow's output schema.
    // Or we can process it further. Here, let's just re-map it for clarity.
    return {
        estimatedDuration: toolOutput.durationInMinutes,
        trafficSummary: `The main route is via ${toolOutput.summary}.`,
        distance: toolOutput.distance,
    }
  }
);
