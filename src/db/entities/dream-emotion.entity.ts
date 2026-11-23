import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Dream } from "./dream.entity";

/** The emotional anchor — first-class, not a note. */
@Entity("dream_emotions")
export class DreamEmotion {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @OneToOne(() => Dream, (d) => d.emotion, { onDelete: "CASCADE" })
  @JoinColumn({ name: "dream_id" })
  dream!: Dream;
  @Column("uuid") dream_id!: string;
  /** Why I want it. */
  @Column({ type: "text", nullable: true }) story?: string | null;
  /** Raw letter to myself — resurfaced on purpose. */
  @Column({ type: "text", nullable: true }) emotional_reason?: string | null;
  @Column({ type: "varchar", nullable: true }) feeling?: string | null;
  @Column({ type: "varchar", nullable: true }) voice_note_url?: string | null;
  @Column({ type: "int", default: 1 }) resurface_weight!: number;
}
