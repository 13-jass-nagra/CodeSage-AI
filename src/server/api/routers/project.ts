import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from '@/lib/github';
import { indexGithubRepo } from '@/lib/github-loader';

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string().url(),
        githubToken: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl,
          name: input.name,
          userToProjects: {
            create: {
              userId: ctx.user.userId!,
            }
          }
        }
      });

   await indexGithubRepo(project.id, input.githubUrl, input.githubToken).catch(err => {
  console.error("Error indexing GitHub repo:", err);
  // Optionally, notify the user via the UI (e.g., a toast message)
});
await pollCommits(project.id).catch(err => {
  console.error("Error polling commits:", err);
  // Optionally, notify the user via the UI
});
      await indexGithubRepo(project.id, input.githubUrl,input.githubToken)
      await pollCommits(project.id);
      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: ctx.user.userId!
          }
        },
        deletedAt: null
      }
    });
  }),

  getCommits: protectedProcedure.input(z.object({
    projectId: z.string()
  })).query(async ({ ctx, input }) => {
    pollCommits(input.projectId).catch(console.error);

    return await ctx.db.commit.findMany({
      where: { projectId: input.projectId }
    });
  }),

  saveAnswer: protectedProcedure.input(z.object({
    projectId: z.string(),
    question: z.string(),
    answer: z.string(),
    filesReferences: z.any()
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.question.create({
      data: {
        answer: input.answer,
        filesReferences: input.filesReferences,
        projectId: input.projectId,
        question: input.question,
        userId: ctx.user.userId!
      },
    });
  }),

  getQuestions: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: { projectId: input.projectId },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });
    }),

  uploadMeeting: protectedProcedure.input(
    z.object({
      projectId: z.string(),
      meetingUrl: z.string(),
      name: z.string()
    })
  ).mutation(async ({ ctx, input }) => {
    return await ctx.db.meeting.create({
      data: {
        meetingUrl: input.meetingUrl,
        projectId: input.projectId,
        name: input.name,
        status: "PROCESSING"
      }
    });
  }),

  getMeetings: protectedProcedure.input(
    z.object({ projectId: z.string() })
  ).query(async ({ ctx, input }) => {
    return await ctx.db.meeting.findMany({
      where: { projectId: input.projectId },
      include: { issues: true }
    });
  }),

  archiveProject: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.project.update({
      where: { id: input.projectId },
      data: { deletedAt: new Date() }
    })
  }),

  getTeamMembers: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .query(async ({ ctx, input }) => {
    return await ctx.db.userToProject.findMany({
      where: { projectId: input.projectId },
      include:{user:true}
    })
  })
});
