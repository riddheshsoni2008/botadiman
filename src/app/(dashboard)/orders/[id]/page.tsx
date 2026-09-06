"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOrder, updateOrderStatus, assignStaffToOrder, deleteOrder, updateOrderPayment } from "@/actions/orders";
import { getStaffMembers } from "@/actions/staff";
import { getStudioSettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateEstimatePDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileDown,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  Play,
  XCircle,
  Trash2,
  UserPlus,
  CreditCard,
} from "lucide-react";

const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  estimate: "default",
  confirmed: "success",
  in_progress: "warning",
  completed: "success",
  cancelled: "destructive",
};

const paymentBadgeConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" }> = {
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partially Paid", variant: "warning" },
  unpaid: { label: "Unpaid", variant: "destructive" },
};

const eventLabels: Record<string, string> = {
  wedding: "Wedding",
  pre_wedding: "Pre-Wedding",
  engagement: "Engagement",
  birthday: "Birthday",
  corporate: "Corporate",
  other: "Other",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentInput, setPaymentInput] = useState("");
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [studioSettings, setStudioSettings] = useState<any>(null);

  useEffect(() => {
    loadOrder();
    loadStudioSettings();
  }, []);

  function openPaymentDialog() {
    setPaymentInput(order?.advancePayment ? String(order.advancePayment) : "");
    setPaymentDialogOpen(true);
  }

  async function handleUpdatePayment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const amount = paymentInput === "" ? 0 : parseFloat(paymentInput);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid positive payment amount");
      return;
    }
    setActionLoading(true);
    const res = await updateOrderPayment(id, amount);
    if (res.success) {
      toast.success("Payment details updated successfully");
      setPaymentDialogOpen(false);
      await loadOrder();
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  }

  async function loadOrder() {
    setLoading(true);
    const res = await getOrder(id);
    if (res.success && res.data) {
      setOrder(res.data);
      setSelectedStaff(res.data.assignedStaff.map((a: any) => a.staff));
    } else {
      toast.error("Order not found");
      router.push("/orders");
    }
    setLoading(false);
  }

  async function loadStudioSettings() {
    const res = await getStudioSettings();
    if (res.success) setStudioSettings(res.data);
  }

  async function handleStatusChange(newStatus: string) {
    if (newStatus === "in_progress") {
      const totalReq = order?.services?.reduce((sum: number, s: any) => sum + (s.quantity || 1), 0) || 0;
      const assigned = order?.assignedStaff?.length || 0;
      if (assigned < totalReq) {
        const remaining = totalReq - assigned;
        toast.error(`Cannot start work: ${remaining} more staff member(s) must be assigned to fulfill all ${totalReq} booked services.`);
        openStaffDialog();
        return;
      }
    }

    setActionLoading(true);
    const res = await updateOrderStatus(id, newStatus);
    if (res.success) {
      toast.success(`Order ${newStatus.replace("_", " ")}`);
      await loadOrder();
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setActionLoading(true);
    const res = await deleteOrder(id);
    if (res.success) {
      toast.success("Order deleted");
      router.push("/orders");
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  }

  async function openStaffDialog() {
    const res = await getStaffMembers();
    if (res.success && res.data) setAllStaff(res.data.filter((s: any) => s.isActive));
    setStaffDialogOpen(true);
  }

  function toggleStaff(staffId: string) {
    setSelectedStaff((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]
    );
  }

  async function handleAssignStaff() {
    const assignments = selectedStaff.map((staffId) => {
      const s = allStaff.find((s) => s._id === staffId);
      return {
        staffId,
        name: s?.name || "",
        role: s?.role || "",
        serviceSlot: "",
      };
    });

    setActionLoading(true);
    const res = await assignStaffToOrder(id, assignments);
    if (res.success) {
      toast.success("Staff assigned");
      setStaffDialogOpen(false);
      await loadOrder();
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  }

  function handleExportPDF() {
    if (!order) return;
    generateEstimatePDF(order, studioSettings || "Botadi Studio");
    toast.success("PDF downloaded!");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!order) return null;

  const statusActions = {
    estimate: [
      { label: "Confirm Order", status: "confirmed", icon: CheckCircle2, variant: "success" as const },
      { label: "Cancel", status: "cancelled", icon: XCircle, variant: "destructive" as const },
    ],
    confirmed: [
      { label: "Start Work", status: "in_progress", icon: Play, variant: "default" as const },
      { label: "Cancel", status: "cancelled", icon: XCircle, variant: "destructive" as const },
    ],
    in_progress: [
      { label: "Mark Completed", status: "completed", icon: CheckCircle2, variant: "success" as const },
    ],
    completed: [],
    cancelled: [],
  };

  const totalRequiredStaff = order.services?.reduce((sum: number, s: any) => sum + (s.quantity || 1), 0) || 0;
  const assignedStaffCount = order.assignedStaff?.length || 0;
  const isFullyStaffed = assignedStaffCount >= totalRequiredStaff;
  const pendingStaffCount = Math.max(0, totalRequiredStaff - assignedStaffCount);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{order.orderNumber}</h1>
              <Badge variant={statusVariants[order.status]}>{order.status.replace("_", " ")}</Badge>
              <Badge
                variant={paymentBadgeConfig[order.paymentStatus]?.variant || "destructive"}
                className="gap-1 shadow-sm font-medium"
              >
                <CreditCard className="h-3 w-3" />
                {paymentBadgeConfig[order.paymentStatus]?.label || "Unpaid"}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{order.clientName}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
            <FileDown className="h-4 w-4" /> Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openPaymentDialog}
            className="gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <CreditCard className="h-4 w-4" /> Update Payment
          </Button>
          <Button variant="outline" size="sm" onClick={openStaffDialog} className="gap-1.5">
            <UserPlus className="h-4 w-4" /> Assign Staff
          </Button>
          {(statusActions[order.status as keyof typeof statusActions] || []).map((action) => {
            const Icon = action.icon;
            const isStartWork = action.status === "in_progress";
            return (
              <Button
                key={action.status}
                variant={action.variant === "success" ? "success" : action.variant === "destructive" ? "destructive" : "default"}
                size="sm"
                onClick={() => handleStatusChange(action.status)}
                disabled={actionLoading}
                className={`gap-1.5 ${isStartWork && !isFullyStaffed ? "border border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20" : ""}`}
                title={isStartWork && !isFullyStaffed ? `Assign ${pendingStaffCount} more staff member(s) to enable Start Work` : undefined}
              >
                <Icon className="h-4 w-4" />
                {action.label}
                {isStartWork && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isFullyStaffed ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}>
                    {assignedStaffCount}/{totalRequiredStaff}
                  </span>
                )}
              </Button>
            );
          })}
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-rose-500 hover:text-rose-700 gap-1.5">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Client + Event Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{order.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="h-4 w-4 text-slate-400" /> {order.clientPhone}
            </div>
            {order.clientEmail && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4 text-slate-400" /> {order.clientEmail}
              </div>
            )}
            {order.clientAddress && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{order.clientAddress}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default">
                {order.eventType === "other" && order.customEventType
                  ? order.customEventType
                  : eventLabels[order.eventType] || order.eventType}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatDate(order.eventDate)}
              {order.eventEndDate && ` — ${formatDate(order.eventEndDate)}`}
            </div>
            {order.venue && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-slate-400" /> {order.venue}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <Card>
        <CardHeader><CardTitle>Services / Resources</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase text-slate-500">Service</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase text-slate-500">Qty</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase text-slate-500">Rate</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.services.map((s: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-center">{s.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(s.rate)} / {s.rateUnit === "per_day" ? "day" : "event"}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/30 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
              <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Discount</span>
                <span className="text-rose-600 font-semibold">- {formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-indigo-200/60 dark:border-indigo-800/60 pt-2">
              <span>Total Amount</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(order.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-sm pt-2 border-t border-dashed border-indigo-200/60 dark:border-indigo-800/60">
              <span className="text-slate-600 dark:text-slate-400">Advance / Amount Paid</span>
              <span className="text-emerald-600 font-semibold">
                {order.advancePayment > 0 ? `- ${formatCurrency(order.advancePayment)}` : "₹0"}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold items-center">
              <span>Balance Due</span>
              {order.balanceAmount > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold">{formatCurrency(order.balanceAmount)}</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 font-semibold">
                  ✓ PAID IN FULL
                </span>
              )}
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-indigo-200/60 dark:border-indigo-800/60">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Payment Status:</span>
                <Badge
                  variant={paymentBadgeConfig[order.paymentStatus]?.variant || "destructive"}
                  className="text-xs font-semibold"
                >
                  {paymentBadgeConfig[order.paymentStatus]?.label || "Unpaid"}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={openPaymentDialog}
                className="h-7 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 gap-1 font-medium cursor-pointer"
              >
                <CreditCard className="h-3.5 w-3.5" /> Edit Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Staff */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-500" /> Assigned Staff
            </CardTitle>
            <Badge variant={isFullyStaffed ? "success" : "warning"} className="text-xs font-semibold">
              {isFullyStaffed
                ? `✅ Ready (${assignedStaffCount}/${totalRequiredStaff})`
                : `⚠️ ${pendingStaffCount} Needed (${assignedStaffCount}/${totalRequiredStaff})`}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={openStaffDialog} className="gap-1">
            <UserPlus className="h-3.5 w-3.5" /> Manage
          </Button>
        </CardHeader>
        <CardContent>
          {!isFullyStaffed && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-700 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">⚠️</span>
                <span>
                  Booked services require <strong>{totalRequiredStaff} staff members</strong>. Please assign <strong>{pendingStaffCount} more</strong> to enable <em>Start Work</em>.
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={openStaffDialog}
                className="h-7 text-xs border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 shrink-0"
              >
                Assign Now
              </Button>
            </div>
          )}

          {order.assignedStaff.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No staff assigned yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {order.assignedStaff.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-bold text-sm">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{s.role.replace("_", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Assign Staff Dialog */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>Assign Staff to Order</DialogTitle>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                selectedStaff.length >= totalRequiredStaff
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {selectedStaff.length} / {totalRequiredStaff} Staff Selected
            </span>
          </div>
        </DialogHeader>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          This order has <strong>{totalRequiredStaff} required service slot(s)</strong>. Select {totalRequiredStaff} staff member(s) to fulfill requirements and enable <em>Start Work</em>.
        </p>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {allStaff.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No staff members found. <Link href="/staff" className="text-indigo-600 hover:underline">Add staff first</Link>
            </p>
          ) : (
            allStaff.map((s) => (
              <label
                key={s._id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStaff.includes(s._id)
                    ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500/30"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedStaff.includes(s._id)}
                  onChange={() => toggleStaff(s._id)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                  <p className="text-xs text-slate-400 capitalize">
                    {s.role.replace("_", " ")}
                    {s.dailyRate > 0 && ` • ${formatCurrency(s.dailyRate)}`}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setStaffDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignStaff} disabled={actionLoading}>
            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Assignments
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Update Payment Details
          </DialogTitle>
          <DialogDescription>
            Record advance payment, add payments received, or mark order as paid.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdatePayment} className="space-y-4 py-2">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Total Order Amount:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Currently Paid:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(order.advancePayment || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Current Balance:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(order.balanceAmount || 0)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paid Amount / Advance (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={paymentInput}
              onChange={(e) => setPaymentInput(e.target.value)}
              placeholder="Enter amount paid"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPaymentInput(String(order.totalAmount))}
              className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex-1 cursor-pointer"
            >
              Full Payment ({formatCurrency(order.totalAmount)})
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPaymentInput("0")}
              className="text-xs text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            >
              Reset (₹0)
            </Button>
          </div>

          {/* New balance preview */}
          {paymentInput !== "" && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex justify-between items-center text-indigo-700 dark:text-indigo-300">
              <span className="font-medium">New Remaining Balance:</span>
              <span className="font-bold text-sm">
                {formatCurrency(Math.max(0, order.totalAmount - (parseFloat(paymentInput) || 0)))}
              </span>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading} className="gap-2">
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Payment
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
