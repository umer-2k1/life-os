import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export type ReportKind = "weekly" | "monthly" | "custom";

@Entity("reports")
export class Report {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "simple-enum", enum: ["weekly", "monthly", "custom"] })
  kind!: ReportKind;
  @Column({ type: "date" }) range_start!: string;
  @Column({ type: "date" }) range_end!: string;
  @Column({ type: "text" }) content_md!: string;
  @Column({ type: "simple-json", nullable: true }) content_json?: unknown;
  @Column({ type: "varchar", nullable: true }) pdf_url?: string | null;
  @Column({ type: "timestamptz", nullable: true }) emailed_at?: Date | null;
  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
}
