// 'use server'

// import { createStreamableValue } from 'ai/rsc'
// import { db } from '@/server/db'
// import { generateEmbedding } from '@/lib/ollama'

// export async function askQuestion(question: string, projectId: string) {
//   const stream = createStreamableValue()

//   const queryVector = await generateEmbedding(question)
//   const vectorQuery = `[${queryVector.join(',')}]`

//   const result = await db.$queryRaw`
//     SELECT "fileName", "sourceCode", "summary",
//     1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
//     FROM "SourceCodeEmbedding"
//     WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
//     AND "projectId" = ${projectId}
//     ORDER BY similarity DESC
//     LIMIT 10
//   ` as { fileName: string; sourceCode: string; summary: string }[]

//   let context = ''

//   for (const doc of result) {
//     context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
//   }

//   const prompt = `
// You are an AI code assistant who answers questions about the codebase.
// Your audience is a technical intern. Respond clearly, thoroughly, and in markdown format.

// CONTEXT:
// ${context}

// QUESTION:
// ${question}

// Only use the information in the context to answer.
// If you cannot find an answer, say: "I'm sorry, but I don't know the answer."
// `

//   // ⬇️ Call Ollama's local API
//   try {
//     const res = await fetch("http://localhost:11434/api/generate", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         model: "mistral", // or "llama3", "codellama", etc.
//         prompt,
//         stream: false
//       })
//     })

//     const json = await res.json()

//     // Stream the response line-by-line
//     const answer = json.response?.trim() || ""
//     for (const line of answer.split("\n")) {
//       stream.update(line + "\n")
//       await new Promise(r => setTimeout(r, 30)) // simulate stream
//     }

//     stream.done()
//   } catch (err) {
//     stream.update("❌ Error: Failed to generate answer from Ollama")
//     stream.done()
//   }

//   return {
//     output: stream.value,
//     filesReferences: result
//   }
// }


// --------------------------------------------------------------------------------------------------------------
'use server'

import { streamText } from 'ai' // 82.9k (gzipped: 22.2k)
import { createStreamableValue } from 'ai/rsc' // 302 (gzipped: 204)
import { createGoogleGenerativeAI } from '@ai-sdk/google' // 24.7k (gzipped: 302)
import { generateEmbedding } from '@/lib/gemini'
// import { generateEmbedding } from '@/lib/openai'
import { db } from '@/server/db'
// import { generateEmbedding } from '@/lib/ollama'

const google = createGoogleGenerativeAI({ 
  apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue()

  const queryVector = await generateEmbedding(question)
  const vectorQuery = `[${queryVector.join(',')}]`

  const result = await db.$queryRaw`
  SELECT "fileName", "sourceCode", "summary",
  1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
` as { fileName: string; sourceCode: string; summary: string }[]

let context = ''

    for (const doc of result){
        context +=`source: ${doc.fileName}\n code content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`
    }

    (async ()=>{
        const {textStream} = await streamText({
            model:google('gemini-2.5-flash'),
            prompt:`
    You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern.
    AI assistant is a brand new, powerful, human-like artificial intelligence.
    The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
    AI is a well-behaved and well-mannered individual.
    AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
    AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the codebase.

    If the question is asking about code or a specific file, AI will provide the detailed answer, giving step-by-step instructions.

    START CONTEXT BLOCK
    ${context}
    END OF CONTEXT BLOCK

    START QUESTION
    ${question}
    END OF QUESTION

    AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
    If the context does not provide the answer to the question, the AI assistant will say, "I'm sorry, but I don't know the answer."
    AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
    AI assistant will not invent anything that is not drawn directly from the context.
    Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, make sure there is no ambiguity or missing context in your explanation.`,
        });

        for await (const delta of textStream){
            stream.update(delta)
        }

        stream.done()
    })()

    return {
        output: stream.value,
        filesReferences: result
    }
}

//-------------------------------------------------------------------------------------------------------
// 'use server'

// import { createStreamableValue } from 'ai/rsc'
// import { db } from '@/server/db'
// import { generateEmbedding } from '@/lib/ollama'

// export async function askQuestion(question: string, projectId: string) {
//   const stream = createStreamableValue()

//   // 🔹 Step 1: Get embedding vector for the question
//   const queryVector = await generateEmbedding(question)
//   const vectorQuery = `[${queryVector.join(',')}]`

//   // 🔹 Step 2: Fetch most relevant files from DB
//   const result = await db.$queryRaw`
//     SELECT "fileName", "sourceCode", "summary",
//     1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
//     FROM "SourceCodeEmbedding"
//     WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
//     AND "projectId" = ${projectId}
//     ORDER BY similarity DESC
//     LIMIT 10
//   ` as { fileName: string; sourceCode: string; summary: string }[]

//   // 🔹 Step 3: Build context string
//   let context = ''
//   for (const doc of result) {
//     context += `File: ${doc.fileName}\nCode:\n${doc.sourceCode}\nSummary: ${doc.summary}\n\n`
//   }

//   // 🔹 Step 4: Create the prompt
//   const prompt = `
// You are an expert AI code assistant.
// Help answer the following technical question using the provided code context.

// CONTEXT:
// ${context}

// QUESTION:
// ${question}

// INSTRUCTIONS:
// - Only use the context to answer the question.
// - If the context does not help, reply: "I'm sorry, but I don't know the answer."
// - Be clear, technical, and explain step-by-step.
// - Format the response in markdown.
// `

//   // 🔹 Step 5: Ask Ollama running Gemma model
//   try {
//     const res = await fetch("http://localhost:11434/api/generate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         model: "gemma3:1b", // ✅ You're using this model
//         prompt,
//         stream: false
//       }),
//     })

//     const json = await res.json()

//     const fullResponse = json.response?.trim() || ""
//     for (const line of fullResponse.split("\n")) {
//       stream.update(line + "\n")
//       await new Promise(res => setTimeout(res, 20)) // Simulate stream
//     }

//     stream.done()
//   } catch (err) {
//     stream.update("❌ Error: Failed to generate response from Ollama.")
//     stream.done()
//   }

//   return {
//     output: stream.value,
//     filesReferences: result
//   }
// }
