import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("telegram_links")
export class TelegramLink {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "varchar", unique: true }) chat_id!: string;
  @Column({ type: "varchar", nullable: true }) username?: string | null;
  @CreateDateColumn({ type: "timestamptz" }) linked_at!: Date;
}
