'use server';
/**
 * @fileOverview This file defines a Genkit flow for assisting with code generation and modification.
 *
 * - assistWithCode - A function that takes code, language, and a user's request, and returns the modified code.
 * - AssistWithCodeInput - The input type for the assistWithCode function.
 * - AssistWithCodeOutput - The return type for the assistWithCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistWithCodeInputSchema = z.object({
  code: z.string().describe('The current code in the editor.'),
  language: z.string().describe('The programming language of the code.'),
  request: z.string().describe('The user\'s natural language request for code modification.'),
});
export type AssistWithCodeInput = z.infer<typeof AssistWithCodeInputSchema>;

const AssistWithCodeOutputSchema = z.object({
  code: z.string().describe('The new, modified code block.'),
});
export type AssistWithCodeOutput = z.infer<typeof AssistWithCodeOutputSchema>;

export async function assistWithCode(input: AssistWithCodeInput): Promise<AssistWithCodeOutput> {
  return assistWithCodeFlow(input);
}

const assistantPrompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: { schema: AssistWithCodeInputSchema },
  output: { schema: AssistWithCodeOutputSchema },
  prompt: `
    You are an expert AI coding assistant. Your task is to modify the provided code based on the user's request.
    Analyze the user's request and the existing code carefully.
    Return the complete, updated code. Do not add any explanations, comments, or introductory text.
    Only return the raw, modified code inside the 'code' field of the output.

    Language: {{{language}}}

    User's Request: {{{request}}}

    Current Code:
    \'\'\'
    {{{code}}}
    \'\'\'
  `,
});


const assistWithCodeFlow = ai.defineFlow(
  {
    name: 'assistWithCodeFlow',
    inputSchema: AssistWithCodeInputSchema,
    outputSchema: AssistWithCodeOutputSchema,
  },
  async input => {
    const { output } = await assistantPrompt(input);
    return output!;
  }
);
