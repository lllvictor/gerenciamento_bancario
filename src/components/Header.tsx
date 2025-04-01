"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Settings, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenSettings?: () => void;
  onMonthChange?: (month: string) => void;
  selectedMonth?: string;
}

const Header = ({
  onOpenSettings = () => {},
  onMonthChange = () => {},
  selectedMonth = new Date().toISOString().slice(0, 7), // Default to current month (YYYY-MM format)
}: HeaderProps) => {
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);

  // Generate month options (current month and 11 months ahead)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const value = date.toISOString().slice(0, 7); // YYYY-MM format
    const label = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return { value, label };
  });

  const handleMonthChange = (value: string) => {
    setCurrentMonth(value);
    onMonthChange(value);
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Parcel Manager</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={currentMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className={cn("rounded-full")}
          aria-label="Configurações"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
