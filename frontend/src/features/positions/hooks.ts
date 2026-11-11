"use client";
import { useApiMutation, useApiQuery } from "@/shared/api/hooks";
import * as service from "./service";
import type { CreatePositionRequest, SearchPositionsRequest, UpdatePositionRequest } from "./types";

export const usePositions = () => useApiQuery(service.listPositions);
export const usePosition = (id: number) => useApiQuery(() => service.getPosition(id), [id]);
export const usePositionCharacteristics = (id: number) => useApiQuery(() => service.getPositionCharacteristics(id), [id]);
export const usePositionSearch = (criteria: SearchPositionsRequest) => useApiQuery(() => service.searchPositions(criteria), [criteria.codigo, criteria.nombre, criteria.empresa]);
export const useCreatePosition = () => useApiMutation((body: CreatePositionRequest) => service.createPosition(body));
export const useUpdatePosition = () => useApiMutation(({ id, body }: { id: number; body: UpdatePositionRequest }) => service.updatePosition(id, body));
export const useReactivatePosition = () => useApiMutation((id: number) => service.reactivatePosition(id));
export const useDeletePosition = () => useApiMutation((id: number) => service.deletePosition(id));
