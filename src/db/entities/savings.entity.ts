import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Dream } from "./dream.entity";
import { SavingsEntry } from "./savings-entry.entity";

@Entity("savings")
export class Savings {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @OneToOne(() => Dream, (d) => d.savings, { onDelete: "CASCADE" })
  @JoinColumn({ name: "dream_id" })
  dream!: Dream;
  @Column("uuid") dream_id!: string;
  @Column({ type: "bigint", default: 0 }) target_amount!: string;
  @Column({ type: "bigint", default: 0 }) saved_amount!: string;
  @Column({ type: "varchar", default: "PKR" }) currency!: string;
  @UpdateDateColumn() updated_at!: Date;
  @OneToMany(() => SavingsEntry, (e) => e.savings)
  entries?: SavingsEntry[];
}
