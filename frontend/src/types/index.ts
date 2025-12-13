export type UserType = {
  name: string;
  email: string;
  role?: string;
};

export type Session = {
  id: string;
  title: string;
  scheduled_start: string | null;
  ended_at: string | null;
  draft: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuItem = {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
};

export type SessionStatus = {
  text: string;
  color: string;
  icon: string;
};