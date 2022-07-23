export interface Notification {
  created_at: string;
  data: any;
  from_user: FromUser;
  id: number;
  is_read: number;
  summary: string;
  title: string;
  type: string;
  uid: number;
}

export interface FromUser {
  avatar: string;
  id: number;
  name: string;
}
