export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string;
  interests: string[];
  languages: string[];
  avatar_url: string | null;
  is_available: boolean;
  created_at: string;
};

export type TokenBalance = {
  user_id: string;
  balance: number;
  updated_at: string;
};

export type TokenTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "spend" | "bonus";
  description: string | null;
  stripe_session_id: string | null;
  created_at: string;
};

export type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  status: "active" | "ended";
  created_at: string;
};

export type Conversation = {
  id: string;
  match_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  translated_content: string | null;
  target_language: string | null;
  moderation_status: "approved" | "flagged" | "blocked";
  moderation_reason: string | null;
  created_at: string;
};

export type TokenPack = {
  id: "starter_5" | "starter_10";
  name: string;
  price: number;
  tokens: number;
  description: string;
};

export const TOKEN_PACKS: TokenPack[] = [
  {
    id: "starter_5",
    name: "Starter Pack",
    price: 5,
    tokens: 100,
    description: "100 tokens for video minutes & boosts",
  },
  {
    id: "starter_10",
    name: "Plus Pack",
    price: 10,
    tokens: 250,
    description: "250 tokens — best value for regular chats",
  },
];
