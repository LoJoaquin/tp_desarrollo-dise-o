import { assertCapabilityAvailable } from "@/features/capabilities";
import type { CandidateLoginRequest, ConsultantLoginRequest, LoginResponse } from "./types";
import { api } from "@/shared/api";

export async function loginCandidate(body: CandidateLoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse, CandidateLoginRequest>("login/candidato", body);
}

export async function loginConsultant(_body: ConsultantLoginRequest): Promise<LoginResponse> {
  assertCapabilityAvailable("consultantLogin");
  throw new Error("El backend no devolvió una sesión válida.");
}
