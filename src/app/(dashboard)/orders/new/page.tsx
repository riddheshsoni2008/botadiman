"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/orders";
import { getServiceTypes } from "@/actions/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface ServiceRow {
  serviceTypeId: string;
  name: string;
  quantity: number;
  rate: number;
  rateUnit: "per_event" | "per_day";
  total: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    eventType: "wedding" as string,
    customEventType: "",
    eventDate: "",
    eventEndDate: "",
    venue: "",
    discount: 0,
    advancePayment: 0,
    notes: "",
    status: "estimate" as string,
  });

  const [services, setServices] = useState<ServiceRow[]>([
    { serviceTypeId: "", name: "", quantity: 1, rate: 0, rateUnit: "per_event", total: 0 },
  ]);

  useEffect(() => {
    (async () => {
      const res = await getServiceTypes();
      if (res.success && res.data) setServiceTypes(res.data);
    })();
  }, []);

  function addServiceRow() {
    setServices([...services, { serviceTypeId: "", name: "", quantity: 1, rate: 0, rateUnit: "per_event", total: 0 }]);
  }

  function removeServiceRow(index: number) {
    if (services.length <= 1) return;
    setServices(services.filter((_, i) => i !== index));
  }

  function updateServiceRow(index: number, field: string, value: any) {
    const updated = [...services];
    if (field === "serviceTypeId") {
      if (value === "other") {
        updated[index] = {
          ...updated[index],
          serviceTypeId: "other",
          name: "",
          rate: 0,
          rateUnit: "per_event",
          total: 0,
        };
      } else {
        const st = serviceTypes.find((s) => s._id === value);
        if (st) {
          updated[index] = {
            ...updated[index],
            serviceTypeId: value,
            name: st.name,
            rate: st.rate,
            rateUnit: st.rateUnit,
            total: updated[index].quantity * st.rate,
          };
        } else {
          updated[index] = {
            ...updated[index],
            serviceTypeId: "",
            name: "",
            rate: 0,
            rateUnit: "per_event",
            total: 0,
          };
        }
      }
    } else {
      (updated[index] as any)[field] = value;
      updated[index].total = (updated[index].quantity || 0) * (updated[index].rate || 0);
    }
    setServices(updated);
  }

  const subtotal = services.reduce((sum, s) => sum + s.quantity * s.rate, 0);
  const totalAmount = Math.max(0, subtotal - (form.discount || 0));
  const balanceAmount = Math.max(0, totalAmount - (form.advancePayment || 0));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const validServices = services.filter((s) => s.name.trim() !== "");
    if (validServices.length === 0) {
      toast.error("Please add at least one service with a name");
      setLoading(false);
      return;
    }

    const res = await createOrder({ ...form, services: validServices });

    if (res.success && res.data) {
      toast.success("Order created successfully!");
      router.push(`/orders/${res.data.id}`);
    } else {
      toast.error(res.success ? "Failed" : res.error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Order / Estimate</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create a new booking or estimate</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Client Name *
              </label>
              <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Client name" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Phone *
              </label>
              <Input value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} placeholder="Phone number" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <Input type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} placeholder="Email (optional)" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Address
              </label>
              <Input value={form.clientAddress} onChange={(e) => setForm({ ...form, clientAddress: e.target.value })} placeholder="Address (optional)" />
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Event Type *
              </label>
              <Select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                <option value="wedding">Wedding</option>
                <option value="pre_wedding">Pre-Wedding</option>
                <option value="engagement">Engagement</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate</option>
                <option value="other">Other</option>
              </Select>
            </div>
            {form.eventType === "other" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Specify Event Name *
                </label>
                <Input
                  value={form.customEventType}
                  onChange={(e) => setForm({ ...form, customEventType: e.target.value })}
                  placeholder="e.g. Haldi, Babyshower, Fashion Portfolio"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Venue
              </label>
              <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Event venue" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Event Date *
              </label>
              <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                End Date (if multi-day)
              </label>
              <Input type="date" value={form.eventEndDate} onChange={(e) => setForm({ ...form, eventEndDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Status
              </label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="estimate">Estimate</option>
                <option value="confirmed">Confirmed</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Services / Resources</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addServiceRow} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Service
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                      {service.serviceTypeId === "other" ? "Service Name *" : "Service"}
                    </label>
                    {service.serviceTypeId === "other" && (
                      <button
                        type="button"
                        onClick={() => updateServiceRow(index, "serviceTypeId", "")}
                        className="text-[10px] text-violet-600 dark:text-violet-400 hover:underline font-medium"
                      >
                        Choose from list
                      </button>
                    )}
                  </div>
                  {service.serviceTypeId === "other" ? (
                    <Input
                      value={service.name}
                      onChange={(e) => updateServiceRow(index, "name", e.target.value)}
                      placeholder="Type service name (e.g. Drone, LED Wall...)"
                      autoFocus
                    />
                  ) : (
                    <Select
                      value={service.serviceTypeId}
                      onChange={(e) => updateServiceRow(index, "serviceTypeId", e.target.value)}
                    >
                      <option value="">Select service...</option>
                      {serviceTypes.filter((st) => st.isActive).map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name} — ₹{st.rate.toLocaleString("en-IN")} / {st.rateUnit === "per_day" ? "day" : "event"}
                        </option>
                      ))}
                      <option value="other">✨ Other (Custom Service)...</option>
                    </Select>
                  )}
                </div>
                <div className="w-20">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Qty</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={service.quantity === 0 ? "" : service.quantity}
                    onChange={(e) => updateServiceRow(index, "quantity", e.target.value === "" ? 0 : parseInt(e.target.value) || 1)}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="w-28">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Rate (₹)</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={service.rate === 0 ? "" : service.rate}
                    onChange={(e) => updateServiceRow(index, "rate", e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="w-28 flex flex-col">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Total</label>
                  <div className="h-10 flex items-center font-bold text-sm text-slate-700 dark:text-slate-300">
                    {formatCurrency(service.quantity * service.rate)}
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeServiceRow(index)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-10 w-10"
                    disabled={services.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment & Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment & Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Discount (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.discount === 0 ? "" : form.discount}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({ ...form, discount: v === "" ? 0 : parseFloat(v) || 0 });
                  }}
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Advance Payment (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.advancePayment === 0 ? "" : form.advancePayment}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({ ...form, advancePayment: v === "" ? 0 : parseFloat(v) || 0 });
                  }}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Discount</span>
                  <span className="font-semibold text-rose-600">- {formatCurrency(form.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-indigo-200 dark:border-indigo-800 pt-2">
                <span>Total Amount</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(totalAmount)}</span>
              </div>
              {form.advancePayment > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Advance Paid</span>
                    <span className="font-semibold text-emerald-600">- {formatCurrency(form.advancePayment)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Balance Due</span>
                    <span className="text-amber-600">{formatCurrency(balanceAmount)}</span>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Notes
              </label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/orders">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="min-w-32">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Order
          </Button>
        </div>
      </form>
    </div>
  );
}
