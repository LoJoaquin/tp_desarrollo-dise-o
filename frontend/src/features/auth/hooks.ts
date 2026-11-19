"use client";

import { useServiceAction } from "@/shared/hooks/use-service-action";
import { loginCandidate, loginConsultant } from "./service";
import type { CandidateLoginRequest, ConsultantLoginRequest } from "./types";

export const useCandidateLogin = () =>
  useServiceAction((body: CandidateLoginRequest) => loginCandidate(body));

export const useConsultantLogin = () =>
  useServiceAction((body: ConsultantLoginRequest) => loginConsultant(body));
