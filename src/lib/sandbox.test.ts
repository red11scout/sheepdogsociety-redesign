import { describe, it, expect } from "vitest";
import { isWriteSql, assertWritable, SandboxWriteError } from "@/lib/sandbox";

describe("isWriteSql — the sandbox write classifier", () => {
  it("flags every DML/DDL write keyword", () => {
    const writes = [
      "INSERT INTO users (id) VALUES ('x')",
      "update users set role = 'admin'",
      "DELETE FROM sessions",
      "MERGE INTO t USING s ON (t.id = s.id)",
      "TRUNCATE letters",
      "drop table messages",
      "ALTER TABLE users ADD COLUMN x text",
      "CREATE TABLE t (id uuid)",
      "GRANT ALL ON t TO r",
      "REVOKE ALL ON t FROM r",
      "COPY t FROM stdin",
      "REFRESH MATERIALIZED VIEW v",
    ];
    for (const sql of writes) {
      expect(isWriteSql(sql), sql).toBe(true);
    }
  });

  it("passes reads, transaction control, and session setup", () => {
    const reads = [
      "SELECT 1",
      "  select * from users",
      "WITH t AS (SELECT 1) SELECT * FROM t",
      "SHOW server_version",
      "EXPLAIN SELECT 1",
      "BEGIN",
      "COMMIT",
      "ROLLBACK",
      "SAVEPOINT s1",
      "SET search_path = public",
      "DISCARD ALL",
      "DEALLOCATE ALL",
    ];
    for (const sql of reads) {
      expect(isWriteSql(sql), sql).toBe(false);
    }
  });

  it("sees through leading BOM, whitespace, and comments", () => {
    expect(isWriteSql("-- a comment\nINSERT INTO t VALUES (1)")).toBe(true);
    expect(isWriteSql("/* block */ delete from t")).toBe(true);
    expect(isWriteSql("\n\t  SELECT now()")).toBe(false);
    expect(isWriteSql("﻿update t set x = 1")).toBe(true);
  });

  it("treats non-string input as non-write (drizzle passes strings)", () => {
    expect(isWriteSql(null)).toBe(false);
    expect(isWriteSql(undefined)).toBe(false);
    expect(isWriteSql(123)).toBe(false);
    expect(isWriteSql({})).toBe(false);
  });
});

describe("assertWritable", () => {
  it("is a no-op outside the sandbox (SANDBOX_READONLY unset in tests)", () => {
    expect(() => assertWritable("test-op")).not.toThrow();
  });

  it("SandboxWriteError carries the operation label", () => {
    const err = new SandboxWriteError("insert into users");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("SandboxWriteError");
    expect(err.message).toContain("insert into users");
  });
});
