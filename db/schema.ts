import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  mediumtext,
  timestamp,
  // bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Trabajos de generación de planes (startPlanJob/planJob). En BD y no en
// memoria porque la plataforma es serverless: cada petición puede caer en
// una instancia distinta y solo MySQL es estado compartido entre ellas.
export const planJobs = mysqlTable("plan_jobs", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  status: mysqlEnum("status", ["running", "done", "error"]).notNull().default("running"),
  stage: varchar("stage", { length: 40 }), // fase visible para la UI: researching | writing | done
  plan: mediumtext("plan"), // JSON del plan cuando status=done (hasta 16MB)
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlanJobRow = typeof planJobs.$inferSelect;

// TODO: Add your tables here. See docs/Database.md for schema examples and patterns.
//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").defaultNow(),
// });
//
// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
