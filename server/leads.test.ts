import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock insertLead
vi.mock("./db", () => ({
  insertLead: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

// Mock notifyOwner
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("leads.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success and a WhatsApp URL on valid input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.submit({
      fullName: "Maria Silva",
      whatsapp: "11999999999",
      city: "São Paulo",
      interest: "Facetas de Resina Composta",
    });

    expect(result.success).toBe(true);
    expect(result.whatsappUrl).toContain("wa.me");
    expect(result.whatsappUrl).toContain("Maria%20Silva");
  });

  it("should return a WhatsApp URL without interest when not provided", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.submit({
      fullName: "João Costa",
      whatsapp: "11988888888",
      city: "Campinas",
    });

    expect(result.success).toBe(true);
    expect(result.whatsappUrl).toContain("wa.me");
    expect(result.whatsappUrl).toContain("Jo%C3%A3o%20Costa");
  });

  it("should throw validation error for too-short name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.submit({
        fullName: "A",
        whatsapp: "11999999999",
        city: "São Paulo",
      })
    ).rejects.toThrow();
  });

  it("should throw validation error for too-short whatsapp", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.submit({
        fullName: "Ana Lima",
        whatsapp: "123",
        city: "Rio",
      })
    ).rejects.toThrow();
  });

  it("should call insertLead with correct data", async () => {
    const { insertLead } = await import("./db");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.leads.submit({
      fullName: "Carlos Mendes",
      whatsapp: "11977777777",
      city: "Santos",
      interest: "Design do Sorriso",
    });

    expect(insertLead).toHaveBeenCalledWith({
      fullName: "Carlos Mendes",
      whatsapp: "11977777777",
      city: "Santos",
      interest: "Design do Sorriso",
    });
  });

  it("should call notifyOwner after successful lead insertion", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.leads.submit({
      fullName: "Fernanda Rocha",
      whatsapp: "11966666666",
      city: "Guarulhos",
    });

    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("Novo Lead"),
        content: expect.stringContaining("Fernanda Rocha"),
      })
    );
  });
});
