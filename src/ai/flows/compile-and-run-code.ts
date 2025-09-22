'use server';
/**
 * @fileOverview This file defines a Genkit flow for compiling and running code snippets.
 *
 * - compileAndRunCode - A function that takes code and language as input, and returns the output of the code execution.
 * - CompileAndRunCodeInput - The input type for the compileAndRunCode function.
 * - CompileAndRunCodeOutput - The return type for the compileAndRunCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompileAndRunCodeInputSchema = z.object({
  code: z.string().describe('The code to be compiled and run.'),
  language: z.enum(['python', 'java', 'cpp', 'c']).describe('The programming language of the code.'),
});
export type CompileAndRunCodeInput = z.infer<typeof CompileAndRunCodeInputSchema>;

const CompileAndRunCodeOutputSchema = z.object({
  output: z.string().describe('The output of the code execution, including any errors.'),
});
export type CompileAndRunCodeOutput = z.infer<typeof CompileAndRunCodeOutputSchema>;

export async function compileAndRunCode(input: CompileAndRunCodeInput): Promise<CompileAndRunCodeOutput> {
  return compileAndRunCodeFlow(input);
}

const executeCode = ai.defineTool(
  {
    name: 'executeCode',
    description: 'Executes code in a specified language and returns the output.',
    inputSchema: z.object({
      code: z.string().describe('The code to execute.'),
      language: z.enum(['python', 'java', 'cpp', 'c']).describe('The programming language of the code.'),
    }),
    outputSchema: z.string().describe('The output of the code execution, including any errors.'),
  },
  async input => {
    // TODO: Implement secure code execution here using a sandboxed environment.
    // This is a placeholder and needs to be replaced with a real implementation.
    console.log(
      `Executing code: ${input.code} in language: ${input.language}`
    );
    if (input.language === 'python') {
      return `Python execution stub for ${input.code}`;
    } else if (input.language === 'java') {
      return `Java execution stub for ${input.code}`;
    } else if (input.language === 'cpp') {
      return `C++ execution stub for ${input.code}`;
    } else if (input.language === 'c') {
      return `C execution stub for ${input.code}`;
    } else {
      return 'Unsupported language.';
    }
  }
);

const prompt = ai.definePrompt({
  name: 'compileAndRunCodePrompt',
  tools: [executeCode],
  input: {schema: CompileAndRunCodeInputSchema},
  output: {schema: CompileAndRunCodeOutputSchema},
  prompt: `Execute the provided code in the specified language using the executeCode tool.`,
});

const compileAndRunCodeFlow = ai.defineFlow(
  {
    name: 'compileAndRunCodeFlow',
    inputSchema: CompileAndRunCodeInputSchema,
    outputSchema: CompileAndRunCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
