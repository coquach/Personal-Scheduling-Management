import { useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useCheckTeamAppointmentConflicts } from "@/query/team-appointments-hooks";

interface UseTeamAvailabilityProps {
  teamId: string;
  startAt: string;
  endAt: string;
  participantIds: string[];
}

export function useTeamAvailability({
  teamId,
  startAt,
  endAt,
  participantIds,
}: UseTeamAvailabilityProps) {
  const checkConflictsMutation = useCheckTeamAppointmentConflicts(teamId);
  const { mutate: checkConflicts, reset: resetConflicts, data: conflictData, isPending } = checkConflictsMutation;

  const debouncedStartAt = useDebounce(startAt, 500);
  const debouncedEndAt = useDebounce(endAt, 500);
  
  // Stringify the array for stable dependency comparison
  const participantIdsString = participantIds.join(",");
  const debouncedParticipantIdsString = useDebounce(participantIdsString, 500);

  const isDebouncing = 
    startAt !== debouncedStartAt || 
    endAt !== debouncedEndAt || 
    participantIdsString !== debouncedParticipantIdsString;

  // Auto-check conflicts effect
  useEffect(() => {
    if (!teamId || !debouncedStartAt || !debouncedEndAt || !debouncedParticipantIdsString) {
      return;
    }

    try {
      const start = new Date(debouncedStartAt).toISOString();
      const end = new Date(debouncedEndAt).toISOString();
      
      // Ensure start is before end
      if (new Date(start) >= new Date(end)) return;

      const pIds = debouncedParticipantIdsString.split(",").filter(Boolean);
      if (pIds.length === 0) return;

      checkConflicts({
        startAt: start,
        endAt: end,
        participantUserIds: pIds,
      });
    } catch (e: unknown) {
      // Invalid date formats, wait for valid input
    }
  }, [teamId, debouncedStartAt, debouncedEndAt, debouncedParticipantIdsString, checkConflicts]);

  // Clear stale conflict data as soon as inputs change
  useEffect(() => {
    // Only reset if we actually have data/error and inputs are currently debouncing
    // i.e., the user started typing something new.
    if ((conflictData || checkConflictsMutation.error) && isDebouncing) {
      resetConflicts();
    }
  }, [isDebouncing, conflictData, checkConflictsMutation.error, resetConflicts]);

  return {
    isChecking: isPending || isDebouncing,
    hasConflicts: conflictData?.hasConflict ?? false,
    conflictData,
  };
}
