import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    pgEnum,
    integer,
} from "drizzle-orm/pg-core";
import { is, relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["employee", "manager", "admin"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "assigned", "declined", "completed"]);
export const taskTagEnum = pgEnum("task_tag", ["bug", "feature", "support"]); // Add more as needed
export const taskActionEnum = pgEnum("task_action", ["created", "assigned", "declined", "accepted", "completed"]);

// Tables
export const UserTable = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull(),
    isApproved: integer("is_approved").notNull().default(0), // 0: pending, 1: approved, 2: declined
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const TaskTable = pgTable("tasks", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    tag: taskTagEnum("tag").notNull(),
    status: taskStatusEnum("status").notNull().default("pending"),
    createdById: integer("created_by_id").references(() => UserTable.id).notNull(),
    assignedToId: integer("assigned_to_id").references(() => UserTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const TaskLogTable = pgTable("task_logs", {
    id: serial("id").primaryKey(),
    taskId: integer("task_id").references(() => TaskTable.id).notNull(),
    action: taskActionEnum("action").notNull(),
    performedById: integer("performed_by_id").references(() => UserTable.id).notNull(),
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
