export class Plan {
  code: string;
  name: string;
  storage_limit_bytes: number | null;
  allowed_models: string[];
  created_at: string;
  updated_at: string;
}
