'use server';

/**
 * @fileOverview Location report generation flow.
 *
 * - generateLocationReport - A function that generates a report summarizing the time spent at each location.
 * - GenerateLocationReportInput - The input type for the generateLocationReport function.
 * - GenerateLocationReportOutput - The return type for the generateLocationReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocationReportInputSchema = z.object({
  jobName: z.string().describe('The name of the job or project.'),
  locations: z.array(
    z.object({
      latitude: z.number().describe('The latitude coordinate of the location.'),
      longitude: z.number().describe('The longitude coordinate of the location.'),
      timeIn: z.string().datetime().describe('The time the technician checked in (ISO format).'),
      timeOut: z.string().datetime().describe('The time the technician checked out (ISO format).'),
    })
  ).describe('Array of locations with GPS coordinates, check-in time, and check-out time.'),
});
export type GenerateLocationReportInput = z.infer<typeof GenerateLocationReportInputSchema>;

const GenerateLocationReportOutputSchema = z.object({
  report: z.string().describe('A formatted report summarizing time spent at each location.'),
});
export type GenerateLocationReportOutput = z.infer<typeof GenerateLocationReportOutputSchema>;

export async function generateLocationReport(input: GenerateLocationReportInput): Promise<GenerateLocationReportOutput> {
  return generateLocationReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLocationReportPrompt',
  input: {schema: GenerateLocationReportInputSchema},
  output: {schema: GenerateLocationReportOutputSchema},
  prompt: `You are a report generation specialist. Generate a report summarizing the time spent by a technician at each job location. Include the job name, GPS coordinates (latitude and longitude), time in, and time out for each location.

Job Name: {{{jobName}}}
Locations:
{{#each locations}}
  - Latitude: {{{latitude}}}, Longitude: {{{longitude}}}, Time In: {{{timeIn}}}, Time Out: {{{timeOut}}}
{{/each}}

Format the report for easy readability by a supervisor.
`,
});

const generateLocationReportFlow = ai.defineFlow(
  {
    name: 'generateLocationReportFlow',
    inputSchema: GenerateLocationReportInputSchema,
    outputSchema: GenerateLocationReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
