"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Eye, Edit, Trash, CheckCircle, XCircle } from "lucide-react";

interface PurchaseCardProps {
  id?: string;
  name?: string;
  totalValue?: number;
  installmentValue?: number;
  totalInstallments?: number;
  paidInstallments?: number;
  purchaseDate?: string;
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkPaid?: (id: string) => void;
}

const PurchaseCard = ({
  id = "1",
  name = "Smart TV 55 polegadas",
  totalValue = 3500,
  installmentValue = 291.67,
  totalInstallments = 12,
  paidInstallments = 3,
  purchaseDate = "2023-10-15",
  onViewDetails = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onMarkPaid = () => {},
}: PurchaseCardProps) => {
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  // Calculate progress percentage
  const progressPercentage = (paidInstallments / totalInstallments) * 100;

  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription className="mt-1">
              Compra realizada em {formatDate(purchaseDate)}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(id)}
              title="Ver detalhes"
            >
              <Eye className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(id)}
              title="Editar compra"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(id)}
              title="Excluir compra"
              className="text-destructive hover:text-destructive"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Valor Total</span>
            <span className="font-semibold">{formatCurrency(totalValue)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              Valor da Parcela
            </span>
            <span className="font-semibold">
              {formatCurrency(installmentValue)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Parcelas</span>
            <span className="font-semibold">
              {paidInstallments} de {totalInstallments}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center">
              {paidInstallments === totalInstallments ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">Pago</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-amber-500 font-medium">Pendente</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <div className="text-sm text-muted-foreground">
          {totalInstallments - paidInstallments} parcelas restantes
        </div>
        {paidInstallments < totalInstallments && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkPaid(id)}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar próxima parcela como paga
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PurchaseCard;
