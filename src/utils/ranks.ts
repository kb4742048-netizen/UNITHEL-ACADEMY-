export interface PositionDef {
  key: string;
  name: string;
  description: string;
  fullLabel: string;
}

export const OFFICIAL_POSITIONS: PositionDef[] = [
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
