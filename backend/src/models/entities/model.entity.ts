export interface Model {
  name: string;
  model: string;
  modified_at: string | null;
  size: number;
  digest: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
