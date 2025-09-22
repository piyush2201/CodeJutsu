'use server';
/**
 * @fileOverview This file defines a Genkit flow for compiling and running code snippets.
 *
 * - compileAndRunCode - A function that takes code, language, and optional stdin as input, and returns the output of the code execution.
 * - CompileAndRunCodeInput - The input type for the compileAndRunCode function.
 * - CompileAndRunCodeOutput - The return type for the compileAndRunCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompileAndRunCodeInputSchema = z.object({
  code: z.string().describe('The code to be compiled and run.'),
  language: z.enum(['python', 'java', 'cpp', 'c']).describe('The programming language of the code.'),
  stdin: z.string().optional().describe('The standard input to provide to the code.'),
});
export type CompileAndRunCodeInput = z.infer<typeof CompileAndRunCodeInputSchema>;

const CompileAndRunCodeOutputSchema = z.object({
  output: z.string().describe('The output of the code execution, including any errors.'),
});
export type CompileAndRunCodeOutput = z.infer<typeof CompileAndRunCodeOutputSchema>;

export async function compileAndRunCode(input: CompileAndRunCodeInput): Promise<CompileAndRunCodeOutput> {
  return compileAndRunCodeFlow(input);
}

const compilationPrompt = ai.definePrompt({
  name: 'compilationPrompt',
  input: { schema: CompileAndRunCodeInputSchema },
  output: { schema: CompileAndRunCodeOutputSchema },
  prompt: `
    You are a code compiler and runtime environment.
    Your task is to take the provided code, language, and standard input (if any), simulate its execution, and return the exact output.
    - If the code compiles and runs successfully, return only the standard output.
    - If there are compilation or runtime errors, return only the error messages.
    - Do not add any extra explanations, greetings, or formatting. Only return the raw output as a string.

    Language: {{{language}}}
    Code:
    \'\'\'
    {{{code}}}
    \'\'\'
    {{#if stdin}}
    Standard Input:
    \'\'\'
    {{{stdin}}}
    \'\'\'
    {{/if}}
  `,
});


const compileAndRunCodeFlow = ai.defineFlow(
  {
    name: 'compileAndRunCodeFlow',
    inputSchema: CompileAndRunCodeInputSchema,
    outputSchema: CompileAndRunCodeOutputSchema,
  },
  async input => {
    const { output } = await compilationPrompt(input);
    return output!;
  }
);
