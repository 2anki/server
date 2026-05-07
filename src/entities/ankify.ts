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

export type AnkifySyncMappingSourceType = 'apkg_guid' | 'notion_block';

export interface AnkifySyncMapping {
  id: number;
  ankify_client_id: number;
  source_id: string;
  source_type: AnkifySyncMappingSourceType;
  anki_note_id: number;
  deck_name: string;
  last_synced_at: Date;
}

export interface NewAnkifySyncMapping {
  ankify_client_id: number;
  source_id: string;
  source_type: AnkifySyncMappingSourceType;
  anki_note_id: number;
  deck_name: string;
}
