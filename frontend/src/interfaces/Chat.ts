export interface ChatRoom {
  ID: number;
  Last_Message?: string;
  last_message_at?: string; // time.Time -> JSON string

  Student: {
    ID: number;
    first_name?: string;
    last_name?: string;
    User: {
      ID: number;
    };
  };

  Employer: {
    ID: number;
    first_name?: string;
    last_name?: string;
    User?: {
      ID: number;
    };
  };
}

export interface ChatHistory {
  ID: number;
  Chat_Room: number;
  User: {
    ID: number;
    Role: any;
  };
  Message_Type: string;
  Message?: string;
  Image_URL?: string;
  Time_Stamp_Send: string; // ถ้า backend ส่งเป็น time.Time → string
}
