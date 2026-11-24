import type { CandidateLoginRequest, ConsultantLoginRequest, ConsultantLoginResponse, LoginResponse } from "./types";
import { api } from "@/shared/api";

export async function loginCandidate(body: CandidateLoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse, CandidateLoginRequest>("login/candidato", body);
}

export async function loginConsultant(body: ConsultantLoginRequest): Promise<ConsultantLoginResponse> {
  return api.post<ConsultantLoginResponse, ConsultantLoginRequest>("login/consultor", body);
}
