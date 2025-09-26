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
  conversation: z.string().optional().describe('The previous conversation history.'),
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
  model: 'googleai/gemini-1.5-flash',
  prompt: `
    You are a code compiler and runtime environment.
    Your task is to take the provided code, language, and conversation history, simulate its execution, and return the next part of the output.
    
    - If the code requires input and the user has just provided it in 'stdin', continue execution and produce the next output.
    - If the code is just starting and requires input (e.g., waiting for 'input()' in Python), prompt the user for the input.
    - If the code runs to completion without needing input, return only the standard output.
    - If there are compilation or runtime errors, return only the error messages.
    - Do not add any extra explanations, greetings, or formatting. Only return the raw output or a prompt for input.
    
    Here is the previous conversation, including any prompts for input and the user's replies. Use this to understand the current state of the execution:
    \'\'\'
    {{{conversation}}}
    \'\'\'
    
    Language: {{{language}}}
    Code:
    \'\'\'
    {{{code}}}
    \'\'\'
    
    {{#if stdin}}
    The user has just provided this input: {{{stdin}}}
    Continue execution.
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
