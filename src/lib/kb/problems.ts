// The problems #4471 holds, one per bug that needs its own fix. Pages explain it; this file is what runs.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

// `parser` and `hint` come from the tenant and the way in (causes.ts). `shift` is a date that moved
// by one day, not a flipped month: no month/day swap explains it, so the parser fix will not close it.
// The desk found these by reading the reports (desk-notes.json, `oneDayMove`).
export type Problem = 'parser' | 'hint' | 'shift';

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | 'unplaced' {
  if (oneDayMove.includes(r.id)) return 'shift';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: number;
  // What intake tagged these reports as: tag → count.
  taggedAs: Record<string, number>;
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: number; unique: number; groups: ProblemGroup[] } {
  const merged = all.filter((r) => r.mergedInto === ticket);
  const unique = uniqueById(merged);
  const byProblem = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of unique) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  const groups = [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs.length,
        taggedAs: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {}),
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports - a.reports);
  return { rows: merged.length, unique: unique.length, groups };
}
