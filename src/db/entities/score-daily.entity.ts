import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("scores_daily")
@Unique(["user_id", "day"])
export class ScoreDaily {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column("uuid") user_id!: string;
  @Column({ type: "date" }) day!: string;
  @Column({ type: "int", default: 0 }) score!: number;
  @Column({ type: "int", default: 0 }) points!: number;
}
