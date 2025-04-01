"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import PurchaseList from "@/components/PurchaseList";
import MonthlyTotalCard from "@/components/MonthlyTotalCard";
import AddPurchaseButton from "@/components/AddPurchaseButton";
import PurchaseFormDialog from "@/components/PurchaseFormDialog";
import PurchaseDetailsDialog from "@/components/PurchaseDetailsDialog";
import SettingsDialog from "@/components/SettingsDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { usePurchases } from "@/lib/usePurchases";

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

  // Use the custom hook to manage purchases
  const {
    purchases,
    loading,
    error,
    addPurchase,
    updatePurchase,
    deletePurchase,
    markNextInstallmentPaid,
    fetchInstallments,
  } = usePurchases();

  // State for installments of the selected purchase
  const [selectedPurchaseInstallments, setSelectedPurchaseInstallments] =
    useState<any[]>([]);

  // Handlers for dialogs
  const handleOpenSettings = () => setIsSettingsOpen(true);
  const handleOpenPurchaseForm = () => setIsPurchaseFormOpen(true);

  const handleViewPurchaseDetails = async (id: string) => {
    setSelectedPurchaseId(id);

    // Fetch installments for this purchase
    const installments = await fetchInstallments(id);
    setSelectedPurchaseInstallments(installments);

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

  const handleConfirmDelete = async () => {
    if (selectedPurchaseId) {
      const success = await deletePurchase(selectedPurchaseId);
      if (success) {
        setIsConfirmDeleteOpen(false);
        setSelectedPurchaseId(null);
      }
    }
  };

  const handleMarkPaid = async (id: string) => {
    await markNextInstallmentPaid(id);
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
        installmentsList:
          selectedPurchaseInstallments.length > 0
            ? selectedPurchaseInstallments.map((inst) => ({
                number: inst.number,
                value: inst.value,
                dueDate: new Date(inst.dueDate),
                paid: inst.paid,
              }))
            : Array.from(
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

  // Handle form submission for adding/editing purchases
  const handleFormSubmit = async (data: any) => {
    try {
      // Calculate installment value
      const installmentValue =
        parseFloat(data.totalValue) / parseInt(data.installments);

      if (selectedPurchaseId) {
        // Update existing purchase
        await updatePurchase(selectedPurchaseId, {
          name: data.name,
          totalValue: parseFloat(data.totalValue),
          installmentValue,
          totalInstallments: parseInt(data.installments),
          purchaseDate: data.purchaseDate.toISOString().split("T")[0],
        });
      } else {
        // Add new purchase
        await addPurchase({
          name: data.name,
          totalValue: parseFloat(data.totalValue),
          installmentValue,
          totalInstallments: parseInt(data.installments),
          paidInstallments: 0,
          purchaseDate: data.purchaseDate.toISOString().split("T")[0],
        });
      }

      setIsPurchaseFormOpen(false);
      setSelectedPurchaseId(null);
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  // Handle marking an installment as paid in the details dialog
  const handleMarkInstallmentPaid = async (
    purchaseId: string,
    installmentNumber: number,
  ) => {
    try {
      // Get the current purchase
      const purchase = purchases.find((p) => p.id === purchaseId);
      if (!purchase) return;

      // Find the installment in our local state
      const installment = selectedPurchaseInstallments.find(
        (i) => i.number === installmentNumber,
      );
      if (!installment) return;

      // Toggle the paid status
      const newPaidStatus = !installment.paid;

      // Update in Supabase
      await markNextInstallmentPaid(purchaseId);

      // Refresh installments
      const updatedInstallments = await fetchInstallments(purchaseId);
      setSelectedPurchaseInstallments(updatedInstallments);
    } catch (err) {
      console.error("Error marking installment as paid:", err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-slate-900">
      <Header
        onOpenSettings={handleOpenSettings}
        onMonthChange={handleMonthChange}
        selectedMonth={selectedMonth}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-8">Carregando compras...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Floating action button */}
      <AddPurchaseButton onPurchaseAdded={handleOpenPurchaseForm} />

      {/* Dialogs */}
      <PurchaseFormDialog
        open={isPurchaseFormOpen}
        onOpenChange={setIsPurchaseFormOpen}
        onSubmit={handleFormSubmit}
        initialData={
          selectedPurchaseId && selectedPurchase
            ? {
                name: selectedPurchase.name,
                totalValue: selectedPurchase.totalValue.toString(),
                installments: selectedPurchase.totalInstallments.toString(),
                purchaseDate: new Date(selectedPurchase.purchaseDate),
              }
            : undefined
        }
        mode={selectedPurchaseId ? "edit" : "add"}
      />

      <PurchaseDetailsDialog
        open={isPurchaseDetailsOpen}
        onOpenChange={setIsPurchaseDetailsOpen}
        purchase={purchaseForDetails}
        onMarkAsPaid={handleMarkInstallmentPaid}
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
