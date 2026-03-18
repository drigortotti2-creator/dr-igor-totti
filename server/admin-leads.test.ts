import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TRPCError } from "@trpc/server";

// Mock database functions
vi.mock("./db", () => ({
  insertLead: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getAllLeads: vi.fn().mockResolvedValue([
    {
      id: 1,
      fullName: "Maria Silva",
      whatsapp: "11999999999",
      city: "São Paulo",
      interest: "Facetas de Resina Composta",
      createdAt: new Date("2026-03-18"),
    },
    {
      id: 2,
      fullName: "João Costa",
      whatsapp: "11988888888",
      city: "Campinas",
      interest: null,
      createdAt: new Date("2026-03-17"),
    },
  ]),
  getLeadsCount: vi.fn().mockResolvedValue(2),
  searchLeads: vi.fn().mockResolvedValue([
    {
      id: 1,
      fullName: "Maria Silva",
      whatsapp: "11999999999",
      city: "São Paulo",
      interest: "Facetas de Resina Composta",
      createdAt: new Date("2026-03-18"),
    },
  ]),
  getLeadsByFilters: vi.fn().mockResolvedValue([
    {
      id: 1,
      fullName: "Maria Silva",
      whatsapp: "11999999999",
      city: "São Paulo",
      interest: "Facetas de Resina Composta",
      createdAt: new Date("2026-03-18"),
    },
  ]),
}));

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("leads.list (admin only)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated leads for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.list({ page: 1, limit: 20 });

    expect(result.leads).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.pages).toBe(1);
  });

  it("should throw FORBIDDEN error for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.list({ page: 1, limit: 20 })).rejects.toThrow(
      expect.objectContaining({
        code: "FORBIDDEN",
      })
    );
  });

  it("should throw UNAUTHORIZED error for unauthenticated users", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.list({ page: 1, limit: 20 })).rejects.toThrow();
  });
});

describe("leads.search (admin only)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should search leads by query for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.search({ query: "Maria", page: 1, limit: 20 });

    expect(result.leads).toHaveLength(1);
    expect(result.leads[0]?.fullName).toBe("Maria Silva");
    expect(result.query).toBe("Maria");
  });

  it("should throw FORBIDDEN error for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.search({ query: "test", page: 1, limit: 20 })).rejects.toThrow(
      expect.objectContaining({
        code: "FORBIDDEN",
      })
    );
  });
});

describe("leads.filter (admin only)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should filter leads by city for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.filter({
      city: "São Paulo",
      page: 1,
      limit: 20,
    });

    expect(result.leads).toHaveLength(1);
    expect(result.leads[0]?.city).toBe("São Paulo");
  });

  it("should throw FORBIDDEN error for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.filter({
        city: "São Paulo",
        page: 1,
        limit: 20,
      })
    ).rejects.toThrow(expect.objectContaining({ code: "FORBIDDEN" }));
  });
});

describe("leads.export (admin only)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export leads as CSV for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.export({
      format: "csv",
    });

    expect(result.data).toContain("Nome Completo");
    expect(result.data).toContain("Maria Silva");
    expect(result.filename).toContain(".csv");
  });

  it("should export leads as JSON for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.export({
      format: "json",
    });

    expect(result.data).toContain("Maria Silva");
    expect(result.filename).toContain(".json");
  });

  it("should throw FORBIDDEN error for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.export({ format: "csv" })).rejects.toThrow(
      expect.objectContaining({
        code: "FORBIDDEN",
      })
    );
  });
});
