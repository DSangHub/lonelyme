export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string;
  interests: string[];
  languages: string[];
  timezone: string;
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
  compatibility_score: number;
  match_reasons: string[];
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

export type MoodCheckin = {
  id: string;
  user_id: string;
  mood: number;
  note: string;
  created_at: string;
};

export type VideoSession = {
  id: string;
  conversation_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  minutes_billed: number;
  tokens_spent: number;
};

export type MatchSuggestion = {
  profile: Pick<Profile, "id" | "display_name" | "username" | "languages" | "interests" | "timezone">;
  score: number;
  reasons: string[];
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
    description: "100 tokens — ~20 min video + matches",
  },
  {
    id: "starter_10",
    name: "Plus Pack",
    price: 10,
    tokens: 250,
    description: "250 tokens — best value for regular chats",
  },
];

export const MOOD_LABELS = ["😔 Low", "😕 Okay", "😐 Neutral", "🙂 Good", "😊 Great"] as const;

export const INTEREST_OPTIONS = [
  "Travel",
  "Music",
  "Movies",
  "Books",
  "Cooking",
  "Sports",
  "Art",
  "Gaming",
  "Languages",
  "Photography",
  "Fitness",
  "Technology",
] as const;

export const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Japanese",
  "Korean",
  "Mandarin",
  "Arabic",
  "Hindi",
  "Italian",
  "Dutch",
] as const;
