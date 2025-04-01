"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import PurchaseList from "@/components/PurchaseList";
import MonthlyTotalCard from "@/components/MonthlyTotalCard";
import AddPurchaseButton from "@/components/AddPurchaseButton";
import PurchaseFormDialog from "@/components/PurchaseFormDialog";
import PurchaseDetailsDialog from "@/components/PurchaseDetailsDialog";
import SettingsDialog from "@/components/SettingsDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Home() {
  // State for dialogs
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
  const [isPurchaseDetailsOpen, setIsPurchaseDetailsOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // State for selected purchase and month
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null,
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );

  // Mock data for purchases
  const [purchases, setPurchases] = useState([
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
  ]);

  // Handlers for dialogs
  const handleOpenSettings = () => setIsSettingsOpen(true);
  const handleOpenPurchaseForm = () => setIsPurchaseFormOpen(true);

  const handleViewPurchaseDetails = (id: string) => {
    setSelectedPurchaseId(id);
    setIsPurchaseDetailsOpen(true);
  };

  const handleEditPurchase = (id: string) => {
    setSelectedPurchaseId(id);
    setIsPurchaseFormOpen(true);
  };

  const handleDeletePurchase = (id: string) => {
    setSelectedPurchaseId(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPurchaseId) {
      // Filter out the deleted purchase
      setPurchases(purchases.filter((p) => p.id !== selectedPurchaseId));
      setIsConfirmDeleteOpen(false);
      setSelectedPurchaseId(null);
    }
  };

  const handleMarkPaid = (id: string) => {
    // Update the paid installments count
    setPurchases(
      purchases.map((purchase) => {
        if (
          purchase.id === id &&
          purchase.paidInstallments < purchase.totalInstallments
        ) {
          return {
            ...purchase,
            paidInstallments: purchase.paidInstallments + 1,
          };
        }
        return purchase;
      }),
    );
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    // In a real app, this would filter purchases for the selected month
  };

  // Calculate monthly total (sum of installments due in the selected month)
  const monthlyTotal = purchases.reduce((total, purchase) => {
    // In a real app, this would check if an installment is due in the selected month
    if (purchase.paidInstallments < purchase.totalInstallments) {
      return total + purchase.installmentValue;
    }
    return total;
  }, 0);

  // Format month for display
  const formatDisplayMonth = (isoMonth: string) => {
    const date = new Date(isoMonth + "-01");
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const displayMonth = formatDisplayMonth(selectedMonth);

  // Get selected purchase for details dialog
  const selectedPurchase = selectedPurchaseId
    ? purchases.find((p) => p.id === selectedPurchaseId)
    : null;

  // Convert purchase to the format expected by PurchaseDetailsDialog
  const purchaseForDetails = selectedPurchase
    ? {
        id: selectedPurchase.id,
        name: selectedPurchase.name,
        totalValue: selectedPurchase.totalValue,
        installments: selectedPurchase.totalInstallments,
        installmentValue: selectedPurchase.installmentValue,
        purchaseDate: new Date(selectedPurchase.purchaseDate),
        installmentsList: Array.from(
          { length: selectedPurchase.totalInstallments },
          (_, i) => {
            // Create a date for each installment (one month apart)
            const purchaseDate = new Date(selectedPurchase.purchaseDate);
            const dueDate = new Date(purchaseDate);
            dueDate.setMonth(purchaseDate.getMonth() + i);

            return {
              number: i + 1,
              value: selectedPurchase.installmentValue,
              dueDate,
              paid: i < selectedPurchase.paidInstallments,
            };
          },
        ),
      }
    : undefined;

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-slate-900">
      <Header
        onOpenSettings={handleOpenSettings}
        onMonthChange={handleMonthChange}
        selectedMonth={selectedMonth}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <MonthlyTotalCard month={displayMonth} totalAmount={monthlyTotal} />

        <PurchaseList
          purchases={purchases}
          selectedMonth={displayMonth}
          onViewDetails={handleViewPurchaseDetails}
          onEdit={handleEditPurchase}
          onDelete={handleDeletePurchase}
          onMarkPaid={handleMarkPaid}
          onAddPurchase={handleOpenPurchaseForm}
        />
      </div>

      {/* Floating action button */}
      <AddPurchaseButton onPurchaseAdded={handleOpenPurchaseForm} />

      {/* Dialogs */}
      <PurchaseFormDialog
        open={isPurchaseFormOpen}
        onOpenChange={setIsPurchaseFormOpen}
        onSubmit={(data) => {
          // In a real app, this would add or update a purchase
          console.log("Form submitted:", data);
          setIsPurchaseFormOpen(false);
        }}
        mode={selectedPurchaseId ? "edit" : "add"}
      />

      <PurchaseDetailsDialog
        open={isPurchaseDetailsOpen}
        onOpenChange={setIsPurchaseDetailsOpen}
        purchase={purchaseForDetails}
        onMarkAsPaid={(purchaseId, installmentNumber) => {
          // In a real app, this would mark a specific installment as paid
          console.log(
            `Marking installment ${installmentNumber} as paid for purchase ${purchaseId}`,
          );
        }}
        onClose={() => setIsPurchaseDetailsOpen(false)}
      />

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onExportData={() => console.log("Exporting data to CSV")}
        onBackupData={() => console.log("Creating backup")}
        onRestoreData={() => console.log("Restoring from backup")}
      />

      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Excluir compra"
        description="Tem certeza que deseja excluir esta compra? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </main>
  );
}
