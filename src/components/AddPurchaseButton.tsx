"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import PurchaseFormDialog from "./PurchaseFormDialog";

interface AddPurchaseButtonProps {
  onPurchaseAdded?: () => void;
}

const AddPurchaseButton = ({
  onPurchaseAdded = () => {},
}: AddPurchaseButtonProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handlePurchaseSaved = (data: any) => {
    handleCloseForm();
    onPurchaseAdded();
    console.log("Purchase saved:", data);
  };

  return (
    <>
      <Button
        onClick={handleOpenForm}
        className="fixed bottom-6 right-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 h-14 w-14 p-0"
        aria-label="Add new purchase"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <PurchaseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handlePurchaseSaved}
        mode="add"
      />
    </>
  );
};

export default AddPurchaseButton;
