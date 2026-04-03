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

const TIER_META: Record<string, string> = {
  '0': 'CORE LIBRARY + CROSS-PLATFORM',
  '1': 'PROCESS LAYER',
  '2': 'RENDERING FOUNDATION',
  '3': 'INTERACTION',
  '4': 'CHROME',
  '4M': 'MULTIPLEXING FOUNDATION',
  '5': 'HARDENING',
  '6': 'POLISH',
  '7': 'ADVANCED',
  '7A': 'SERVER + PERSISTENCE + REMOTE',
};

const TIER_ORDER = ['0', '1', '2', '3', '4', '4M', '5', '6', '7', '7A'];

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

function loadRoadmapSections(dir: string): (Section & { tier: string })[] {
  const files = readdirSync(dir)
    .filter(f => f.startsWith('section-') && f.endsWith('.md'))
    .sort();

  const sections: (Section & { tier: string })[] = [];
  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');
    const fm = parseFrontmatter(content, file);
    const tier = String(fm.tier);

    if (!TIER_ORDER.includes(tier)) {
      throw new Error(`Section "${fm.title}" in ${file} references unknown tier "${tier}". Add it to TIER_ORDER and TIER_META in roadmap-data.ts.`);
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
  const sections = loadRoadmapSections(roadmapDir);

  const tierMap = new Map<string, Section[]>();
  for (const s of sections) {
    if (!tierMap.has(s.tier)) tierMap.set(s.tier, []);
    tierMap.get(s.tier)!.push({ num: s.num, name: s.name, status: s.status, goal: s.goal });
  }

  return TIER_ORDER
    .filter(id => tierMap.has(id))
    .map(id => ({
      id,
      name: TIER_META[id] ?? `TIER ${id}`,
      sections: tierMap.get(id)!,
    }));
}
