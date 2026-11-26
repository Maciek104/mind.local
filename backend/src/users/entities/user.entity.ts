export class User {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  profile_image_path: string | null;
  plan: string;
  role: 'USER' | 'ADMIN';
  is_active: number;
  created_at: string;
  updated_at: string;
}
