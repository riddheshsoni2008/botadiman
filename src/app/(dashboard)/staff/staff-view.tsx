"use client";

import { useState } from "react";
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

export function StaffView({ initialStaff }: { initialStaff: any[] }) {
  const [staff, setStaff] = useState<any[]>(initialStaff || []);
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

  async function reloadStaff() {
    const res = await getStaffMembers();
    if (res.success && res.data) setStaff(res.data);
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
      await reloadStaff();
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
      await reloadStaff();
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
        <Button onClick={openAdd} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      {staff.length === 0 ? (
        <Card className="py-16 text-center rounded-2xl">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-500/10">
              <Users className="h-7 w-7 text-violet-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No staff members added yet</p>
            <Button size="sm" onClick={openAdd} className="mt-2 gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> Add First Staff Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => (
            <Card key={s._id} className="hover:border-violet-200 dark:hover:border-violet-500/30 transition-all rounded-2xl">
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
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="h-8 w-8 rounded-lg">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id)} className="h-8 w-8 text-rose-500 hover:text-rose-700 rounded-lg">
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editId ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Full Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Staff name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Role *</label>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {Object.entries(roleLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Charge / Rate (₹)</label>
              <Input
                type="number"
                value={form.dailyRate || ""}
                onChange={(e) => setForm({ ...form, dailyRate: Number(e.target.value) })}
                placeholder="Rate per event"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Specialization / Notes</label>
            <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Candid, Drone 4K, Reels" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">Active member</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editId ? "Update" : "Add Staff"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
