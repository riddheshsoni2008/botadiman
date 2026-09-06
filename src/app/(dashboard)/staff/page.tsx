"use client";

import { useState, useEffect } from "react";
import { getStaffMembers, createStaff, updateStaff, deleteStaff } from "@/actions/staff";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  photographer: "Photographer",
  cinematographer: "Cinematographer",
  videographer: "Videographer",
  drone_operator: "Drone Operator",
  editor: "Editor",
  assistant: "Assistant",
  other: "Other",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "photographer" as string,
    specialization: "",
    dailyRate: 0,
    isActive: true,
  });

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setLoading(true);
    const res = await getStaffMembers();
    if (res.success && res.data) setStaff(res.data);
    setLoading(false);
  }

  function openAdd() {
    setEditId(null);
    setForm({ name: "", phone: "", email: "", role: "photographer", specialization: "", dailyRate: 0, isActive: true });
    setDialogOpen(true);
  }

  function openEdit(s: any) {
    setEditId(s._id);
    setForm({ name: s.name, phone: s.phone, email: s.email, role: s.role, specialization: s.specialization, dailyRate: s.dailyRate || 0, isActive: s.isActive });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = editId
      ? await updateStaff(editId, form)
      : await createStaff(form);
    if (res.success) {
      toast.success(editId ? "Staff updated" : "Staff added");
      setDialogOpen(false);
      await loadStaff();
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this staff member?")) return;
    const res = await deleteStaff(id);
    if (res.success) {
      toast.success("Staff deleted");
      await loadStaff();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff / Team</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your studio team members</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-500/10">
              <Users className="h-7 w-7 text-violet-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No staff members added yet</p>
            <Button size="sm" onClick={openAdd} className="mt-2 gap-2">
              <Plus className="h-4 w-4" /> Add First Staff Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => (
            <Card key={s._id} className="hover:border-violet-200 dark:hover:border-violet-500/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-sm shadow-sm">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{s.name}</p>
                      <Badge variant={s.isActive ? "success" : "secondary"} className="text-[10px] mt-0.5">
                        {roleLabels[s.role] || s.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id)} className="h-8 w-8 text-rose-500 hover:text-rose-700">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {(s.phone || s.email) && (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                    {s.phone && <p>📱 {s.phone}</p>}
                    {s.email && <p>✉️ {s.email}</p>}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Charge / Rate:</span>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1 rounded-md">
                    {s.dailyRate > 0 ? `${formatCurrency(s.dailyRate)} / event` : "₹0"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editId ? "Edit Staff" : "Add Staff Member"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Staff name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Role *</label>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Charge / Rate (₹)</label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={form.dailyRate === 0 ? "" : form.dailyRate}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, dailyRate: val === "" ? 0 : parseFloat(val) || 0 });
                }}
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Specialization</label>
            <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Wedding specialist" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editId ? "Update" : "Add Staff"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
