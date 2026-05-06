export type AnkifyClientStatus = 'active' | 'inactive';

export interface AnkifyClient {
  id: number;
  owner: number;
  container_id: string;
  container_name: string | null;
  anki_port: number;
  vnc_port: number;
  novnc_port: number;
  status: AnkifyClientStatus;
  created_at: Date;
  last_active_at: Date;
}

export interface NewAnkifyClient {
  owner: number;
  container_id: string;
  container_name: string | null;
  anki_port: number;
  vnc_port: number;
  novnc_port: number;
}
