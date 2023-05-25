import fetch from 'node-fetch';

export async function promptOpenAI(prompt: string): Promise <string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      max_tokens:500,
      temperature: 0.7,
    }),
    });

  const data = await response.json();

  console.log(data);
}
