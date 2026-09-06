import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface StudioInfo {
  studioName?: string;
  phone?: string;
  address?: string;
  email?: string;
  ownerName?: string;
}

const eventLabels: Record<string, string> = {
  wedding: "Wedding",
  pre_wedding: "Pre-Wedding",
  engagement: "Engagement",
  birthday: "Birthday",
  corporate: "Corporate",
  other: "Other",
};

function fmtINR(n: number): string {
  return Number(n || 0).toLocaleString("en-IN");
}

function fmtDate(d: any): string {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function generateEstimatePDF(
  order: any,
  studio: string | StudioInfo = "Botadi Studio"
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = 210;
  const ph = 297;
  const L = 14;
  const R = 196;
  const W = R - L; // 182mm

  // Modern Luxury Palette
  const CHARCOAL: [number, number, number] = [24, 30, 42]; // #181E2A Deep Slate / Charcoal
  const CHARCOAL_MUTED: [number, number, number] = [71, 85, 105]; // #475569 Slate Muted
  const SLATE_LIGHT: [number, number, number] = [148, 163, 184]; // #94A3B8 Subtle Muted
  const GOLD: [number, number, number] = [180, 138, 70]; // #B48A46 Warm Champagne Gold
  const GOLD_TINT: [number, number, number] = [252, 250, 245]; // #FCFAF5 Ivory Cream
  const BG_CARD: [number, number, number] = [250, 251, 253]; // Light card background
  const BORDER_CARD: [number, number, number] = [226, 232, 240]; // Border hairline
  const EMERALD: [number, number, number] = [16, 149, 93]; // Emerald for paid / advance
  const AMBER: [number, number, number] = [194, 120, 3]; // Amber for balance due
  const ROSE: [number, number, number] = [225, 29, 72]; // Rose for discount

  // Resolve studio information
  const studioName = typeof studio === "string" ? studio : (studio?.studioName || "Botadi Studio");
  const studioPhone = typeof studio === "object" ? studio?.phone : "";
  const studioEmail = typeof studio === "object" ? studio?.email : "";
  const studioAddress = typeof studio === "object" ? studio?.address : "";

  const isEstimate = order.status === "estimate";
  const docTitle = isEstimate ? "ESTIMATE & QUOTATION" : "ORDER CONFIRMATION";

  // 1. Top Decorative Luxury Accents (Dual Hairline Stripe)
  doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.rect(0, 0, pw, 3, "F");
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(0, 3, pw, 1.2, "F");

  let y = 14;

  // 2. Editorial Header Section (Two-Column Asymmetrical)
  // Left: Studio Identity & Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text(studioName.toUpperCase(), L, y);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("PREMIUM CAMERA & CINEMA SERVICES", L, y + 5);

  let contactY = y + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(CHARCOAL_MUTED[0], CHARCOAL_MUTED[1], CHARCOAL_MUTED[2]);

  const studioMetaParts: string[] = [];
  if (studioPhone) studioMetaParts.push(`Tel: ${studioPhone}`);
  if (studioEmail) studioMetaParts.push(studioEmail);
  if (studioMetaParts.length > 0) {
    doc.text(studioMetaParts.join("   •   "), L, contactY);
    contactY += 4.5;
  }
  if (studioAddress) {
    doc.text(studioAddress, L, contactY, { maxWidth: 95 });
  }

  // Right: Document Metadata & Status Pill
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text(docTitle, R, y - 1, { align: "right" });

  // Order Number Box / Highlight
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("ORDER / INVOICE REF", R, y + 4.5, { align: "right" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text(order.orderNumber || "ORD-0000", R, y + 9.5, { align: "right" });

  // Date & Status Pill
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(CHARCOAL_MUTED[0], CHARCOAL_MUTED[1], CHARCOAL_MUTED[2]);
  doc.text(`Issue Date: ${fmtDate(order.createdAt)}`, R, y + 15, { align: "right" });

  // Sleek Status Badge
  const statusKey = (order.status || "confirmed").toUpperCase().replace("_", " ");
  const statusBadgeW = 28;
  const statusBadgeH = 5.5;
  const statusBadgeX = R - statusBadgeW;
  const statusBadgeY = y + 17.5;

  let badgeBg: [number, number, number] = [241, 245, 249];
  let badgeText: [number, number, number] = CHARCOAL;
  if (order.status === "confirmed" || order.status === "completed") {
    badgeBg = [236, 253, 245];
    badgeText = EMERALD;
  } else if (order.status === "estimate") {
    badgeBg = GOLD_TINT;
    badgeText = GOLD;
  } else if (order.status === "in_progress") {
    badgeBg = [254, 243, 199];
    badgeText = AMBER;
  }

  doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
  doc.roundedRect(statusBadgeX, statusBadgeY, statusBadgeW, statusBadgeH, 1.2, 1.2, "F");
  doc.setDrawColor(badgeText[0], badgeText[1], badgeText[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(statusBadgeX, statusBadgeY, statusBadgeW, statusBadgeH, 1.2, 1.2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(badgeText[0], badgeText[1], badgeText[2]);
  doc.text(statusKey, statusBadgeX + statusBadgeW / 2, statusBadgeY + 3.8, { align: "center" });

  // Fine Divider Line below Header
  y = 42;
  doc.setDrawColor(BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]);
  doc.setLineWidth(0.3);
  doc.line(L, y, R, y);

  // Subtle Gold Accent Pip in center of divider
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.8);
  doc.line(L, y, L + 20, y);

  y += 5;

  // 3. Client & Event Specifications (Twin Minimalist Cards)
  const cardW = (W - 6) / 2; // 88mm
  const cardH = 31;

  // --- Left Card: Client Details ---
  doc.setFillColor(BG_CARD[0], BG_CARD[1], BG_CARD[2]);
  doc.roundedRect(L, y, cardW, cardH, 2, 2, "F");
  doc.setDrawColor(BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(L, y, cardW, cardH, 2, 2, "S");

  // Gold indicator bar on left of card
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.roundedRect(L, y + 3, 1.2, cardH - 6, 0.6, 0.6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("CLIENT / BILLED TO", L + 6, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text(order.clientName || "Valued Client", L + 6, y + 12.5, { maxWidth: cardW - 12 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(CHARCOAL_MUTED[0], CHARCOAL_MUTED[1], CHARCOAL_MUTED[2]);
  doc.text(`Phone: ${order.clientPhone || "—"}`, L + 6, y + 18.5);

  if (order.clientEmail) {
    doc.text(`Email: ${order.clientEmail}`, L + 6, y + 24.5, { maxWidth: cardW - 12 });
  }

  // --- Right Card: Event Details ---
  const rightCardX = L + cardW + 6;
  doc.setFillColor(BG_CARD[0], BG_CARD[1], BG_CARD[2]);
  doc.roundedRect(rightCardX, y, cardW, cardH, 2, 2, "F");
  doc.setDrawColor(BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightCardX, y, cardW, cardH, 2, 2, "S");

  // Charcoal indicator bar on right card
  doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.roundedRect(rightCardX, y + 3, 1.2, cardH - 6, 0.6, 0.6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("EVENT SPECIFICATIONS", rightCardX + 6, y + 6);

  const eventName =
    order.eventType === "other" && order.customEventType
      ? order.customEventType
      : eventLabels[order.eventType] || order.eventType || "Event";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text(eventName, rightCardX + 6, y + 12.5, { maxWidth: cardW - 12 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(CHARCOAL_MUTED[0], CHARCOAL_MUTED[1], CHARCOAL_MUTED[2]);

  let eventDateText = `Date: ${fmtDate(order.eventDate)}`;
  if (order.eventEndDate) {
    eventDateText += ` to ${fmtDate(order.eventEndDate)}`;
  }
  doc.text(eventDateText, rightCardX + 6, y + 18.5);

  if (order.venue) {
    doc.text(`Venue: ${order.venue}`, rightCardX + 6, y + 24.5, { maxWidth: cardW - 12 });
  } else {
    doc.text("Venue: On Location", rightCardX + 6, y + 24.5);
  }

  y += cardH + 7;

  // 4. Services & Scope Table Section Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text("SERVICES & PRODUCTION DELIVERABLES", L, y);

  // Small gold decorative dot
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.circle(R - 2, y - 1, 1, "F");

  y += 2.5;

  const serviceRows = (order.services || []).map((s: any, i: number) => [
    `${String(i + 1).padStart(2, "0")}`,
    s.name || "Custom Service",
    `${s.quantity || 1}`,
    `Rs. ${fmtINR(s.rate)} / ${s.rateUnit === "per_day" ? "day" : "event"}`,
    `Rs. ${fmtINR(s.total)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Service Description", "Qty", "Unit Rate", "Total Amount"]],
    body: serviceRows,
    headStyles: {
      fillColor: [CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]],
      cellPadding: { top: 3.2, bottom: 3.2, left: 3, right: 3 },
    },
    alternateRowStyles: {
      fillColor: [252, 253, 254],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center", textColor: SLATE_LIGHT },
      1: { cellWidth: 78, fontStyle: "bold" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 42, halign: "right", textColor: CHARCOAL_MUTED },
      4: { cellWidth: 34, halign: "right", fontStyle: "bold" },
    },
    tableLineColor: [BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]],
    tableLineWidth: 0.2,
    margin: { left: L, right: pw - R },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // 5. Financial Summary Panel (Luxury Editorial Receipt Box)
  const totalsW = 82;
  const totalsX = R - totalsW;

  const hasDiscount = Number(order.discount) > 0;
  const hasAdvance = Number(order.advancePayment) > 0;

  let totalsHeight = 24;
  if (hasDiscount) totalsHeight += 6;
  if (hasAdvance) totalsHeight += 14;

  doc.setFillColor(BG_CARD[0], BG_CARD[1], BG_CARD[2]);
  doc.roundedRect(totalsX, y, totalsW, totalsHeight, 2, 2, "F");
  doc.setDrawColor(BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(totalsX, y, totalsW, totalsHeight, 2, 2, "S");

  let lineY = y + 5;

  // Subtotal
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(CHARCOAL_MUTED[0], CHARCOAL_MUTED[1], CHARCOAL_MUTED[2]);
  doc.text("Subtotal", totalsX + 5, lineY);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${fmtINR(order.subtotal)}`, totalsX + totalsW - 5, lineY, { align: "right" });

  // Discount
  if (hasDiscount) {
    lineY += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(CHARCOAL_MUTED[0], CHARCOAL_MUTED[1], CHARCOAL_MUTED[2]);
    doc.text("Discount Savings", totalsX + 5, lineY);
    doc.setTextColor(ROSE[0], ROSE[1], ROSE[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`- Rs. ${fmtINR(order.discount)}`, totalsX + totalsW - 5, lineY, { align: "right" });
  }

  // Divider inside totals
  lineY += 5;
  doc.setDrawColor(BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]);
  doc.setLineWidth(0.2);
  doc.line(totalsX + 5, lineY - 1.5, totalsX + totalsW - 5, lineY - 1.5);

  // Total Amount
  lineY += 2.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text("Grand Total", totalsX + 5, lineY);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text(`Rs. ${fmtINR(order.totalAmount)}`, totalsX + totalsW - 5, lineY, { align: "right" });

  // Advance & Balance Due
  if (hasAdvance) {
    lineY += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(CHARCOAL_MUTED[0], CHARCOAL_MUTED[1], CHARCOAL_MUTED[2]);
    doc.text("Advance Received", totalsX + 5, lineY);
    doc.setTextColor(EMERALD[0], EMERALD[1], EMERALD[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`- Rs. ${fmtINR(order.advancePayment)}`, totalsX + totalsW - 5, lineY, { align: "right" });

    lineY += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text("Balance Due", totalsX + 5, lineY);

    const balance = Number(order.balanceAmount || 0);
    if (balance > 0) {
      doc.setTextColor(AMBER[0], AMBER[1], AMBER[2]);
      doc.text(`Rs. ${fmtINR(balance)}`, totalsX + totalsW - 5, lineY, { align: "right" });
    } else {
      doc.setTextColor(EMERALD[0], EMERALD[1], EMERALD[2]);
      doc.text("PAID IN FULL", totalsX + totalsW - 5, lineY, { align: "right" });
    }
  }

  // 6. Assigned Production Team (Harmonized Styling)
  if (order.assignedStaff && order.assignedStaff.length > 0) {
    y = Math.max(y + totalsHeight + 6, (doc as any).lastAutoTable.finalY + totalsHeight + 6);

    // If near bottom of page, add page
    if (y > 230) {
      doc.addPage();
      // Re-add top stripes on next page
      doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.rect(0, 0, pw, 3, "F");
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.rect(0, 3, pw, 1.2, "F");
      y = 16;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text("ASSIGNED PRODUCTION CREW", L, y);
    y += 2.5;

    const staffRows = order.assignedStaff.map((s: any, i: number) => [
      `${String(i + 1).padStart(2, "0")}`,
      s.name || "Crew Member",
      (s.role || "Specialist").replace(/_/g, " ").toUpperCase(),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["#", "Crew Member", "Production Role"]],
      body: staffRows,
      headStyles: {
        fillColor: [45, 55, 72], // Refined dark slate header
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]],
        cellPadding: { top: 2.8, bottom: 2.8, left: 3, right: 3 },
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center", textColor: SLATE_LIGHT },
        1: { cellWidth: 90, fontStyle: "bold" },
        2: { cellWidth: 80, textColor: GOLD, fontStyle: "bold" },
      },
      tableLineColor: [BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]],
      tableLineWidth: 0.2,
      margin: { left: L, right: pw - R },
    });

    y = (doc as any).lastAutoTable.finalY + 4;
  } else {
    y += totalsHeight + 6;
  }

  // 7. Important Notes / Terms Callout Box
  if (order.notes) {
    if (y > 240) {
      doc.addPage();
      doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.rect(0, 0, pw, 3, "F");
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.rect(0, 3, pw, 1.2, "F");
      y = 16;
    }

    const noteBoxW = W;
    const splitNotes = doc.splitTextToSize(order.notes, noteBoxW - 12);
    const noteBoxH = Math.max(14, splitNotes.length * 4 + 9);

    doc.setFillColor(BG_CARD[0], BG_CARD[1], BG_CARD[2]);
    doc.roundedRect(L, y, noteBoxW, noteBoxH, 1.5, 1.5, "F");
    doc.setDrawColor(BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(L, y, noteBoxW, noteBoxH, 1.5, 1.5, "S");

    // Vertical gold accent bar on left of notes
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.roundedRect(L, y + 2, 1.2, noteBoxH - 4, 0.6, 0.6, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text("TERMS & SPECIAL INSTRUCTIONS:", L + 5, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(CHARCOAL_MUTED[0], CHARCOAL_MUTED[1], CHARCOAL_MUTED[2]);
    doc.text(splitNotes, L + 5, y + 9.5);

    y += noteBoxH + 6;
  }

  // 8. Sign-off / Signature Area (Placed gracefully above footer)
  const signY = 265;
  if (y < signY) {
    // Signature block on right
    doc.setDrawColor(BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]);
    doc.setLineWidth(0.3);
    doc.line(R - 55, signY, R, signY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(CHARCOAL_MUTED[0], CHARCOAL_MUTED[1], CHARCOAL_MUTED[2]);
    doc.text("Authorized Signatory", R - 27.5, signY + 4, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
    doc.text(studioName, R - 27.5, signY + 7.5, { align: "center" });
  }

  // 9. Luxury Footer
  const footerY = 284;
  doc.setDrawColor(BORDER_CARD[0], BORDER_CARD[1], BORDER_CARD[2]);
  doc.setLineWidth(0.25);
  doc.line(L, footerY - 4, R, footerY - 4);

  // Tiny gold center diamond / accent
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.circle(pw / 2, footerY - 4, 0.6, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
  doc.text(
    `Electronically generated document • ${studioName} • Thank you for letting us capture your finest memories.`,
    pw / 2,
    footerY,
    { align: "center" }
  );

  doc.save(`${order.orderNumber || "Estimate"}_${isEstimate ? "Estimate" : "Order"}.pdf`);
}
