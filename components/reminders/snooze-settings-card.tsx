"use client";

import { useState } from "react";
import { ClockIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SNOOZE_PRESETS = [
  { label: "5m", value: 5 },
  { label: "10m", value: 10 },
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
];

export function SnoozeSettingsCard() {
  const [snooze, setSnooze] = useState<number>(5);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleSelectPreset = (value: number) => {
    setSnooze(value);
    setIsCustom(false);
  };

  return (
    <Card className="border-border/50 shadow-sm transition-all h-full bg-card/60 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClockIcon className="size-5 text-primary" />
          Snooze Duration
        </CardTitle>
        <CardDescription>
          How long to wait when you hit snooze.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {SNOOZE_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={snooze === preset.value && !isCustom ? "default" : "outline"}
              onClick={() => handleSelectPreset(preset.value)}
              className="flex-1 rounded-full transition-all duration-300 shadow-sm hover:scale-105 active:scale-95"
            >
              {preset.label}
            </Button>
          ))}
          <Button
             variant={isCustom ? "default" : "outline"}
             onClick={() => setIsCustom(true)}
             className="rounded-full transition-all duration-300 shadow-sm hover:scale-105 active:scale-95"
          >
             Custom
          </Button>
        </div>
        {isCustom && (
          <div className="mt-4 flex items-center gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
             <Input 
               type="number" 
               placeholder="Custom mins..." 
               value={customValue}
               onChange={(e) => {
                 setCustomValue(e.target.value);
                 if (e.target.value) setSnooze(parseInt(e.target.value, 10));
               }}
               className="bg-muted/50 rounded-xl transition-all hover:bg-background focus:bg-background"
             />
             <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">minutes</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
