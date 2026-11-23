import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DreamEmotion } from "./dream-emotion.entity";
import { DreamImage } from "./dream-image.entity";
import { Milestone } from "./milestone.entity";
import { Savings } from "./savings.entity";

export type Priority = "low" | "medium" | "high";
export type DreamStatus = "active" | "achieved" | "paused";

@Entity("dreams")
@Index(["status"])
export class Dream {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "varchar" }) title!: string;
  @Column({ type: "varchar", nullable: true }) cover_image_url?: string | null;
  @Column({ type: "varchar", nullable: true }) glyph?: string | null;
  @Column({ type: "varchar", nullable: true }) accent?: string | null;
  @Column({ type: "simple-enum", enum: ["low", "medium", "high"], default: "medium" })
  priority!: Priority;
  @Column({ type: "text", nullable: true }) importance_note?: string | null;
  @Column({ type: "date", nullable: true }) target_date?: string | null;
  @Column({ type: "bigint", nullable: true }) money_needed?: string | null;
  @Column({ type: "int", default: 0 }) progress!: number;
  @Column({ type: "simple-enum", enum: ["active", "achieved", "paused"], default: "active" })
  status!: DreamStatus;
  @Column({ type: "timestamptz", nullable: true }) last_touched_at?: Date | null;
  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;

  @OneToOne(() => DreamEmotion, (e) => e.dream, { cascade: false })
  emotion?: DreamEmotion;
  @OneToMany(() => DreamImage, (i) => i.dream)
  images?: DreamImage[];
  @OneToMany(() => Milestone, (m) => m.dream)
  milestones?: Milestone[];
  @OneToOne(() => Savings, (s) => s.dream)
  savings?: Savings;
}
