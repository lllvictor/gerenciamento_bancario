"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreditCard, DollarSign } from "lucide-react";

interface MonthlyTotalCardProps {
  month?: string;
  totalAmount?: number;
  currency?: string;
  className?: string;
}

const MonthlyTotalCard = ({
  month = "Junho 2023",
  totalAmount = 1250.75,
  currency = "R$",
  className,
}: MonthlyTotalCardProps) => {
  // Format the amount with the currency symbol and proper decimal places
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalAmount);

  return (
    <Card
      className={cn("w-full bg-white dark:bg-slate-950 shadow-md", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-slate-900 dark:text-slate-100">
          Total para {month}
        </CardTitle>
        <CreditCard className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {formattedAmount}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Total de parcelas vencendo neste mês
        </p>
      </CardContent>
    </Card>
  );
};

export default MonthlyTotalCard;
