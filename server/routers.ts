import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { insertLead } from "./db";
import { z } from "zod";

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
  }),
});

export type AppRouter = typeof appRouter;
