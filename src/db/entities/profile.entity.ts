import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity("profiles")
export class Profile {
  /** Equals the single owner's id. */
  @PrimaryColumn("uuid") id!: string;
  @Column({ type: "varchar", nullable: true }) display_name?: string | null;
  /** Minor units (paisa/cents). */
  @Column({ type: "bigint", nullable: true }) north_star_amount?: string | null;
  @Column({ type: "varchar", nullable: true }) north_star_label?: string | null;
  @Column({ type: "varchar", nullable: true }) identity_line?: string | null;
  @Column({ type: "varchar", default: "Make a shit ton of money. Nobody cares about it." })
  motto!: string;
  @Column({ type: "varchar", default: "Asia/Karachi" }) timezone!: string;
  @Column({ type: "varchar", default: "PKR" }) currency!: string;
  /** scrypt hash for the 6-digit PIN. Null only before bootstrap. */
  @Column({ type: "varchar", nullable: true }) pin_hash?: string | null;
  @CreateDateColumn() created_at!: Date;
}
