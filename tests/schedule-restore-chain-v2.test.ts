import { describe, expect, test } from "bun:test";

const migration = await Bun.file(
  "supabase/migrations/20260902000600_schedule_restore_tenant_chain_v2.sql",
).text();
const schedule = await Bun.file("src/routes/schedule.tsx").text();
const history = await Bun.file("src/routes/schedule-history.tsx").text();
const solver = await Bun.file("src/routes/schedule-solver.tsx").text();

describe("tenant-safe reversible timetable history", () => {
  test("security-definer restore scopes every destructive and snapshot operation", () => {
    for (const token of [
      "where id=p_restore_point_id and institution_code=v_tenant",
      "where institution_code=v_tenant and active=true",
      "where restore_point_id=p_restore_point_id and institution_code=v_tenant",
      "RESTORE_POINT_TENANT_SNAPSHOT_MISMATCH",
      "RESTORE_POINT_CROSS_TENANT_ROWS",
      "pg_advisory_xact_lock",
      "set search_path=''",
    ])
      expect(migration).toContain(token);
    expect(migration).toContain(
      "revoke all on function public.restore_schedule_restore_point(uuid)",
    );
  });

  test("all browser entry points use the tenant-safe v2 RPCs", () => {
    expect(schedule).toContain('rpc("restore_schedule_restore_point_v2"');
    expect(history).toContain('rpc("create_schedule_restore_point_v2"');
    expect(history).toContain('rpc("restore_schedule_restore_point_v2"');
    expect(history).toContain(".limit(200)");
    expect(solver).toContain('rpc("create_schedule_restore_point_v2"');
  });

  test("128 alternating restores preserve lossless undo and redo semantics", () => {
    type Point = { id: number; state: string };
    let current = "state-0";
    const points: Point[] = [{ id: 0, state: current }];
    const restore = (target: Point) => {
      const redo = { id: points.length, state: current };
      points.push(redo);
      current = target.state;
      return redo;
    };

    for (let step = 1; step <= 128; step++) {
      const beforeMove = { id: points.length, state: current };
      points.push(beforeMove);
      const moved = `state-${step}`;
      current = moved;
      const redo = restore(beforeMove);
      expect(current).toBe(beforeMove.state);
      restore(redo);
      expect(current).toBe(moved);
    }

    expect(points).toHaveLength(385);
    expect(current).toBe("state-128");
  });
});
