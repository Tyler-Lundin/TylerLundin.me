
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TASK_TITLE = process.env.TASK_TITLE;
const TASK_DESC = process.env.TASK_DESC;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

async function main() {
  console.log('Agent starting...');
  console.log('Task:', TASK_TITLE);
  
  // 1. Context Gathering
  let files = '';
  try {
    // List all files recursively, excluding node_modules and .git
    files = execSync('find . -maxdepth 3 -not -path "*/.*" -not -path "./node_modules*"').toString();
  } catch (e) {
    files = 'Could not list files.';
  }
  
  // 2. Prompt Engineering
  const prompt = `You are an AI coding agent.
  Goal: ${TASK_TITLE}
  Instructions: ${TASK_DESC}
  
  Current File Structure (Partial):
  ${files}
  
  Return a JSON object with a single key "files" containing an array of file objects to create or update.
  Format: { "files": [{ "path": "path/to/file.ext", "content": "file content code..." }] }
  Do not include markdown formatting (like code fences), just the raw JSON string.`;

  console.log('Sending prompt to OpenAI...');

  // 3. Call OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI API Error: ${res.status} ${res.statusText} - ${txt}`);
  }

  const data = await res.json();
  const rawOutput = data.choices[0].message.content;
  console.log('AI Response received.');

  // 4. Parse & Execute
  let plan;
  try {
    // Simple cleanup for common markdown fences
    let cleanJson = rawOutput.trim();
    // Remove wrapping backticks if present (matches ``` or ```json at start/end)
    cleanJson = cleanJson.replace(/^\`\`\`(json)?/, '').replace(/\`\`\`$/, '');
    plan = JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', rawOutput);
    process.exit(1);
  }

  if (!plan.files || !Array.isArray(plan.files)) {
    console.error('Invalid plan format (missing files array).');
    process.exit(1);
  }

  for (const file of plan.files) {
    // FIX: Remove leading slashes to ensure path is relative to current directory
    // Otherwise '/docs/...' tries to write to the hard drive root (Permission Denied)
    const relativePath = file.path.replace(/^[\/]+/, '');
    const filePath = path.join(process.cwd(), relativePath);
    
    const dir = path.dirname(filePath);
    
    if (dir !== process.cwd()) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, file.content);
    console.log(`Wrote ${filePath}`);
  }
  
  console.log('Agent execution finished.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
