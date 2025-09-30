'use server';

/**
 * @fileOverview Generates an end-of-trip report including total hours worked, inventory check, mileage, expenses, and technician notes.
 *
 * - generateEndOfTripReport - A function that generates the end-of-trip report.
 * - GenerateEndOfTripReportInput - The input type for the generateEndOfTripReport function.
 * - GenerateEndOfTripReportOutput - The return type for the generateEndOfTripReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEndOfTripReportInputSchema = z.object({
  totalHoursWorked: z
    .number()
    .describe('Total hours worked during the trip.'),
  endOfDayInventoryCheck: z
    .string()
    .describe('Result of the end-of-day inventory check.'),
  mileage: z.number().describe('Total mileage driven during the trip.'),
  expenses: z
    .string()
    .describe(
      'Expenses incurred during the trip (e.g., parking, tolls).  Describe each expense and the cost.'
    ),
  technicianNotes: z
    .string()
    .describe('Any additional notes from the technician.'),
});
export type GenerateEndOfTripReportInput = z.infer<
  typeof GenerateEndOfTripReportInputSchema
>;

const GenerateEndOfTripReportOutputSchema = z.object({
  report: z.string().describe('The generated end-of-trip report.'),
});
export type GenerateEndOfTripReportOutput = z.infer<
  typeof GenerateEndOfTripReportOutputSchema
>;

export async function generateEndOfTripReport(
  input: GenerateEndOfTripReportInput
): Promise<GenerateEndOfTripReportOutput> {
  return generateEndOfTripReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEndOfTripReportPrompt',
  input: {schema: GenerateEndOfTripReportInputSchema},
  output: {schema: GenerateEndOfTripReportOutputSchema},
  prompt: `You are a helpful assistant that generates end-of-trip reports for technicians.

  Create a concise end-of-trip report based on the following information:

  Total Hours Worked: {{{totalHoursWorked}}} hours
  End-of-Day Inventory Check: {{{endOfDayInventoryCheck}}}
  Mileage: {{{mileage}}} miles
  Expenses: {{{expenses}}}
  Technician Notes: {{{technicianNotes}}}

  The report should summarize the key details and be suitable for supervisor review and reimbursement processing.
  `,
});

const generateEndOfTripReportFlow = ai.defineFlow(
  {
    name: 'generateEndOfTripReportFlow',
    inputSchema: GenerateEndOfTripReportInputSchema,
    outputSchema: GenerateEndOfTripReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
