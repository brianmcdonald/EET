
export enum EventType {
  DISPLACEMENT = 'displacement',
  RETURN = 'return',
  RELOCATION_RESETTLE = 'relocation/resettle',
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Movement {
  id: string;
  from: Coordinates | null;
  to: Coordinates | null;
  individuals: number;
}

export interface EventData {
  country: string;
  email: string;
  eventStart: string;
  eventEnd: string;
  eventType: string;
  movements: Movement[];
  trigger: string;
  priorityNeed1: string;
  priorityNeed2: string;
  priorityNeed3: string;
  narrativeSummary: string;
}
