export interface Membership {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: {
    name: string | null;
    email: string | null;
  };
}

export interface Role {
  name: string;
}

