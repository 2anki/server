export type AnkifyClientStatus = 'active' | 'inactive';

interface AnkifyClient {
  id: number;
  owner: number;
  container_id: string;
  container_name: string | null;
  anki_port: number;
  vnc_port: number;
  novnc_port: number;
  status: AnkifyClientStatus;
  created_at: string | null;
  last_active_at: string | null;
  session_url?: string | null;
  has_active_session?: boolean;
}

export default AnkifyClient;
