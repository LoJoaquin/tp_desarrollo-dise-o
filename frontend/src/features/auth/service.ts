import { assertCapabilityAvailable } from "@/features/capabilities";
import type { CandidateLoginRequest, ConsultantLoginRequest, LoginResponse } from "./types";

// Keep the request shapes documented while authentication remains unavailable in the backend.
export async function loginCandidate(_body: CandidateLoginRequest): Promise<LoginResponse> {
  assertCapabilityAvailable("candidateLogin");
  throw new Error("El backend no devolvió una sesión válida.");
}

export async function loginConsultant(_body: ConsultantLoginRequest): Promise<LoginResponse> {
  assertCapabilityAvailable("consultantLogin");
  throw new Error("El backend no devolvió una sesión válida.");
}
