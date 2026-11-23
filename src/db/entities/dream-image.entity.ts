import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Dream } from "./dream.entity";

@Entity("dream_images")
export class DreamImage {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => Dream, (d) => d.images, { onDelete: "CASCADE" })
  @JoinColumn({ name: "dream_id" })
  dream!: Dream;
  @Column("uuid") dream_id!: string;
  @Column({ type: "varchar" }) url!: string;
  @Column({ type: "varchar", nullable: true }) caption?: string | null;
  @Column({ type: "int", default: 0 }) sort!: number;
}
