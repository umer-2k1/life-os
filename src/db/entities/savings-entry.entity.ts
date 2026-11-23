import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Savings } from "./savings.entity";

@Entity("savings_entries")
export class SavingsEntry {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => Savings, (s) => s.entries, { onDelete: "CASCADE" })
  @JoinColumn({ name: "savings_id" })
  savings!: Savings;
  @Column("uuid") savings_id!: string;
  /** Minor units; can be negative. */
  @Column({ type: "bigint" }) amount!: string;
  @Column({ type: "text", nullable: true }) note?: string | null;
  @CreateDateColumn() created_at!: Date;
}
