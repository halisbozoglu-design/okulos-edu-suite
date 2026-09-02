import { describe, expect, test } from "bun:test";
const route = await Bun.file("src/routes/schedule.tsx").text();
const preview = await Bun.file("src/components/okulos/ScheduleScenarioGrid.tsx").text();

describe("schedule keyboard and screen-reader contract", () => {
  test("main timetable exposes table semantics and a keyboard-scroll region", () => {
    expect(route).toContain(
      'tabIndex={0} aria-label="Haftalık ders programı tablosu; yatay kaydırılabilir"',
    );
    expect(route).toContain(
      '<caption className="sr-only">Düzenlenebilir haftalık ders programı</caption>',
    );
    expect(route).toContain('scope="col"');
    expect(route).toContain('scope="row"');
  });
  test("filters, repeated controls and icon actions have accessible names", () => {
    for (const label of [
      "Öğretmen filtresi",
      "Sınıf filtresi",
      "Ders ve branş filtresi",
      "Derslik filtresi",
      "Dersi düzenle",
      "Dersi sil",
    ])
      expect(route).toContain(`aria-label="${label}"`);
    expect(route).toContain('aria-label={rowLabel(r)+" dersini seç"}');
    expect(route).toContain('aria-label={r.locked?"Ders kilidini aç":"Dersi kilitle"}');
  });
  test("right-click-only teacher availability has a keyboard button path", () => {
    expect(route).toContain(
      'onClick={()=>void toggleTeacherBlock(day,period)} aria-label={dayName[day]+" "+period+". saat öğretmen uygunluğunu değiştir: "+visual.label}',
    );
  });
  test("async success, failure and loading state are announced", () => {
    expect(route).toContain('role="status" aria-live="polite"');
    expect(route.match(/role="alert"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(preview).toContain("aria-busy={loading}");
    expect(preview).toMatch(/role="status"\s+aria-live="polite"/);
  });
  test("scenario preview preserves caption, header scopes and filter labels", () => {
    expect(preview).toContain('aria-label="Önizleme sınıf filtresi"');
    expect(preview).toContain('aria-label="Önizleme öğretmen filtresi"');
    expect(preview).toMatch(
      /<caption className="sr-only">\s*Filtrelenmiş ders programı senaryo önizlemesi\s*<\/caption>/,
    );
    expect(preview).toContain('scope="row"');
  });
});
