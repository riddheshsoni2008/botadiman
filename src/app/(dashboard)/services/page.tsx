"use client";

import { useState, useEffect } from "react";
import { getServiceTypes, createServiceType, updateServiceType, deleteServiceType } from "@/actions/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Wrench, Loader2 } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    rate: 0,
    rateUnit: "per_event" as string,
    description: "",
    isActive: true,
  });

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    setLoading(true);
    const res = await getServiceTypes();
    if (res.success && res.data) setServices(res.data);
    setLoading(false);
  }

  function openAdd() {
    setEditId(null);
    setForm({ name: "", rate: 0, rateUnit: "per_event", description: "", isActive: true });
    setDialogOpen(true);
  }

  function openEdit(s: any) {
    setEditId(s._id);
    setForm({ name: s.name, rate: s.rate, rateUnit: s.rateUnit, description: s.description, isActive: s.isActive });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = editId
      ? await updateServiceType(editId, form)
      : await createServiceType(form);
    if (res.success) {
      toast.success(editId ? "Service updated" : "Service added");
      setDialogOpen(false);
      await loadServices();
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service type?")) return;
    const res = await deleteServiceType(id);
    if (res.success) {
      toast.success("Service deleted");
      await loadServices();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services & Rates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure your service types and pricing</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
      ) : services.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
              <Wrench className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No services configured yet</p>
            <Button size="sm" onClick={openAdd} className="mt-2 gap-2">
              <Plus className="h-4 w-4" /> Add First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s._id}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                    {s.description && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-bold">{formatCurrency(s.rate)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{s.rateUnit === "per_day" ? "Per Day" : "Per Event"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? "success" : "secondary"}>
                    {s.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id)} className="h-8 w-8 text-rose-500 hover:text-rose-700">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editId ? "Edit Service" : "Add Service Type"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Service Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Camera Photography" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Rate (₹) *</label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={form.rate === 0 ? "" : form.rate}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, rate: v === "" ? 0 : parseFloat(v) || 0 });
                }}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Rate Unit</label>
              <Select value={form.rateUnit} onChange={(e) => setForm({ ...form, rateUnit: e.target.value })}>
                <option value="per_event">Per Event</option>
                <option value="per_day">Per Day</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editId ? "Update" : "Add Service"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
