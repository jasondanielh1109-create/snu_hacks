export interface HospitalProfile {
  type: string;
  beds: number;
  doctors: number;
  specializationsCount: number;
  specializations: string[];
  yearEstablished: number;
  emergency: boolean;
  icu: boolean;
  open247: boolean;
  insurance: boolean;
  accreditations: string[];
  rating: number;
  description: string;
  address?: string;
  location?: { lat: number; lng: number };
}

export interface Competitor {
  placeId: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  vicinity: string;
}

export interface AnalysisResult {
  overallRanking: { hospitalName: string; rank: number; overallScore: number }[];
  userHospitalScore: number;
  userHospitalRank: number;
  radarScores: {
    userHospital: Record<string, number>;
    competitors: { name: string; [key: string]: any }[];
  };
  competitorProfiles: {
    name: string;
    strengths: string[];
    weaknesses: string[];
    estimatedBeds: number;
    estimatedDoctors: number;
    keyServices: string[];
    marketPosition: string;
  }[];
  comparativeAnalysis: {
    userStrengths: string[];
    userWeaknesses: string[];
    opportunities: string[];
    threats: string[];
    keyDifferentiators: string;
  };
  isAlreadyBest: boolean;
  strategyReport: {
    executiveSummary: string;
    priorityActions: {
      priority: number;
      title: string;
      description: string;
      timeframe: string;
      expectedImpact: string;
      category: string;
    }[];
    longTermVision: string;
    estimatedTimeToLeadership: string;
  };
  quickInsights: string[];
}

export interface Notification {
  id: string;
  type: 'competitor_move' | 'market_opportunity' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface UserData {
  hospitalName: string;
  email: string;
  phone: string;
  password?: string;
  setupComplete: boolean;
  hospitalProfile: HospitalProfile | null;
  selectedRadius: number;
  competitors: Competitor[];
  analysisResults: AnalysisResult | null;
  chatHistory: { role: 'user' | 'ai'; content: string }[];
  notifications: Notification[];
  lastCheckedCompetitors: number;
}
