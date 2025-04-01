"use client";

import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  Purchase,
  Installment,
  setupSupabaseTables,
} from "./supabaseClient";

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all purchases
  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure tables exist
      await setupSupabaseTables();

      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .order("purchaseDate", { ascending: false });

      if (error) throw error;

      setPurchases(data || []);
    } catch (err) {
      console.error("Error fetching purchases:", err);
      setError("Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new purchase
  const addPurchase = useCallback(
    async (purchaseData: Omit<Purchase, "id">) => {
      try {
        setLoading(true);
        setError(null);

        // Insert the purchase
        const { data, error } = await supabase
          .from("purchases")
          .insert(purchaseData)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error("No data returned from insert");

        // Create installments for this purchase
        const installments: Omit<Installment, "id" | "created_at">[] = [];
        for (let i = 1; i <= purchaseData.totalInstallments; i++) {
          // Calculate due date (i-1 months from purchase date)
          const purchaseDate = new Date(purchaseData.purchaseDate);
          const dueDate = new Date(purchaseDate);
          dueDate.setMonth(purchaseDate.getMonth() + (i - 1));

          installments.push({
            purchase_id: data.id,
            number: i,
            value: purchaseData.installmentValue,
            dueDate: dueDate.toISOString().split("T")[0],
            paid: i <= purchaseData.paidInstallments,
          });
        }

        // Insert all installments
        const { error: installmentsError } = await supabase
          .from("installments")
          .insert(installments);

        if (installmentsError) throw installmentsError;

        // Update local state
        setPurchases((prev) => [data, ...prev]);
        return data;
      } catch (err) {
        console.error("Error adding purchase:", err);
        setError("Failed to add purchase");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Update an existing purchase
  const updatePurchase = useCallback(
    async (id: string, purchaseData: Partial<Purchase>) => {
      try {
        setLoading(true);
        setError(null);

        // Update the purchase
        const { data, error } = await supabase
          .from("purchases")
          .update(purchaseData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error("No data returned from update");

        // If installments changed, we need to recreate them
        if (
          purchaseData.totalInstallments ||
          purchaseData.installmentValue ||
          purchaseData.purchaseDate
        ) {
          // First, get the full purchase data
          const { data: fullPurchase, error: fetchError } = await supabase
            .from("purchases")
            .select("*")
            .eq("id", id)
            .single();

          if (fetchError) throw fetchError;
          if (!fullPurchase) throw new Error("Purchase not found");

          // Delete existing installments
          const { error: deleteError } = await supabase
            .from("installments")
            .delete()
            .eq("purchase_id", id);

          if (deleteError) throw deleteError;

          // Create new installments
          const installments: Omit<Installment, "id" | "created_at">[] = [];
          for (let i = 1; i <= fullPurchase.totalInstallments; i++) {
            // Calculate due date (i-1 months from purchase date)
            const purchaseDate = new Date(fullPurchase.purchaseDate);
            const dueDate = new Date(purchaseDate);
            dueDate.setMonth(purchaseDate.getMonth() + (i - 1));

            installments.push({
              purchase_id: id,
              number: i,
              value: fullPurchase.installmentValue,
              dueDate: dueDate.toISOString().split("T")[0],
              paid: i <= fullPurchase.paidInstallments,
            });
          }

          // Insert all installments
          const { error: installmentsError } = await supabase
            .from("installments")
            .insert(installments);

          if (installmentsError) throw installmentsError;
        }

        // Update local state
        setPurchases((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...purchaseData } : p)),
        );
        return data;
      } catch (err) {
        console.error("Error updating purchase:", err);
        setError("Failed to update purchase");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Delete a purchase
  const deletePurchase = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Delete the purchase (installments will be deleted via cascade)
      const { error } = await supabase.from("purchases").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      setPurchases((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting purchase:", err);
      setError("Failed to delete purchase");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark an installment as paid
  const markInstallmentPaid = useCallback(
    async (
      purchaseId: string,
      installmentNumber: number,
      paid: boolean = true,
    ) => {
      try {
        setLoading(true);
        setError(null);

        // Update the installment
        const { error } = await supabase
          .from("installments")
          .update({ paid })
          .eq("purchase_id", purchaseId)
          .eq("number", installmentNumber);

        if (error) throw error;

        // Get the current purchase
        const { data: purchase, error: fetchError } = await supabase
          .from("purchases")
          .select("*")
          .eq("id", purchaseId)
          .single();

        if (fetchError) throw fetchError;
        if (!purchase) throw new Error("Purchase not found");

        // Count paid installments
        const { count, error: countError } = await supabase
          .from("installments")
          .select("*", { count: "exact", head: true })
          .eq("purchase_id", purchaseId)
          .eq("paid", true);

        if (countError) throw countError;

        // Update the purchase with the new paid installments count
        const { data, error: updateError } = await supabase
          .from("purchases")
          .update({ paidInstallments: count || 0 })
          .eq("id", purchaseId)
          .select()
          .single();

        if (updateError) throw updateError;
        if (!data) throw new Error("No data returned from update");

        // Update local state
        setPurchases((prev) =>
          prev.map((p) => (p.id === purchaseId ? data : p)),
        );
        return data;
      } catch (err) {
        console.error("Error marking installment as paid:", err);
        setError("Failed to mark installment as paid");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Mark next installment as paid (simpler version used in the UI)
  const markNextInstallmentPaid = useCallback(
    async (purchaseId: string) => {
      try {
        setLoading(true);
        setError(null);

        // Get the purchase
        const { data: purchase, error: fetchError } = await supabase
          .from("purchases")
          .select("*")
          .eq("id", purchaseId)
          .single();

        if (fetchError) throw fetchError;
        if (!purchase) throw new Error("Purchase not found");

        // Check if all installments are already paid
        if (purchase.paidInstallments >= purchase.totalInstallments) {
          return purchase; // All installments already paid
        }

        // Find the next unpaid installment
        const nextInstallmentNumber = purchase.paidInstallments + 1;

        // Mark it as paid
        const result = await markInstallmentPaid(
          purchaseId,
          nextInstallmentNumber,
        );
        return result;
      } catch (err) {
        console.error("Error marking next installment as paid:", err);
        setError("Failed to mark next installment as paid");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [markInstallmentPaid],
  );

  // Fetch installments for a specific purchase
  const fetchInstallments = useCallback(async (purchaseId: string) => {
    try {
      const { data, error } = await supabase
        .from("installments")
        .select("*")
        .eq("purchase_id", purchaseId)
        .order("number");

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching installments:", err);
      setError("Failed to fetch installments");
      return [];
    }
  }, []);

  // Load purchases on component mount
  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    purchases,
    loading,
    error,
    fetchPurchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    markInstallmentPaid,
    markNextInstallmentPaid,
    fetchInstallments,
  };
}
