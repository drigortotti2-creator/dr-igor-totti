import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { insertLead, getAllLeads, getLeadsCount, searchLeads, getLeadsByFilters } from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  leads: router({
    submit: publicProcedure
      .input(
        z.object({
          fullName: z.string().min(2, "Nome muito curto"),
          whatsapp: z.string().min(8, "WhatsApp inválido"),
          city: z.string().min(2, "Cidade inválida"),
          interest: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await insertLead(input);

        // Notify owner about new lead
        const interestText = input.interest ? `\nInteresse: ${input.interest}` : "";
        await notifyOwner({
          title: "🦷 Novo Lead Capturado!",
          content: `Um novo paciente em potencial preencheu o formulário:\n\nNome: ${input.fullName}\nWhatsApp: ${input.whatsapp}\nCidade: ${input.city}${interestText}`,
        });

        const WHATSAPP_NUMBER = "5511999999999";
        const msg = `Olá, Dr. Igor! Me chamo ${input.fullName} e gostaria de agendar uma consulta para saber mais sobre as Facetas de Resina Composta.`;
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

        return { success: true, whatsappUrl };
      }),

    // Admin procedures (protected)
    list: protectedProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        const offset = (input.page - 1) * input.limit;
        const [leads, total] = await Promise.all([
          getAllLeads(input.limit, offset),
          getLeadsCount(),
        ]);
        return {
          leads,
          total,
          page: input.page,
          limit: input.limit,
          pages: Math.ceil(total / input.limit),
        };
      }),

    search: protectedProcedure
      .input(
        z.object({
          query: z.string().min(1),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        const offset = (input.page - 1) * input.limit;
        const leads = await searchLeads(input.query, input.limit, offset);
        return { leads, query: input.query };
      }),

    filter: protectedProcedure
      .input(
        z.object({
          city: z.string().optional(),
          interest: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        const offset = (input.page - 1) * input.limit;
        const leads = await getLeadsByFilters(
          {
            city: input.city,
            interest: input.interest,
            startDate: input.startDate,
            endDate: input.endDate,
          },
          input.limit,
          offset
        );
        return { leads, page: input.page, limit: input.limit };
      }),

    export: protectedProcedure
      .input(
        z.object({
          format: z.enum(["csv", "json"]).default("csv"),
          city: z.string().optional(),
          interest: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        const leads = await getLeadsByFilters(
          {
            city: input.city,
            interest: input.interest,
            startDate: input.startDate,
            endDate: input.endDate,
          },
          10000,
          0
        );

        if (input.format === "csv") {
          const headers = ["ID", "Nome Completo", "WhatsApp", "Cidade", "Interesse", "Data"];
          const rows = leads.map((lead) => [
            lead.id,
            lead.fullName,
            lead.whatsapp,
            lead.city,
            lead.interest || "-",
            new Date(lead.createdAt).toLocaleDateString("pt-BR"),
          ]);
          const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");
          return { data: csv, filename: `leads_${new Date().toISOString().split("T")[0]}.csv` };
        } else {
          return {
            data: JSON.stringify(leads, null, 2),
            filename: `leads_${new Date().toISOString().split("T")[0]}.json`,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
