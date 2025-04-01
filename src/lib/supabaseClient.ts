import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Purchase = {
  id: string;
  name: string;
  totalValue: number;
  installmentValue: number;
  totalInstallments: number;
  paidInstallments: number;
  purchaseDate: string;
  created_at?: string;
};

export type Installment = {
  id: string;
  purchase_id: string;
  number: number;
  value: number;
  dueDate: string;
  paid: boolean;
  created_at?: string;
};

export async function setupSupabaseTables() {
  // Create purchases table if it doesn't exist
  const { error: purchasesError } = await supabase.rpc(
    "create_purchases_table_if_not_exists",
  );
  if (purchasesError) {
    console.error("Error creating purchases table:", purchasesError);

    // Try to create the table directly if the RPC function doesn't exist
    const { error: createTableError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        totalValue NUMERIC NOT NULL,
        installmentValue NUMERIC NOT NULL,
        totalInstallments INTEGER NOT NULL,
        paidInstallments INTEGER NOT NULL DEFAULT 0,
        purchaseDate DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    if (createTableError) {
      console.error(
        "Error creating purchases table directly:",
        createTableError,
      );
    }
  }

  // Create installments table if it doesn't exist
  const { error: installmentsError } = await supabase.rpc(
    "create_installments_table_if_not_exists",
  );
  if (installmentsError) {
    console.error("Error creating installments table:", installmentsError);

    // Try to create the table directly if the RPC function doesn't exist
    const { error: createTableError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS installments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
        number INTEGER NOT NULL,
        value NUMERIC NOT NULL,
        dueDate DATE NOT NULL,
        paid BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(purchase_id, number)
      );
    `);

    if (createTableError) {
      console.error(
        "Error creating installments table directly:",
        createTableError,
      );
    }
  }
}
