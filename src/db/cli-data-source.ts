/**
 * TypeORM CLI entry point only. The app uses getDataSource() from ./data-source.
 */
import "reflect-metadata";
import { createDataSource } from "./data-source";

export default createDataSource();
