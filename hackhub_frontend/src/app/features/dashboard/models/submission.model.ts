export interface SubmissionResponse {
  id: number;
  team: string;
  hackathon: string;
  submittedAt: string; 
  immutableReference: string;
  writtenJudgment?: string; // Opzionale perché potrebbe non essere ancora valutato
  score?: number; // Opzionale
}

export interface RepoResponse {
  owner: string;
  repo: string;
}

export interface SubmitProjectPayload {
  idHackathon: number;
  type: string;
  source: string;
}

export interface EvaluationPayload {
  writtenJudgment: string;
  score: number;
}