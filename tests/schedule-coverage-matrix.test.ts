import { expect, test } from "bun:test";

const manifest = await Bun.file("benchmarks/schedule-coverage/manifest.json").json() as {
  school_types: Array<{ id: string; status: string; evidence: string[] }>;
  hard_families: Array<{ id: string; status: string; evidence: string[] }>;
};

test("coverage matrix is explicit and only marks evidenced rows direct", async () => {
  const rows = [...manifest.school_types, ...manifest.hard_families];
  expect(rows.length).toBeGreaterThanOrEqual(15);
  expect(rows.filter((x) => x.status === "DIRECT").every((x) => x.evidence.length > 0)).toBe(true);
  expect(rows.filter((x) => x.status === "GAP").length).toBeGreaterThan(0);
  expect(manifest.school_types.find((x) => x.id === "MTAL")?.status).toBe("DIRECT");
  expect(manifest.school_types.find((x) => x.id === "MESEM")?.status).toBe("DIRECT");
  expect(manifest.school_types.find((x) => x.id === "IMAM_HATIP")?.status).toBe("DIRECT");
  expect(manifest.school_types.find((x) => x.id === "PRIMARY_MIDDLE")?.status).toBe("DIRECT");
  expect(manifest.school_types.find((x) => x.id === "SPECIAL_EDUCATION")?.status).toBe("GAP");
  expect(manifest.hard_families.find((x) => x.id === "SECTIONING_JOINT_OPTIMIZATION")?.status).toBe("GAP");
  for (const path of rows.flatMap((x) => x.evidence))
    expect(await Bun.file(path).exists(), `${path} must exist`).toBe(true);
});
