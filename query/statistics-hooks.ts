import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { exportAppointments, getStatistics } from "@/services/statistics.service";
import type { ExportAppointmentsInput, GetStatisticsInput } from "@/model/validation/statistics";

export function useGetStatistics(input: GetStatisticsInput) {
  return useQuery({
    queryKey: queryKeys.statistics.summary(JSON.stringify(input)),
    queryFn: () => getStatistics(input),
    enabled: !!input.startDate && !!input.endDate,
  });
}

export function useExportAppointments() {
  return useMutation({
    mutationFn: (input: ExportAppointmentsInput) => exportAppointments(input),
  });
}
