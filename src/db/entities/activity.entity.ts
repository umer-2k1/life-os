import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DailyLog } from "./daily-log.entity";

export type Relevance = "on_track" | "neutral" | "waste";
export type KanbanColumn = "today" | "doing" | "done" | "wasted";

@Entity("activities")
export class Activity {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => DailyLog, (l) => l.activities, { onDelete: "CASCADE" })
  @JoinColumn({ name: "daily_log_id" })
  daily_log!: DailyLog;
  @Column("uuid") daily_log_id!: string;
  /** Nullable: waste serves nothing. */
  @Column({ type: "uuid", nullable: true }) dream_id?: string | null;
  @Column({ type: "varchar" }) text!: string;
  @Column({ type: "simple-enum", enum: ["on_track", "neutral", "waste"], default: "neutral" })
  relevance!: Relevance;
  @Column({ type: "int", default: 0 }) score_delta!: number;
  /** Motivational estimate: days added to a dream's timeline. */
  @Column({ type: "float", default: 0 }) time_cost_days!: number;
  @Column({ type: "text", nullable: true }) suggestion?: string | null;
  @Column({
    type: "simple-enum",
    enum: ["today", "doing", "done", "wasted"],
    default: "done",
    name: "kanban_column",
  })
  column!: KanbanColumn;
  @Column({ type: "boolean", default: false }) priority!: boolean;
  @Column({ type: "date", nullable: true }) activity_date?: string | null;
  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
}
