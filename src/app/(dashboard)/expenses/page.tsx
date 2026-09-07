import { getExpenses } from "@/actions/expenses";
import { ExpensesView } from "./expenses-view";

export default async function ExpensesPage() {
  const res = await getExpenses();
  const initialExpenses = res.success && res.data ? res.data : [];

  return <ExpensesView initialExpenses={initialExpenses} />;
}
