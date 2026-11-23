import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Dream } from "./dream.entity";

@Entity("milestones")
export class Milestone {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => Dream, (d) => d.milestones, { onDelete: "CASCADE" })
  @JoinColumn({ name: "dream_id" })
  dream!: Dream;
  @Column("uuid") dream_id!: string;
  @Column({ type: "varchar" }) title!: string;
  @Column({ type: "boolean", default: false }) done!: boolean;
  @Column({ type: "date", nullable: true }) done_at?: string | null;
  @Column({ type: "int", default: 0 }) sort!: number;
}
