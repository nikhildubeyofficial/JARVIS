'use server';
/**
 * @fileOverview Converts voice commands to text.
 *
 * - convertVoiceToText - A function that converts voice to text.
 * - ConvertVoiceToTextInput - The input type for the convertVoiceToText function.
 * - ConvertVoiceToTextOutput - The return type for the convertVoiceToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertVoiceToTextSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A audio recording of the user's voice command, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ConvertVoiceToTextInput = z.infer<typeof ConvertVoiceToTextSchema>;

const ConvertVoiceToTextOutputSchema = z.object({
  text: z.string().describe('The converted text from the audio input.'),
});
export type ConvertVoiceToTextOutput = z.infer<typeof ConvertVoiceToTextOutputSchema>;

export async function convertVoiceToText(input: ConvertVoiceToTextInput): Promise<ConvertVoiceToTextOutput> {
  return convertVoiceToTextFlow(input);
}

const convertVoiceToTextPrompt = ai.definePrompt({
  name: 'convertVoiceToTextPrompt',
  input: {schema: ConvertVoiceToTextSchema},
  output: {schema: ConvertVoiceToTextOutputSchema},
  prompt: `You are a voice assistant, convert the following voice recording to text:\n\nVoice Command: {{media url=audioDataUri}}`,
});

const convertVoiceToTextFlow = ai.defineFlow(
  {
    name: 'convertVoiceToTextFlow',
    inputSchema: ConvertVoiceToTextSchema,
    outputSchema: ConvertVoiceToTextOutputSchema,
  },
  async input => {
    const {output} = await convertVoiceToTextPrompt(input);
    return output!;
  }
);
