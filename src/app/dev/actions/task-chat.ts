'use server';

import OpenAI from 'openai';
import { AiTaskTemplate } from '@/types/ai-tasks';

// Ensure we have an OpenAI client if key is present
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

export interface TaskChatResponse {
  message: string;
  proposedTask?: {
    title: string;
    description: string;
    category: AiTaskTemplate['category'];
    estimatedDuration: string;
    steps: string[]; // Internal logic steps for the agent
  };
}

export async function chatForTaskDraft(
  history: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<TaskChatResponse> {
  // 1. Fallback if no OpenAI
  if (!openai) {
    return localFallback(userMessage);
  }

  // 2. Build system prompt
  const systemPrompt = `You are a technical project manager agent. Your goal is to help the user draft a precise "AI Task" definition.
An AI Task will be executed by a coding agent (GitHub Actions).

The user wants to accomplish a coding goal (e.g. "scaffold a new API route", "refactor the header component", "audit for security").
You must discuss the requirements briefly. Once you have enough detail, PROPOSE the final task structure in JSON format at the END of your message.

Required fields for proposal:
- title: concise, action-oriented (e.g. "Scaffold /api/v1/users")
- description: detailed instructions for the coding agent
- category: one of 'maintenance', 'feature', 'security', 'testing', 'refactor', 'custom'
- estimatedDuration: e.g. "5m", "10m"
- steps: array of high-level logical steps (e.g. ["Create file x", "Add validation", "Export handler"])

Output format:
Conversational text first.
Then, if ready to propose, append:

\`\`\`json
{ "title": "...", ... }
\`\`\`

If not ready, ask clarifying questions.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or gpt-4 if preferred for complexity
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // 3. Extract JSON proposal if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    let proposedTask: TaskChatResponse['proposedTask'] | undefined;
    let message = content;

    if (jsonMatch) {
      try {
        proposedTask = JSON.parse(jsonMatch[1]);
        // Remove the JSON block from the user-facing message to keep it clean
        message = content.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error('Failed to parse proposed task JSON', e);
      }
    }

    return { message, proposedTask };

  } catch (err) {
    console.error('OpenAI error:', err);
    return { message: "I'm having trouble connecting to my brain. Let's try again?" };
  }
}

function localFallback(msg: string): TaskChatResponse {
  // Simple heuristic for demo purposes without API key
  const lower = msg.toLowerCase();
  if (lower.includes('scaffold') || lower.includes('create')) {
    return {
      message: "I've drafted a scaffold task based on your request.",
      proposedTask: {
        title: "Scaffold New Feature",
        description: `Implement the requested feature based on input: "${msg}"`, 
        category: "feature",
        estimatedDuration: "5m",
        steps: ["Analyze requirements", "Create files", "Implement logic"]
      }
    };
  }
  return {
    message: "I'm in offline mode. Please describe what you want to build (e.g. 'scaffold a new API route') and I'll draft a task.",
  };
}
