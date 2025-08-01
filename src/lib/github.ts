import { Octokit } from "octokit"
import { db } from "@/server/db"
import { aiSummariseCommit } from "./gemini"
// import { aiSummariseCommit } from '@/lib/ollama'


if (!process.env.GITHUB_TOKEN) {
  throw new Error("Missing GitHub token in environment variables")
}

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

type Response = {
  commitHash: string
  commitMessage: string
  commitAuthorName: string
  commitAuthorAvatar: string
  commitDate: string
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split('/').slice(-2)
  if (!owner || !repo) throw new Error("Invalid GitHub URL")

  const { data } = await octokit.rest.repos.listCommits({ owner, repo })

  const sortedCommits = data.sort(
    (a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
  ) as any[]

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? ""
  }))
}

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId)
  const commitHashes = await getCommitHashes(githubUrl)
  const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes)

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map(commit => summariseCommit(githubUrl, commit.commitHash))
  )

  const summaries = summaryResponses.map((response) =>
    response.status === 'fulfilled' ? response.value as string : ""
  )

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => ({
      projectId,
      commitHash: unprocessedCommits[index]!.commitHash,
      commitMessage: unprocessedCommits[index]!.commitMessage,
      commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
      commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
      commitDate: unprocessedCommits[index]!.commitDate,
      summary,
    }))
  })

  return commits
}

// ✅ FIXED: Use Octokit to fetch diff properly
async function summariseCommit(githubUrl: string, commitHash: string): Promise<string> {
  const [owner, repo] = githubUrl.split("/").slice(-2) as [string, string]

  try {
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/commits/{ref}',
      {
        owner,
        repo,
        ref: commitHash,
        headers: {
          accept: 'application/vnd.github.v3.diff',
        },
      }
    )

    const diff = response.data as unknown as string
    return await aiSummariseCommit(diff) || ""
  } catch (err) {
    console.error(`❌ Failed to summarize commit ${commitHash}:`, err)
    return ""
  }
}


async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true
    }
  })

  if (!project?.githubUrl) {
    throw new Error("Project has no GitHub URL")
  }

  return { project, githubUrl: project.githubUrl }
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
  const processedCommits = await db.commit.findMany({
    where: { projectId }
  })

  return commitHashes.filter(commit =>
    !processedCommits.some(p => p.commitHash === commit.commitHash)
  )
}


// import {Octokit} from "octokit"
// import { db } from "@/server/db"
// import axios from "axios" 
// import { aiSummariseCommit } from "./gemini"
// import { promise } from "zod"

// export const octokit=new Octokit({
//     auth:process.env.GITHUB_TOKEN,
// })

// const githubUrl = 'https://github.com/docker/genai-stack'

// type Response ={
//   commitHash : string;
//   commitMessage: string;
//   commitAuthorName:string;
//   commitAuthorAvatar:string;
//   commitDate: string;
// }

// export const getCommitHashes=async(githubUrl:string) : Promise<Response[]>=>{
//   // https://github.com/docker/genai-stack
//   const [owner,repo] = githubUrl.split('/').slice(-2)
//   if(!owner || !repo){
//     throw new Error("Invalid github url")
//   }
//     const {data} = await octokit.rest.repos.listCommits({
//         owner,
//         repo
//     })
//     const sortedCommits = data.sort((a: any, b: any) =>
//   new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
// ) as any[]

// return sortedCommits.slice(0, 10).map((commit: any) => ({
//   commitHash: commit.sha as string,
//   commitMessage: commit.commit.message ?? "",
//   commitAuthorName: commit.commit?.author?.name ?? "",
//   commitAuthorAvatar: commit?.author?.avatar_url ?? "",
//   commitDate: commit.commit?.author?.date ?? ""
// }))
// }
// console.log(await getCommitHashes(githubUrl))

// export const pollCommits = async (projectId: string) => {
//   const { project, githubUrl } = await fetchProjectGithubUrl(projectId)
//   const commitHashes = await getCommitHashes(githubUrl)
//   const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes)
//   // console.log(unprocessedCommits)
//   const summaryResponses = await Promise.allSettled(
//   unprocessedCommits.map(commit => {
//     return summariseCommit(githubUrl, commit.commitHash)
//   }))

//   const summaries=summaryResponses.map((response)=>{
//     if(response.status === 'fulfilled'){
//       return response.value as string
//     }
//     return ""
//   })

//    const commits = await db.commit.createMany({
//   data: summaries.map((summary, index) => {
//     console.log(`processing commit ${index}`)
//     return {
//       projectId: projectId,
//       commitHash: unprocessedCommits[index]!.commitHash,
//       commitMessage: unprocessedCommits[index]!.commitMessage,
//       commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
//       commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
//       commitDate: unprocessedCommits[index]!.commitDate,
//       summary: summary,
//        };
//   }),
// });
//   return commits
// }

// async function summariseCommit(githubUrl:string,commitHash:string){
//   // get the diff. then pass the diff into ai
//   const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
//     headers:{
//       Accept:'application/vnd.github.v3.diff'
//     }
//   })
//   return await aiSummariseCommit(data) || ""
// }


// async function fetchProjectGithubUrl(projectId: string) {
//   const project = await db.project.findUnique({
//     where: { id: projectId },
//     select: {
//       githubUrl: true
//     }
//   })

//   if (!project?.githubUrl) {
//     throw new Error("Project has no github url")
//   }

//   return { project, githubUrl: project.githubUrl }
// }

// async function filterUnprocessedCommits(projectId:string,commitHashes:Response[]){
//     const processedCommits=await db.commit.findMany({
//         where:{projectId}
//     })
//     const unprocessedCommits=commitHashes.filter((commit)=>!processedCommits.some((processedCommit)=>processedCommit.commitHash===commit.commitHash))
//     return unprocessedCommits
// }

// // await pollCommits('cmdl33jci0000vevg5m9patnt').then(console.log)