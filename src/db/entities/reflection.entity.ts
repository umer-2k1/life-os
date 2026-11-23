import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DailyLog } from "./daily-log.entity";

@Entity("reflections")
export class Reflection {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @OneToOne(() => DailyLog, (l) => l.reflection, { onDelete: "CASCADE" })
  @JoinColumn({ name: "daily_log_id" })
  daily_log!: DailyLog;
  @Column("uuid") daily_log_id!: string;
  @Column({ type: "text", nullable: true }) accomplished?: string | null;
  @Column({ type: "text", nullable: true }) wasted?: string | null;
  @Column({ type: "text", nullable: true }) improve?: string | null;
}
