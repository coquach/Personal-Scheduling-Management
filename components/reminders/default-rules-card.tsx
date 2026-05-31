"use client";

import { useState } from "react";
import { AlarmClockIcon, PlusIcon, Trash2Icon, CheckIcon, XIcon, MailIcon, SmartphoneIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useReminderProfile } from "@/hooks/use-reminder-profile";

const RULE_PRESETS = [
  { label: "10m", value: 10 },
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "1d", value: 1440 },
];

export function DefaultRulesCard() {
  const { rules, addRule, removeRule } = useReminderProfile();
  const [isAdding, setIsAdding] = useState(false);
  const [newRuleValue, setNewRuleValue] = useState<number>(10);
  const [newRuleChannel, setNewRuleChannel] = useState<"push" | "email">("push");
  const [isCustom, setIsCustom] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const formatOffset = (mins: number) => {
    if (mins < 60) return `${mins} minutes before`;
    if (mins === 60) return `1 hour before`;
    if (mins < 1440) return `${Math.round(mins / 60)} hours before`;
    if (mins === 1440) return `1 day before`;
    return `${Math.round(mins / 1440)} days before`;
  };

  const handleAdd = () => {
    addRule({ offsetMinutes: newRuleValue, channel: newRuleChannel });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    removeRule(id);
  };

  return (
    <Card className="border-border/50 shadow-sm transition-all h-full flex flex-col bg-card/60 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlarmClockIcon className="size-5 text-primary" />
            Default Rules
          </CardTitle>
          <CardDescription className="mt-1">
            Rules applied automatically to new appointments.
          </CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="rounded-full gap-2 font-medium shadow-sm hover:scale-105 transition-all">
            <PlusIcon className="size-4" /> Add Rule
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {rules.length === 0 && !isAdding && (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 text-center animate-in fade-in zoom-in-95 duration-500">
             <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner animate-[pulse_3s_ease-in-out_infinite]">
               <AlarmClockIcon className="size-7" />
             </div>
             <p className="font-semibold text-foreground text-lg">No default rules</p>
             <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">Create a rule so you never miss an appointment.</p>
          </div>
        )}

        <div className="space-y-3">
          {rules.map((rule) => (
             <div key={rule.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in group">
                <div className="flex items-center gap-4">
                   <div className={`flex size-11 items-center justify-center rounded-full shadow-sm ${rule.channel === 'push' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                      {rule.channel === 'push' ? <SmartphoneIcon className="size-5" /> : <MailIcon className="size-5" />}
                   </div>
                   <div>
                     <p className="font-bold text-foreground leading-none text-base">{formatOffset(rule.offsetMinutes)}</p>
                     <p className="text-sm font-medium text-muted-foreground mt-1 capitalize">{rule.channel} Notification</p>
                   </div>
                </div>
                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground hover:scale-110 active:scale-95" onClick={() => handleDelete(rule.id)}>
                   <Trash2Icon className="size-4" />
                </Button>
             </div>
          ))}
        </div>

        {isAdding && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 animate-in slide-in-from-top-4 fade-in shadow-inner space-y-5">
             <div className="flex items-center justify-between">
                <p className="font-bold text-foreground text-base">New Reminder Rule</p>
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground rounded-full hover:bg-muted" onClick={() => setIsAdding(false)}>
                   <XIcon className="size-4" />
                </Button>
             </div>
             
             <div className="space-y-3">
               <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">When to notify</p>
               <div className="flex flex-wrap gap-2">
                 {RULE_PRESETS.map(p => (
                   <Button key={p.value} variant={newRuleValue === p.value && !isCustom ? "default" : "outline"} size="sm" className="rounded-full transition-all shadow-sm hover:scale-105" onClick={() => { setNewRuleValue(p.value); setIsCustom(false); }}>{p.label}</Button>
                 ))}
                 <Button variant={isCustom ? "default" : "outline"} size="sm" className="rounded-full transition-all shadow-sm hover:scale-105" onClick={() => setIsCustom(true)}>Custom</Button>
               </div>
               {isCustom && (
                  <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-top-2">
                     <Input type="number" className="w-24 bg-background h-9 rounded-xl shadow-sm" placeholder="Mins" value={customVal} onChange={(e) => {
                       setCustomVal(e.target.value);
                       if (e.target.value) setNewRuleValue(parseInt(e.target.value, 10));
                     }} />
                     <span className="text-sm font-medium text-muted-foreground">minutes before</span>
                  </div>
               )}
             </div>

             <div className="space-y-3">
               <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Delivery method</p>
               <div className="flex gap-2">
                 <Button variant={newRuleChannel === "push" ? "default" : "secondary"} size="sm" className="rounded-xl gap-2 flex-1 shadow-sm transition-all hover:scale-[1.02]" onClick={() => setNewRuleChannel("push")}>
                    <SmartphoneIcon className="size-4" /> Push
                 </Button>
                 <Button variant={newRuleChannel === "email" ? "default" : "secondary"} size="sm" className="rounded-xl gap-2 flex-1 shadow-sm transition-all hover:scale-[1.02]" onClick={() => setNewRuleChannel("email")}>
                    <MailIcon className="size-4" /> Email
                 </Button>
               </div>
             </div>

             <Button className="w-full gap-2 rounded-xl mt-2 font-semibold shadow-sm hover:scale-[1.01] transition-all" onClick={handleAdd}>
                <CheckIcon className="size-4" /> Save Rule
             </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
