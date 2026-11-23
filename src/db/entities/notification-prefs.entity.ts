import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("notification_prefs")
export class NotificationPrefs {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  /** "HH:MM" in the owner's timezone. */
  @Column({ type: "varchar", default: "00:00" }) daily_ask_time!: string;
  @Column({ type: "int", default: 6 }) reask_gap_hours!: number;
  @Column({ type: "varchar", default: "00:00" }) quiet_start!: string;
  @Column({ type: "varchar", default: "06:00" }) quiet_end!: string;
  @Column({
    type: "simple-json",
    default: `'{"telegram":true,"web":true,"email":false}'`,
  })
  channels!: Record<string, boolean>;
  @Column({ type: "boolean", default: true }) push_enabled!: boolean;
}
