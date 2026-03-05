/**
 * Centralized API response types to eliminate 'any' casts
 */

export interface MedicalCause {
  name: string;
  probability: number;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  description?: string;
}

export interface ChatResponse {
  status: 'success' | 'error';
  data?: {
    response?: string;
    confidence?: number;
    triage?: string;
    causes?: MedicalCause[];
    risk_flags?: string[];
    next_steps?: string[];
    message?: string;
  };
  message?: string;
  confidence?: number;
  session_id?: string;
}

export interface ImageAnalysisResponse {
  status: 'success' | 'error';
  data?: {
    prediction?: string;
    result?: string;
    confidence?: number;
    risk_level?: string;
    recommendation?: string;
    message?: string;
  };
  message?: string;
}

export interface LabResponse {
  status: 'success' | 'error';
  data?: {
    detailed_results?: Record<string, unknown>;
    summary?: string;
    abnormal_count?: number;
  };
  message?: string;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface SpeechRecognitionAPI {
  new (): {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onstart: ((event: Event) => void) | null;
    onend: ((event: Event) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start: () => void;
    stop: () => void;
  };
}
