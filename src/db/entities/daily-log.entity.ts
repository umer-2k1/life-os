import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Activity } from "./activity.entity";
import { Reflection } from "./reflection.entity";

export type InputKind = "voice" | "text" | "mcp" | "web" | "telegram";

@Entity("daily_logs")
@Unique(["user_id", "log_date"])
export class DailyLog {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "date" }) log_date!: string;
  @Column({ type: "text", nullable: true }) raw_input?: string | null;
  @Column({
    type: "simple-enum",
    enum: ["voice", "text", "mcp", "web", "telegram"],
    nullable: true,
  })
  input_kind?: InputKind | null;
  @Column({ type: "int", default: 0 }) score!: number;
  @Column({ type: "simple-json" }) summary_bullets!: string[];
  @Column({ type: "text", nullable: true }) trajectory_note?: string | null;
  @Column({ type: "text", nullable: true }) next_action?: string | null;
  // re-ask state machine
  @Column({ type: "timestamptz", nullable: true }) asked_at?: Date | null;
  @Column({ type: "timestamptz", nullable: true }) last_ping_at?: Date | null;
  @Column({ type: "boolean", default: false }) answered!: boolean;
  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;

  @OneToMany(() => Activity, (a) => a.daily_log)
  activities?: Activity[];
  @OneToOne(() => Reflection, (r) => r.daily_log)
  reflection?: Reflection;
}
