import { Project, ProjectStatus, ProjectTimelineEntry } from '../store/types';
import { parseCSV } from './csv';

function norm(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findCol(headers: string[], ...candidates: string[]) {
  const normed = headers.map(norm);
  for (const c of candidates) {
    const idx = normed.indexOf(norm(c));
    if (idx !== -1) return idx;
  }
  return -1;
}

function mapStatus(raw: string): ProjectStatus {
  const s = raw.trim().toLowerCase();
  if (s.includes('progress')) return 'On track';
  if (s.includes('hold')) return 'At risk';
  if (s.includes('cancel')) return 'Cancelled';
  if (s.includes('not started')) return 'Opportunity';
  return 'Opportunity';
}

/** Pulls out "DD/MM: note text" entries from a free-text update log, using `year` for all of them. */
function extractDatedNotes(text: string, year: number, label: string): ProjectTimelineEntry[] {
  if (!text || !text.trim()) return [];
  const markerRe = /(?:^|\n)\s*(\d{1,2})\/(\d{1,2})\s*:\s*/g;
  const markers: { rawStart: number; contentStart: number; day: number; month: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = markerRe.exec(text))) {
    markers.push({ rawStart: m.index, contentStart: m.index + m[0].length, day: parseInt(m[1], 10), month: parseInt(m[2], 10) });
  }
  if (markers.length === 0) return [];

  const entries: ProjectTimelineEntry[] = [];
  markers.forEach((marker, i) => {
    if (marker.month < 1 || marker.month > 12 || marker.day < 1 || marker.day > 31) return;
    const end = i + 1 < markers.length ? markers[i + 1].rawStart : text.length;
    const note = text.slice(marker.contentStart, end).trim();
    if (!note) return;
    const date = `${year}-${String(marker.month).padStart(2, '0')}-${String(marker.day).padStart(2, '0')}`;
    entries.push({ id: `${date}-${label}-${i}`, date, note: `${label}: ${note}` });
  });
  return entries;
}

export interface ImportResult {
  projects: Omit<Project, 'id'>[];
  skippedRows: number;
}

/** Parses the Randomwalk/Mindteck opportunity tracker CSV into Projects with a derived timeline. */
export function parseOpportunityCsv(text: string, year = new Date().getFullYear()): ImportResult {
  const rows = parseCSV(text);
  if (rows.length === 0) return { projects: [], skippedRows: 0 };

  const headers = rows[0];
  const col = {
    region: findCol(headers, 'Region'),
    name: findCol(headers, 'Opportunity Name'),
    desc: findCol(headers, 'Description'),
    mindteckAction: findCol(headers, 'Action/Inputs from Mindteck'),
    rwAction: findCol(headers, 'Action from Randomwalk'),
    status: findCol(headers, 'Current Status'),
    ownerMindteck: findCol(headers, 'Owner from Mindteck'),
    ownerSales: findCol(headers, 'Account/Sales Coordinator Owner'),
    ownerDelivery: findCol(headers, 'Client Delivery/Project Coordinator Owner'),
    remarks: findCol(headers, 'Remarks'),
  };

  const get = (r: string[], idx: number) => (idx === -1 ? '' : (r[idx] ?? '').trim());

  const projects: Omit<Project, 'id'>[] = [];
  let skippedRows = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = get(r, col.name);
    if (!name) {
      skippedRows++;
      continue;
    }

    const timeline = [
      ...extractDatedNotes(get(r, col.mindteckAction), year, 'Mindteck'),
      ...extractDatedNotes(get(r, col.rwAction), year, 'Randomwalk'),
      ...extractDatedNotes(get(r, col.remarks), year, 'Remark'),
    ].sort((a, b) => a.date.localeCompare(b.date));

    const team = [get(r, col.ownerMindteck), get(r, col.ownerSales), get(r, col.ownerDelivery)]
      .filter(Boolean)
      .join(' · ') || get(r, col.region) || 'Mindteck opportunity';

    projects.push({
      name,
      team,
      status: mapStatus(get(r, col.status)),
      pct: 0,
      mine: true,
      company: name,
      about: get(r, col.desc) || undefined,
      source: 'Mindteck',
      timeline: timeline.length ? timeline : undefined,
    });
  }

  return { projects, skippedRows };
}
