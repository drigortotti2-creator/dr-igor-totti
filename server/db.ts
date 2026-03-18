import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

export async function insertLead(lead: { fullName: string; whatsapp: string; city: string; interest?: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { leads } = await import("../drizzle/schema");
  await db.insert(leads).values({
    fullName: lead.fullName,
    whatsapp: lead.whatsapp,
    city: lead.city,
    interest: lead.interest ?? null,
  });
}

export async function getAllLeads(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { leads } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");

  const result = await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function getLeadsCount() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { leads } = await import("../drizzle/schema");
  const { count } = await import("drizzle-orm");

  const result = await db
    .select({ value: count() })
    .from(leads);

  return result[0]?.value ?? 0;
}

export async function searchLeads(query: string, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { leads } = await import("../drizzle/schema");
  const { desc, or, like } = await import("drizzle-orm");

  const result = await db
    .select()
    .from(leads)
    .where(
      or(
        like(leads.fullName, `%${query}%`),
        like(leads.whatsapp, `%${query}%`),
        like(leads.city, `%${query}%`)
      )
    )
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function getLeadsByFilters(filters: {
  city?: string;
  interest?: string;
  startDate?: Date;
  endDate?: Date;
}, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { leads } = await import("../drizzle/schema");
  const { desc, and, eq, gte, lte } = await import("drizzle-orm");

  const conditions: any[] = [];

  if (filters.city) {
    conditions.push(eq(leads.city, filters.city));
  }
  if (filters.interest) {
    conditions.push(eq(leads.interest, filters.interest));
  }
  if (filters.startDate) {
    conditions.push(gte(leads.createdAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(leads.createdAt, filters.endDate));
  }

  const result = await db
    .select()
    .from(leads)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}
