/**
 * Life OS — TypeORM entities (REFERENCE)
 * ---------------------------------------
 * Data layer = TypeORM over Supabase Postgres (connect via DATABASE_URL).
 * Storage (images, report PDFs) = Supabase Storage. Auth = single user.
 *
 * This file is the schema source of truth. The implementing agent copies/adapts
 * it into the app (e.g. src/db/entities/*), wires a DataSource, and generates the
 * initial migration from it — do NOT hand-write SQL migrations.
 *
 * Money: store as integer minor units (e.g. paisa/cents) + a `currency` column.
 * All timestamps are timestamptz. UUID primary keys.
 *
 * Access is server-only through TypeORM (direct Postgres connection), so app-level
 * ownership is enforced in `core/` (single user). If you ALSO expose tables via the
 * Supabase client, add RLS; otherwise TypeORM's direct role bypasses RLS by design.
 */

import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, OneToOne, JoinColumn, Index, Unique,
} from "typeorm";

export type Priority = "low" | "medium" | "high";
export type DreamStatus = "active" | "achieved" | "paused";
export type InputKind = "voice" | "text" | "mcp" | "web";
export type Relevance = "on_track" | "neutral" | "waste";
export type KanbanColumn = "today" | "doing" | "done" | "wasted";
export type ReportKind = "weekly" | "monthly" | "custom";

@Entity("profiles")
export class Profile {
  @PrimaryGeneratedColumn("uuid") id!: string; // = auth user id
  @Column({ nullable: true }) display_name?: string;
  @Column({ type: "bigint", nullable: true }) north_star_amount?: string; // minor units
  @Column({ nullable: true }) north_star_label?: string;
  @Column({ nullable: true }) identity_line?: string;
  @Column({ default: "Make a shit ton of money. Nobody cares about it." }) motto!: string;
  @Column({ default: "UTC" }) timezone!: string;
  @Column({ default: "PKR" }) currency!: string;
  @CreateDateColumn() created_at!: Date;
}

@Entity("dreams")
@Index(["status"])
export class Dream {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column() title!: string;
  @Column({ nullable: true }) cover_image_url?: string;
  @Column({ type: "enum", enum: ["low", "medium", "high"], default: "medium" }) priority!: Priority;
  @Column({ type: "text", nullable: true }) importance_note?: string;
  @Column({ type: "date", nullable: true }) target_date?: string;
  @Column({ type: "bigint", nullable: true }) money_needed?: string; // minor units
  @Column({ type: "int", default: 0 }) progress!: number; // 0..100
  @Column({ type: "enum", enum: ["active", "achieved", "paused"], default: "active" }) status!: DreamStatus;
  @Column({ type: "timestamptz", nullable: true }) last_touched_at?: Date;
  @CreateDateColumn() created_at!: Date;

  @OneToOne(() => DreamEmotion, (e) => e.dream) emotion?: DreamEmotion;
  @OneToMany(() => DreamImage, (i) => i.dream) images?: DreamImage[];
  @OneToMany(() => Milestone, (m) => m.dream) milestones?: Milestone[];
  @OneToOne(() => Savings, (s) => s.dream) savings?: Savings;
}

@Entity("dream_emotions")
export class DreamEmotion {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @OneToOne(() => Dream, (d) => d.emotion, { onDelete: "CASCADE" }) @JoinColumn({ name: "dream_id" }) dream!: Dream;
  @Column("uuid") dream_id!: string;
  @Column({ type: "text", nullable: true }) story?: string;          // why I want it
  @Column({ type: "text", nullable: true }) emotional_reason?: string; // raw letter-to-self
  @Column({ nullable: true }) feeling?: string;
  @Column({ nullable: true }) voice_note_url?: string;
  @Column({ type: "int", default: 1 }) resurface_weight!: number;
}

@Entity("dream_images")
export class DreamImage {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => Dream, (d) => d.images, { onDelete: "CASCADE" }) @JoinColumn({ name: "dream_id" }) dream!: Dream;
  @Column("uuid") dream_id!: string;
  @Column() url!: string;
  @Column({ nullable: true }) caption?: string;
  @Column({ type: "int", default: 0 }) sort!: number;
}

@Entity("milestones")
export class Milestone {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => Dream, (d) => d.milestones, { onDelete: "CASCADE" }) @JoinColumn({ name: "dream_id" }) dream!: Dream;
  @Column("uuid") dream_id!: string;
  @Column() title!: string;
  @Column({ default: false }) done!: boolean;
  @Column({ type: "date", nullable: true }) done_at?: string;
  @Column({ type: "int", default: 0 }) sort!: number;
}

@Entity("savings")
export class Savings {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @OneToOne(() => Dream, (d) => d.savings, { onDelete: "CASCADE" }) @JoinColumn({ name: "dream_id" }) dream!: Dream;
  @Column("uuid") dream_id!: string;
  @Column({ type: "bigint", default: 0 }) target_amount!: string; // minor units
  @Column({ type: "bigint", default: 0 }) saved_amount!: string;  // minor units
  @Column({ default: "PKR" }) currency!: string;
  @UpdateDateColumn() updated_at!: Date;
  @OneToMany(() => SavingsEntry, (e) => e.savings) entries?: SavingsEntry[];
}

@Entity("savings_entries")
export class SavingsEntry {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => Savings, (s) => s.entries, { onDelete: "CASCADE" }) @JoinColumn({ name: "savings_id" }) savings!: Savings;
  @Column("uuid") savings_id!: string;
  @Column({ type: "bigint" }) amount!: string; // minor units (can be negative)
  @Column({ type: "text", nullable: true }) note?: string;
  @CreateDateColumn() created_at!: Date;
}

@Entity("daily_logs")
@Unique(["user_id", "log_date"])
export class DailyLog {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "date" }) log_date!: string;
  @Column({ type: "text", nullable: true }) raw_input?: string;
  @Column({ type: "enum", enum: ["voice", "text", "mcp", "web"], nullable: true }) input_kind?: InputKind;
  @Column({ type: "int", default: 0 }) score!: number; // 0..100
  @Column({ type: "jsonb", default: () => "'[]'" }) summary_bullets!: string[];
  @Column({ type: "text", nullable: true }) trajectory_note?: string;
  // re-ask state machine (see docs/04)
  @Column({ type: "timestamptz", nullable: true }) asked_at?: Date;
  @Column({ type: "timestamptz", nullable: true }) last_ping_at?: Date;
  @Column({ default: false }) answered!: boolean;
  @CreateDateColumn() created_at!: Date;

  @OneToMany(() => Activity, (a) => a.daily_log) activities?: Activity[];
  @OneToOne(() => Reflection, (r) => r.daily_log) reflection?: Reflection;
}

@Entity("activities")
export class Activity {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => DailyLog, (l) => l.activities, { onDelete: "CASCADE" }) @JoinColumn({ name: "daily_log_id" }) daily_log!: DailyLog;
  @Column("uuid") daily_log_id!: string;
  @Column("uuid", { nullable: true }) dream_id?: string; // nullable: waste serves nothing
  @Column({ type: "text" }) text!: string;
  @Column({ type: "enum", enum: ["on_track", "neutral", "waste"], default: "neutral" }) relevance!: Relevance;
  @Column({ type: "int", default: 0 }) score_delta!: number;
  @Column({ type: "numeric", precision: 6, scale: 2, default: 0 }) time_cost_days!: string; // days added for waste
  @Column({ type: "text", nullable: true }) suggestion?: string;
  @Column({ type: "enum", enum: ["today", "doing", "done", "wasted"], default: "done" }) column!: KanbanColumn;
  @CreateDateColumn() created_at!: Date;
}

@Entity("reflections")
export class Reflection {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @OneToOne(() => DailyLog, (l) => l.reflection, { onDelete: "CASCADE" }) @JoinColumn({ name: "daily_log_id" }) daily_log!: DailyLog;
  @Column("uuid") daily_log_id!: string;
  @Column({ type: "text", nullable: true }) accomplished?: string;
  @Column({ type: "text", nullable: true }) wasted?: string;
  @Column({ type: "text", nullable: true }) improve?: string;
}

@Entity("reports")
export class Report {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "enum", enum: ["weekly", "monthly", "custom"] }) kind!: ReportKind;
  @Column({ type: "date" }) range_start!: string;
  @Column({ type: "date" }) range_end!: string;
  @Column({ type: "text" }) content_md!: string;
  @Column({ nullable: true }) pdf_url?: string;
  @Column({ type: "timestamptz", nullable: true }) emailed_at?: Date;
  @CreateDateColumn() created_at!: Date;
}

@Entity("scores_daily")
@Unique(["user_id", "day"])
export class ScoreDaily {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "date" }) day!: string;
  @Column({ type: "int", default: 0 }) score!: number;
  @Column({ type: "int", default: 0 }) points!: number;
}

@Entity("ai_settings")
export class AiSettings {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "jsonb", default: () => `'["openrouter","groq","grok","deepseek"]'` }) provider_order!: string[];
  @Column({ nullable: true }) selected_model?: string; // null => auto free model
  @Column({ type: "jsonb", default: () => "'{}'" }) keys!: Record<string, string>; // ENCRYPTED at rest
}

@Entity("notification_prefs")
export class NotificationPrefs {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "time", default: "00:00" }) daily_ask_time!: string;
  @Column({ type: "int", default: 6 }) reask_gap_hours!: number;
  @Column({ type: "time", default: "00:00" }) quiet_start!: string;
  @Column({ type: "time", default: "06:00" }) quiet_end!: string;
  @Column({ type: "jsonb", default: () => `'{"telegram":true,"web":true,"email":false}'` }) channels!: Record<string, boolean>;
}

@Entity("telegram_links")
export class TelegramLink {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column() chat_id!: string;
  @CreateDateColumn() linked_at!: Date;
}
