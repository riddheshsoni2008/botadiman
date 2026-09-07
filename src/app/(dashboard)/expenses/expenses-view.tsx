"use client";

import { useState } from "react";
import { getExpenses, addExpense, deleteExpense } from "@/actions/expenses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, DollarSign, Loader2 } from "lucide-react";

export function ExpensesView({ initialExpenses }: { initialExpenses: any[] }) {
  const [expenses, setExpenses] = useState<any[]>(initialExpenses || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    items: [{ category: "", amount: 0, note: "" }],
  });

  async function reloadExpenses() {
    const res = await getExpenses();
    if (res.success && res.data) setExpenses(res.data);
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { category: "", amount: 0, note: "" }] });
  }

  function removeItem(index: number) {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = [...form.items];
    (updated[index] as any)[field] = value;
    setForm({ ...form, items: updated });
  }

  async function handleSave() {
    const validItems = form.items.filter((i) => i.category && i.amount > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one expense item");
      return;
    }
    setSaving(true);
    const res = await addExpense({ date: form.date, items: validItems });
    if (res.success) {
      toast.success("Expense added");
      setDialogOpen(false);
      setForm({ date: new Date().toISOString().slice(0, 10), items: [{ category: "", amount: 0, note: "" }] });
      await reloadExpenses();
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    const res = await deleteExpense(id);
    if (res.success) {
      toast.success("Expense deleted");
      await reloadExpenses();
    } else {
      toast.error(res.error);
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track studio expenses • Total: <span className="font-semibold text-rose-600">{formatCurrency(totalExpenses)}</span>
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <Card className="py-16 text-center rounded-2xl">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10">
              <DollarSign className="h-7 w-7 text-rose-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No expenses recorded yet</p>
            <Button size="sm" onClick={() => setDialogOpen(true)} className="mt-2 gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> Add First Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e._id}>
                  <TableCell className="font-medium">{formatDate(e.date)}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {e.items.map((item: any) => (
                        <div key={item._id} className="text-xs">
                          <span className="font-semibold">{item.category}</span>
                          {item.note && <span className="text-slate-400"> — {item.note}</span>}
                          <span className="ml-2 text-rose-600 font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-rose-600">{formatCurrency(e.totalAmount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(e._id)} className="h-8 w-8 text-rose-500 hover:text-rose-700 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Date</label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Expense Items</label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1 text-xs rounded-lg">
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>
            {form.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input value={item.category} onChange={(e) => updateItem(index, "category", e.target.value)} placeholder="Category (e.g. Travel)" />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min={0}
                    placeholder="₹0"
                    value={item.amount === 0 ? "" : item.amount}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateItem(index, "amount", v === "" ? 0 : parseFloat(v) || 0);
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="flex-1">
                  <Input value={item.note} onChange={(e) => updateItem(index, "note", e.target.value)} placeholder="Note (optional)" />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="h-10 w-10 text-rose-500 rounded-lg" disabled={form.items.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="text-right font-bold text-sm">
            Total: <span className="text-rose-600">{formatCurrency(form.items.reduce((s, i) => s + (i.amount || 0), 0))}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add Expense
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
