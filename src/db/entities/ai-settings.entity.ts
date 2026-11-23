import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("ai_settings")
export class AiSettings {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "simple-json", default: `'["openrouter","groq","grok","deepseek"]'` })
  provider_order!: string[];
  /** Null → auto-pick a free model. */
  @Column({ type: "varchar", nullable: true }) selected_model?: string | null;
  /** Provider -> encrypted key (AES-256-GCM, see lib/crypto.ts). */
  @Column({ type: "simple-json", default: "'{}'" }) keys!: Record<string, string>;
  @Column({ type: "varchar", nullable: true }) temperature?: string | null;
}
