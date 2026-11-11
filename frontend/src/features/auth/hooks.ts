"use client";
import { useApiMutation } from "@/shared/api/hooks";
import { loginCandidate, loginConsultant } from "./service";
import type { CandidateLoginRequest, ConsultantLoginRequest } from "./types";

export const useCandidateLogin = () => useApiMutation((body: CandidateLoginRequest) => loginCandidate(body));
export const useConsultantLogin = () => useApiMutation((body: ConsultantLoginRequest) => loginConsultant(body));
