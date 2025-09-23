'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a descriptive name for a code snippet.
 *
 * - nameCode - A function that takes code and language, and returns a descriptive name.
 * - NameCodeInput - The input type for the nameCode function.
 * - NameCodeOutput - The return type for the nameCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NameCodeInputSchema = z.object({
  code: z.string().describe('The code to be named.'),
  language: z.string().describe('The programming language of the code.'),
});
export type NameCodeInput = z.infer<typeof NameCodeInputSchema>;

const NameCodeOutputSchema = z.object({
  name: z.string().describe('A short, descriptive name for the code (3-5 words max).'),
});
export type NameCodeOutput = z.infer<typeof NameCodeOutputSchema>;

export async function nameCode(input: NameCodeInput): Promise<NameCodeOutput> {
  // If the code is empty, return a default name.
  if (!input.code.trim()) {
    return { name: "Untitled Snippet" };
  }
  return nameCodeFlow(input);
}

const namingPrompt = ai.definePrompt({
  name: 'namingPrompt',
  input: { schema: NameCodeInputSchema },
  output: { schema: NameCodeOutputSchema },
  prompt: `
    You are an expert code analyst. Your task is to give a short, descriptive name (3-5 words maximum) to the following code snippet.
    The name should summarize the code's purpose. For example, if the code checks if a number is a palindrome, a good name would be "Palindrome Number Checker".

    Do not use markdown or any special formatting. Only return the name.

    Language: {{{language}}}

    Code:
    \'\'\'
    {{{code}}}
    \'\'\'
  `,
});

const nameCodeFlow = ai.defineFlow(
  {
    name: 'nameCodeFlow',
    inputSchema: NameCodeInputSchema,
    outputSchema: NameCodeOutputSchema,
  },
  async input => {
    const { output } = await namingPrompt(input);
    return output!;
  }
);
