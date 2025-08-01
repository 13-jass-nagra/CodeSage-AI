// // src/lib/ollama.ts
// import { Document } from '@langchain/core/documents'

// // 👉 Ollama runs at: http://localhost:11434
// const OLLAMA_API_URL = "http://localhost:11434/api/generate"
// const MODEL = "gemma3:1b" // The model you pulled using `ollama run gemma:1b`

// // 🔹 1. Summarize a Git Commit Diff
// export const aiSummariseCommit = async (diff: string): Promise<string> => {
//   const prompt = `
// You are a senior developer. Summarize the following Git commit diff into 2–5 bullet points.

// Focus on what changed and why.

// --- BEGIN DIFF ---
// ${diff}
// --- END DIFF ---

// Keep it clear, technical, and concise.`
  
//   try {
//     const res = await fetch(OLLAMA_API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: MODEL,
//         prompt,
//         stream: false,
//       }),
//     })

//     const json = await res.json()
//     return json.response?.trim() || ""
//   } catch (err) {
//     console.error("❌ Ollama failed to summarize commit:", err)
//     return "⚠️ Commit summary failed."
//   }
// }

// // 🔹 2. Summarize Code File (for onboarding)
// export async function summariseCode(doc: Document) {
//   const code = doc.pageContent.slice(0, 10000)
//   const prompt = `
// You are onboarding a junior developer to this project.
// Give a short 100-word explanation of the purpose of the file: ${doc.metadata.source}

// Here is the code:
// ---
// ${code}
// ---
// What does this file do? Explain simply.`

//   try {
//     const res = await fetch(OLLAMA_API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: MODEL,
//         prompt,
//         stream: false,
//       }),
//     })

//     const json = await res.json()
//     return json.response?.trim() || ""
//   } catch (err) {
//     console.error("❌ Ollama failed to summarize code file:", err)
//     return "⚠️ Code summary failed."
//   }
// }

// // 🔹 3. Generate Embedding (basic workaround for now)
// export async function generateEmbedding(summary: string): Promise<number[]> {
//   // ⚠️ Gemma doesn't support embedding natively via Ollama
//   // 👉 Use a fake embedding vector (hashed char codes) as placeholder
//   const embedding = summary
//     .split("")
//     .slice(0, 128)
//     .map(char => char.charCodeAt(0) / 255) // Normalize for pseudo-embedding
//   return embedding
// }
