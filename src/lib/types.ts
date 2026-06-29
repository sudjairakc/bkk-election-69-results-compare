/* Type definitions for the BKK election dataset */

export interface PartyInfo {
  label: string;
  color: string;
  canon: string;
  sub?: string;
}

export interface RawRow {
  district_id: number;
  district: string;
  candidate: string;
  party: string;
  votes: number;
}

export interface Meta {
  countedPct: string;
  updatedAt: string;
  yearLeft: string;
  yearRight: string;
  source: { name: string; url: string };
}

export interface Election {
  meta: Meta;
  parties: Record<string, PartyInfo>;
  hidePersonFlows: [string, string][];
  year65: RawRow[];
  year69: RawRow[];
}

/** Per-district combined row (winner 65 vs winner 69) */
export interface Row {
  id: number;
  district: string;
  c65: string;
  p65: string;
  v65: number | null;
  c69?: string;
  p69?: string;
  v69: number | null;
  dv: number | null;
  samePerson: boolean;
  sameParty: boolean;
}

/** A Sankey node (party/group on one side) */
export interface FlowNode extends PartyInfo {
  id: string;
  count: number;
}

/** Seat-mode flow (unit = districts) */
export interface SeatFlow {
  from: string;
  to: string;
  v: number;
  d: string[];
}

/** Person-mode flow (unit = incumbents) */
export interface PersonFlow {
  from: string;
  to: string;
  v: number;
  people: { district: string; name: string; v65: number; v69: number }[];
}

/** A tallied canon-party slice used by bars / breakdowns */
export interface CanonSlice {
  canon: string;
  label: string;
  color: string;
  n: number;
}
