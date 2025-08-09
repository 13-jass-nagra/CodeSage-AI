// import OpenAI from 'openai';
// import { Document } from '@langchain/core/documents';
// import dotenv from 'dotenv';
// dotenv.config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export const aiSummariseCommit = async (diff: string) => {
//   const response = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo', // Or 'gpt-3.5-turbo' for faster/cheaper responses
//     messages: [
//       {
//         role: 'system',
//         content: `You are an expert programmer summarizing a git diff. Reminders about the git diff format: Lines starting with '+' are added, '-' are deleted, and others are context. Example summary: '* Raised limit from 10 to 100 [file.ts]'`
//       },
//       { role: 'user', content: `Please summarise this diff:\n\n${diff}` }
//     ]
//   });
//   return response.choices?.[0]?.message?.content ?? '';
// };

// export async function summariseCode(doc: Document) {
//   console.log("getting summary for", doc.metadata.source);
//   try {
//     const code = doc.pageContent.slice(0, 10000);
//     const response = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [
//         { role: 'system', content: 'You are a senior software engineer onboarding a junior engineer.' },
//         { role: 'user', content: `Explain the purpose of ${doc.metadata.source}:\n---\n${code}\n---\nSummarize in 100 words or less.` }
//       ]
//     });
//     return response.choices?.[0]?.message?.content || '';
//   } catch (error) {
//     console.error('Error summarizing code:', error);
//     return '';
//   }
// }

// export async function generateEmbedding(summary: string) {
//   const response = await openai.embeddings.create({
//     model: 'text-embedding-ada-002',
//     input: summary
//   });
//   if (response.data && response.data[0] && response.data[0].embedding) {
//     return response.data[0].embedding;
//   }
//   return [];
// }