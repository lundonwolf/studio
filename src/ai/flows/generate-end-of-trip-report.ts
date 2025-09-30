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

const StopReportSchema = z.object({
  propertyName: z.string().describe('The name of the property or stop.'),
  address: z.string().describe('The address of the stop.'),
  timeIn: z.string().datetime().describe('The check-in time for the stop (ISO format).'),
  timeOut: z.string().datetime().describe('The check-out time for the stop (ISO format).'),
  status: z.string().describe('The status of the visit (e.g., Successful, Not Successful).'),
  notes: z.string().describe('Technician notes for this specific stop.'),
});

const GenerateEndOfTripReportInputSchema = z.object({
  totalHoursWorked: z
    .number()
    .describe('Total hours worked during the trip.'),
  numberOfStops: z
    .number()
    .int()
    .describe('The total number of stops visited.'),
  stops: z.array(StopReportSchema).describe('An array of all the stops visited during the trip with their details.'),
  endOfDayInventoryCheck: z
    .string()
    .describe('Result of the end-of-day inventory check.'),
  mileage: z.number().describe('Total mileage driven during the trip.'),
  expenses: z
    .string()
    .describe(
      'Expenses incurred during the trip (e.g., parking, tolls). Describe each expense and the cost.'
    ),
  technicianNotes: z
    .string()
    .describe('Any additional notes from the technician for the overall trip.'),
});
export type GenerateEndOfTripReportInput = z.infer<
  typeof GenerateEndOfTripReportInputSchema
>;

const GenerateEndOfTripReportOutputSchema = z.object({
  report: z.string().describe('The generated end-of-trip report in a well-formatted string.'),
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
  prompt: `You are a helpful assistant that generates detailed and easy-to-read end-of-trip reports for technicians.

  Generate a report with the following structure:

  **END OF TRIP REPORT**

  **Overall Summary**
  - **TOTAL TIME:** {{{totalHoursWorked}}} hours
  - **TOTAL MILEAGE:** {{{mileage}}} miles
  - **NUMBER OF STOPS:** {{{numberOfStops}}}

  **Stop Details**
  {{#each stops}}
  ---
  - **Location:** {{propertyName}} ({{address}})
  - **Time:** {{timeIn}} - {{timeOut}}
  - **Status:** {{status}}
  - **Notes:** {{notes}}
  {{/each}}

  **Trip-Level Notes & Expenses**
  - **End of Day Inventory:** {{{endOfDayInventoryCheck}}}
  - **Expenses:** {{{expenses}}}
  - **Technician's Final Notes:** {{{technicianNotes}}}

  The report should be concise, well-organized, and suitable for supervisor review and reimbursement processing. Ensure all sections are clearly marked. Use Markdown for formatting.
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
