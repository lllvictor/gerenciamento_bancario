"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  CreditCard,
  DollarSign,
  Package,
  ShoppingBag,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface Installment {
  number: number;
  value: number;
  dueDate: Date;
  paid: boolean;
}

interface Purchase {
  id: string;
  name: string;
  totalValue: number;
  installments: number;
  installmentValue: number;
  purchaseDate: Date;
  installmentsList: Installment[];
}

interface PurchaseDetailsDialogProps {
  purchase?: Purchase;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMarkAsPaid?: (purchaseId: string, installmentNumber: number) => void;
  onClose?: () => void;
}

const PurchaseDetailsDialog = ({
  purchase = {
    id: "1",
    name: 'Smart TV 55"',
    totalValue: 3000,
    installments: 10,
    installmentValue: 300,
    purchaseDate: new Date(2023, 5, 15),
    installmentsList: Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      value: 300,
      dueDate: new Date(2023, 5 + i, 15),
      paid: i < 3,
    })),
  },
  open = true,
  onOpenChange = () => {},
  onMarkAsPaid = () => {},
  onClose = () => {},
}: PurchaseDetailsDialogProps) => {
  const [localPurchase, setLocalPurchase] = useState<Purchase>(purchase);

  const handleMarkAsPaid = (installmentNumber: number) => {
    const updatedInstallments = localPurchase.installmentsList.map((inst) =>
      inst.number === installmentNumber ? { ...inst, paid: !inst.paid } : inst,
    );

    setLocalPurchase({
      ...localPurchase,
      installmentsList: updatedInstallments,
    });

    // Call the parent component's handler to update in Supabase
    onMarkAsPaid(localPurchase.id, installmentNumber);
  };

  const paidInstallments = localPurchase.installmentsList.filter(
    (inst) => inst.paid,
  ).length;

  const remainingValue = localPurchase.installmentsList
    .filter((inst) => !inst.paid)
    .reduce((sum, inst) => sum + inst.value, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {localPurchase.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          <Card className="bg-muted/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-lg font-bold">
                R$ {localPurchase.totalValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Parcelas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-lg font-bold">
                {paidInstallments} / {localPurchase.installments}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Valor da Parcela
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-lg font-bold">
                R$ {localPurchase.installmentValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Data da Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-lg font-bold">
                {format(localPurchase.purchaseDate, "dd/MM/yyyy")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader className="p-4 pb-2">
            <CardTitle>Parcelas</CardTitle>
            <CardDescription>
              Valor restante: R$ {remainingValue.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-2">
              {localPurchase.installmentsList.map((installment) => (
                <div
                  key={installment.number}
                  className={`flex items-center justify-between p-3 rounded-lg border ${installment.paid ? "bg-muted/30" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`installment-${installment.number}`}
                      checked={installment.paid}
                      onCheckedChange={() =>
                        handleMarkAsPaid(installment.number)
                      }
                    />
                    <div>
                      <label
                        htmlFor={`installment-${installment.number}`}
                        className="font-medium cursor-pointer"
                      >
                        Parcela {installment.number}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {format(installment.dueDate, "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      R$ {installment.value.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {installment.paid ? "Pago" : "Pendente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDetailsDialog;
