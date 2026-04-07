import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { load as yamlLoad } from 'js-yaml';

export type Status = 'complete' | 'in-progress' | 'not-started' | 'superseded' | 'partial';

export interface Section {
  num: string;
  name: string;
  status: Status;
  goal: string;
}

export interface Tier {
  id: string;
  name: string;
  sections: Section[];
}

interface SectionFrontmatter {
  section: number | string;
  title: string;
  status: string;
  tier: number | string;
  goal: string;
}

/**
 * Parse tier metadata from `00-overview.md`'s `### Tier <id> — <name>` headers.
 *
 * The roadmap overview is the canonical source of truth for tier ordering and
 * naming. The order is the order of appearance in the file. Names are
 * uppercased and any parenthetical notes (e.g., "(NEW)") are stripped.
 *
 * Adding a new tier means adding a new `### Tier N — Name` section to
 * `plans/roadmap/00-overview.md` — no website changes required.
 */
function loadTierMeta(roadmapDir: string): { order: string[]; meta: Record<string, string> } {
  const overviewPath = join(roadmapDir, '00-overview.md');
  const content = readFileSync(overviewPath, 'utf-8');

  const order: string[] = [];
  const meta: Record<string, string> = {};
  // Match `### Tier <id> — <name>` (em-dash). The id may be alphanumeric
  // (e.g., 4M, 7A). The name runs to end of line.
  const re = /^###\s+Tier\s+([0-9A-Za-z]+)\s+—\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const id = m[1];
    // Strip trailing parenthetical notes like "(NEW)" and uppercase.
    const name = m[2].replace(/\s*\([^)]*\)\s*$/, '').trim().toUpperCase();
    if (!(id in meta)) {
      order.push(id);
      meta[id] = name;
    }
  }

  if (order.length === 0) {
    throw new Error(
      `No "### Tier <id> — <name>" headers found in ${overviewPath}. ` +
      `The roadmap overview must declare all tiers as section headers.`
    );
  }

  return { order, meta };
}

function normalizeStatus(raw: string): Status {
  const s = raw.toLowerCase().replace(/_/g, '-');
  if (s === 'complete') return 'complete';
  if (s === 'in-progress') return 'in-progress';
  if (s === 'not-started') return 'not-started';
  if (s === 'superseded') return 'superseded';
  if (s === 'partially-started' || s === 'partial') return 'partial';
  return 'not-started';
}

function parseFrontmatter(content: string, file: string): SectionFrontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`No YAML frontmatter found in ${file}`);
  }
  try {
    const fm = yamlLoad(match[1]) as SectionFrontmatter;
    if (!fm || !fm.title || fm.section == null || !fm.status || fm.tier == null || !fm.goal) {
      throw new Error(`Incomplete frontmatter in ${file}: missing required fields (section, title, status, tier, goal)`);
    }
    return fm;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Incomplete frontmatter')) throw e;
    throw new Error(`Failed to parse YAML frontmatter in ${file}: ${e}`);
  }
}

function formatSectionNum(section: number | string): string {
  if (typeof section === 'number' && section < 10) {
    return String(section).padStart(2, '0');
  }
  return String(section);
}

function loadRoadmapSections(
  dir: string,
  tierOrder: string[],
): (Section & { tier: string })[] {
  const files = readdirSync(dir)
    .filter(f => f.startsWith('section-') && f.endsWith('.md'))
    .sort();

  const sections: (Section & { tier: string })[] = [];
  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');
    const fm = parseFrontmatter(content, file);
    const tier = String(fm.tier);

    if (!tierOrder.includes(tier)) {
      throw new Error(
        `Section "${fm.title}" in ${file} references tier "${tier}", but no ` +
        `"### Tier ${tier} — <name>" header exists in 00-overview.md. ` +
        `Add the tier section to the roadmap overview.`
      );
    }

    sections.push({
      num: formatSectionNum(fm.section),
      name: fm.title,
      status: normalizeStatus(fm.status),
      goal: fm.goal,
      tier,
    });
  }
  return sections;
}

export function loadRoadmapTiers(dir?: string): Tier[] {
  const roadmapDir = dir ?? resolve(process.cwd(), '..', 'ori_term', 'plans', 'roadmap');
  const { order: tierOrder, meta: tierMeta } = loadTierMeta(roadmapDir);
  const sections = loadRoadmapSections(roadmapDir, tierOrder);

  const tierMap = new Map<string, Section[]>();
  for (const s of sections) {
    if (!tierMap.has(s.tier)) tierMap.set(s.tier, []);
    tierMap.get(s.tier)!.push({ num: s.num, name: s.name, status: s.status, goal: s.goal });
  }

  return tierOrder
    .filter(id => tierMap.has(id))
    .map(id => ({
      id,
      name: tierMeta[id] ?? `TIER ${id}`,
      sections: tierMap.get(id)!,
    }));
}
