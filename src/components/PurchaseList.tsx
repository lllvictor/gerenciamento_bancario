"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import PurchaseCard from "./PurchaseCard";
import { Button } from "./ui/button";
import { Filter, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Purchase {
  id: string;
  name: string;
  totalValue: number;
  installmentValue: number;
  totalInstallments: number;
  paidInstallments: number;
  purchaseDate: string;
}

interface PurchaseListProps {
  purchases?: Purchase[];
  selectedMonth?: string;
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkPaid?: (id: string) => void;
  onAddPurchase?: () => void;
  onFilterMonth?: () => void;
}

const PurchaseList = ({
  purchases = [
    {
      id: "1",
      name: "Smart TV 55 polegadas",
      totalValue: 3500,
      installmentValue: 291.67,
      totalInstallments: 12,
      paidInstallments: 3,
      purchaseDate: "2023-10-15",
    },
    {
      id: "2",
      name: "iPhone 15 Pro",
      totalValue: 7999,
      installmentValue: 666.58,
      totalInstallments: 12,
      paidInstallments: 1,
      purchaseDate: "2023-11-05",
    },
    {
      id: "3",
      name: "Geladeira Frost Free",
      totalValue: 4200,
      installmentValue: 350,
      totalInstallments: 12,
      paidInstallments: 6,
      purchaseDate: "2023-08-20",
    },
    {
      id: "4",
      name: "Notebook Dell Inspiron",
      totalValue: 5300,
      installmentValue: 441.67,
      totalInstallments: 12,
      paidInstallments: 12,
      purchaseDate: "2023-01-10",
    },
  ],
  selectedMonth = "Novembro 2023",
  onViewDetails = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onMarkPaid = () => {},
  onAddPurchase = () => {},
  onFilterMonth = () => {},
}: PurchaseListProps) => {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filteredPurchases = purchases.filter((purchase) => {
    if (filter === "all") return true;
    if (filter === "pending")
      return purchase.paidInstallments < purchase.totalInstallments;
    if (filter === "completed")
      return purchase.paidInstallments === purchase.totalInstallments;
    return true;
  });

  return (
    <div className="w-full bg-background p-4 md:p-6 rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Compras Parceladas</h2>
          <p className="text-muted-foreground">
            {selectedMonth} • {purchases.length} compras no total
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 w-full sm:w-auto">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(filter === "all" && "bg-primary/10")}
              onClick={() => setFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(filter === "pending" && "bg-primary/10")}
              onClick={() => setFilter("pending")}
            >
              Pendentes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(filter === "completed" && "bg-primary/10")}
              onClick={() => setFilter("completed")}
            >
              Concluídas
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterMonth}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filtrar por mês
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onAddPurchase}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Nova compra
            </Button>
          </div>
        </div>
      </div>

      {filteredPurchases.length === 0 ? (
        <Card className="w-full bg-white">
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground">
              Nenhuma compra encontrada
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-muted-foreground mb-4">
              {filter === "all"
                ? "Você ainda não cadastrou nenhuma compra parcelada."
                : filter === "pending"
                  ? "Não há compras pendentes no momento."
                  : "Não há compras concluídas no momento."}
            </p>
            <Button onClick={onAddPurchase} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar compra
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              id={purchase.id}
              name={purchase.name}
              totalValue={purchase.totalValue}
              installmentValue={purchase.installmentValue}
              totalInstallments={purchase.totalInstallments}
              paidInstallments={purchase.paidInstallments}
              purchaseDate={purchase.purchaseDate}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkPaid={onMarkPaid}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseList;
