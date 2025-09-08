export interface Notification {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    message: string;
    read: boolean;
    link: string;
    type: 'job' | 'request';
    user_id: number;
  }
  
  