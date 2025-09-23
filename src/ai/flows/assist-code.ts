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
  request: z.string().describe('The user\'s natural language request for code modification or a question about the code.'),
});
export type AssistWithCodeInput = z.infer<typeof AssistWithCodeInputSchema>;

const AssistWithCodeOutputSchema = z.object({
  responseType: z.enum(['code', 'answer']).describe('The type of response. Is it a code modification or an answer to a question?'),
  code: z.string().optional().describe('The new, modified code block. Only present if responseType is "code".'),
  answer: z.string().optional().describe('A textual answer to a question about the code. Only present if responseType is "answer".'),
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
    You are an expert AI coding assistant. Your task is to help the user with their code.
    Analyze the user's request and the existing code carefully.

    1.  First, determine if the user is asking a **question** about the code (e.g., "what does this do?", "explain this", "how can I improve this?") or requesting a direct **code modification** (e.g., "add a function", "refactor this", "fix the bug").

    2.  If the user is asking a **question**:
        -   Set the 'responseType' to 'answer'.
        -   Provide a clear, concise, and helpful explanation in the 'answer' field.
        -   Do not provide any code in the 'code' field.

    3.  If the user is requesting a **code modification**:
        -   Set the 'responseType' to 'code'.
        -   Return the complete, updated code in the 'code' field.
        -   **IMPORTANT**: Ensure the returned code is properly formatted with correct indentation and line breaks. It should be ready to be directly placed into an editor.
        -   Do not add any explanations, comments, or introductory text in the 'code' field. Only return the raw, modified code.
        -   Do not provide any text in the 'answer' field.

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
