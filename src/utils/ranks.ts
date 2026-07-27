export interface PositionDef {
  key: string;
  name: string;
  description: string;
  fullLabel: string;
}

export const OFFICIAL_POSITIONS: PositionDef[] = [
  { key: 'Lord Patron', name: 'Lord Patron', description: 'Supreme Patron Officer', fullLabel: 'Lord Patron' },
  { key: 'Patron', name: 'Patron', description: 'Distinguished Patron', fullLabel: 'Patron' },
  { key: 'Chancellor', name: 'Chancellor', description: 'President', fullLabel: 'Chancellor (President)' },
  { key: 'Provost', name: 'Provost', description: 'Vice President', fullLabel: 'Provost (Vice President)' },
  { key: 'Scribe', name: 'Scribe', description: 'Secretary', fullLabel: 'Scribe (Secretary)' },
  { key: 'Archivist', name: 'Archivist', description: 'Assistant Secretary', fullLabel: 'Archivist (Assistant Secretary)' },
  { key: 'Quartermaster', name: 'Quartermaster', description: 'Treasurer', fullLabel: 'Quartermaster (Treasurer)' },
  { key: 'Auditor', name: 'Auditor', description: 'Financial Secretary', fullLabel: 'Auditor (Financial Secretary)' },
  { key: 'Herald', name: 'Herald', description: 'Public Relations Officer', fullLabel: 'Herald (Public Relations Officer)' },
  { key: 'Counsel', name: 'Counsel', description: 'Legal Adviser', fullLabel: 'Counsel (Legal Adviser)' },
  { key: 'Guardian', name: 'Guardian', description: 'Welfare Officer', fullLabel: 'Guardian (Welfare Officer)' },
  { key: 'Registrar', name: 'Registrar', description: 'Membership Officer', fullLabel: 'Registrar (Membership Officer)' },
  { key: 'Technologist', name: 'Technologist', description: 'ICT Officer', fullLabel: 'Technologist (ICT Officer)' },
  { key: 'Curator', name: 'Curator', description: 'Event Coordinator', fullLabel: 'Curator (Event Coordinator)' },
  { key: 'Scholar', name: 'Scholar', description: 'Research Officer / General Member', fullLabel: 'Scholar (Research Officer / Member)' },
  { key: 'Mentor', name: 'Mentor', description: 'Education Officer', fullLabel: 'Mentor (Education Officer)' },
  { key: 'Sentinel', name: 'Sentinel', description: 'Discipline Officer', fullLabel: 'Sentinel (Discipline Officer)' },
  { key: 'Envoy', name: 'Envoy', description: 'Spokesperson', fullLabel: 'Envoy (Spokesperson)' },
  { key: 'Prefect', name: 'Prefect', description: 'Chapter Leader', fullLabel: 'Prefect (Chapter Leader)' },
  { key: 'Director', name: 'Director', description: 'Committee Head', fullLabel: 'Director (Committee Head)' },
];

export const AVAILABLE_POSITIONS = OFFICIAL_POSITIONS.map(p => p.key);

/**
 * Resolves the military-style insignia (stripes and Vs) for any member based on their position.
 */
export function getMilitaryInsignia(position: string | undefined): string {
  if (!position || position === 'None' || position === 'No Position' || position.trim() === '') {
    return '[ ⟫ ]'; // Default Scholar chevron
  }
  
  const pos = position.toLowerCase();
  
  if (pos.includes('lord patron') || pos.includes('lord_patron')) {
    return '[ 👑 ]'; // Lord Patron
  }
  if (pos.includes('patron')) {
    return '[ 🛡️ ]'; // Patron
  }
  if (pos.includes('chancellor')) {
    return '[ ≡★≡ ]'; // Chancellor
  }
  if (pos.includes('provost')) {
    return '[ ≡≡≡≡ ]'; // Provost
  }
  if (pos.includes('senator') || pos.includes('director') || pos.includes('prefect')) {
    return '[ ≡≡≡ ]'; // High Leadership
  }
  if (pos.includes('scribe') || pos.includes('quartermaster') || pos.includes('auditor')) {
    return '[ ≡≡ ]'; // Executive Officers
  }
  if (pos.includes('archivist') || pos.includes('counsel') || pos.includes('technologist')) {
    return '[ ≡ ]'; // Specialist Officers
  }
  if (pos.includes('herald') || pos.includes('guardian') || pos.includes('registrar') || pos.includes('envoy')) {
    return '[ ⟫⟫ ]'; // Staff Officers
  }
  
  return '[ ⟫ ]'; // Standard officer / Scholar chevron
}

/**
 * Resolves the display title of a member with full descriptive role.
 */
export function getMemberTitle(position: string | undefined): string {
  if (!position || position === 'None' || position === 'No Position' || position.trim() === '') {
    return 'Scholar (Research Officer / Member)';
  }
  
  const found = OFFICIAL_POSITIONS.find(p => p.key.toLowerCase() === position.toLowerCase() || p.name.toLowerCase() === position.toLowerCase());
  if (found) {
    return found.fullLabel;
  }
  
  return position;
}

/**
 * Resolves the hierarchical rank order of leadership positions (Chancellor = 1, Provost = 2, Scribe = 3/4, etc.)
 */
export function getLeadershipRank(position: string | undefined): number {
  if (!position) return 100;
  const p = position.toLowerCase();
  if (p.includes('chancellor') || p.includes('president') || p.includes('admin') || p.includes('lord patron')) return 1;
  if (p.includes('provost') || p.includes('vice president')) return 2;
  if (p.includes('quartermaster') || p.includes('treasurer')) return 3;
  if (p.includes('scribe') || p.includes('secretary')) return 4;
  if (p.includes('archivist') || p.includes('assistant secretary')) return 5;
  if (p.includes('auditor') || p.includes('financial secretary')) return 6;
  if (p.includes('herald') || p.includes('public relations')) return 7;
  if (p.includes('counsel') || p.includes('legal')) return 8;
  if (p.includes('guardian') || p.includes('welfare')) return 9;
  if (p.includes('registrar') || p.includes('membership')) return 10;
  if (p.includes('technologist') || p.includes('ict')) return 11;
  if (p.includes('curator') || p.includes('event')) return 12;
  if (p.includes('mentor') || p.includes('education')) return 13;
  if (p.includes('sentinel') || p.includes('discipline')) return 14;
  if (p.includes('envoy') || p.includes('spokesperson')) return 15;
  if (p.includes('prefect') || p.includes('chapter')) return 16;
  if (p.includes('director') || p.includes('committee')) return 17;
  return 50;
}

