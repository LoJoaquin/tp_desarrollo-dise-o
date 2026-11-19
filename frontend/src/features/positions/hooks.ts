"use client";

import { useServiceAction } from "@/shared/hooks/use-service-action";
import * as service from "./service";
import type { CreatePositionRequest, SearchPositionsRequest, UpdatePositionRequest } from "./types";

export const usePositions = () =>
  useServiceAction<void, Awaited<ReturnType<typeof service.listPositions>>>(
    () => service.listPositions(),
  );

export const usePosition = () =>
  useServiceAction((id: number) => service.getPosition(id));

export const usePositionCharacteristics = () =>
  useServiceAction((id: number) => service.getPositionCharacteristics(id));

export const usePositionSearch = () =>
  useServiceAction((criteria: SearchPositionsRequest) => service.searchPositions(criteria));

export const useCreatePosition = () =>
  useServiceAction((body: CreatePositionRequest) => service.createPosition(body));

export const useUpdatePosition = () =>
  useServiceAction(({ id, body }: { id: number; body: UpdatePositionRequest }) =>
    service.updatePosition(id, body),
  );

export const useReactivatePosition = () =>
  useServiceAction(async (id: number) => {
    await service.reactivatePosition(id);
    return true;
  });

export const useDeletePosition = () =>
  useServiceAction(async (id: number) => {
    await service.deletePosition(id);
    return true;
  });
