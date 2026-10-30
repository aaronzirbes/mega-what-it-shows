<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByProblem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // tickets: problem → link to the ticket filed for it.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const split = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const tags = (t: Record<string, number>) =>
    Object.entries(t)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{split.unique}</strong> reports in #{ticket} ({split.rows} rows in the export; {split.rows - split.unique} came twice) ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>intake tagged as</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports}</strong></td>
        <td class="tags">{tags(g.taggedAs)}</td>
        <td title={g.tenants.join(', ')}>{g.tenants.length}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{tickets[g.problem].replace(/^.*\/issues\//, '#')}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
</style>
