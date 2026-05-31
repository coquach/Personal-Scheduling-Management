"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Appointment } from "@/services/appointments.service";
import { PersonalAppointmentForm } from "./personal-appointment-form";
import { TeamAppointmentForm } from "./team-appointment-form";
import { type TeamAppointmentListItem } from "@/model/team-appointments";

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAppointment: Appointment | null;
  editingTeamAppointment?: TeamAppointmentListItem | null;
  initialDate?: string | null;
  defaultTab?: "personal" | "team";
}

export default function AppointmentModal({
  open,
  onOpenChange,
  editingAppointment,
  editingTeamAppointment,
  initialDate,
  defaultTab = "personal",
}: AppointmentModalProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // When editing, force the corresponding tab
  const effectiveTab = editingAppointment ? "personal" : editingTeamAppointment ? "team" : activeTab;
  const isEditing = !!editingAppointment || !!editingTeamAppointment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="appointment-form-modal" className="sm:max-w-[600px] overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isEditing ? "Edit Appointment" : "Create Appointment"}
          </DialogTitle>
        </DialogHeader>

        {!isEditing ? (
          <Tabs value={effectiveTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Appointment</TabsTrigger>
              <TabsTrigger value="team">Team Appointment</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="flex-1 overflow-y-auto pr-2 mt-0">
              <PersonalAppointmentForm
                onOpenChange={onOpenChange}
                editingAppointment={null}
                initialDate={initialDate}
              />
            </TabsContent>

            <TabsContent value="team" className="flex-1 overflow-y-auto pr-2 mt-0">
              <TeamAppointmentForm
                onOpenChange={onOpenChange}
                initialDate={initialDate}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 mt-4">
            {editingAppointment ? (
              <PersonalAppointmentForm
                onOpenChange={onOpenChange}
                editingAppointment={editingAppointment}
              />
            ) : editingTeamAppointment ? (
              <TeamAppointmentForm
                onOpenChange={onOpenChange}
                editingAppointment={editingTeamAppointment}
              />
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
