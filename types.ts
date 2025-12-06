export interface CouncilMember {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  icon: string; // Lucide icon name
}

export interface CouncilMessage {
  speakerId: string; // 'user' | 'system' | memberId
  content: string;
  timestamp: number;
  type: 'debate' | 'decree' | 'user_query' | 'system_note';
}

export interface ImageGenerationSettings {
  size: '1K' | '2K' | '4K';
  aspectRatio: '16:9' | '1:1' | '9:16';
}
