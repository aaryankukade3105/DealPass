import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportDealsExcel(deals) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "DealPass";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Deals");

  sheet.columns = [
    { header: "Brand", key: "brand", width: 25 },
    { header: "Deal Title", key: "title", width: 30 },
    { header: "Type", key: "type", width: 15 },
    { header: "Commercials", key: "commercials", width: 18 },
    { header: "Currency", key: "currency", width: 12 },
    { header: "Status", key: "status", width: 20 },
    { header: "Payment Status", key: "payment", width: 20 },
    { header: "Confirmation Date", key: "confirmation", width: 18 },
    { header: "Due Date", key: "due", width: 18 },
    { header: "Posted Date", key: "posted", width: 18 },
    { header: "Deliverables", key: "deliverables", width: 35 },
    { header: "Notes", key: "notes", width: 40 },
  ];

  sheet.getRow(1).font = {
    bold: true,
  };

  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "FF3B5C",
    },
  };

  sheet.getRow(1).font = {
    color: {
      argb: "FFFFFFFF",
    },
    bold: true,
  };

  deals.forEach((deal) => {
    sheet.addRow({
      brand: deal.brand_name,
      title: deal.deal_title,
      type: deal.collaboration_type,
      commercials: deal.commercials,
      currency: deal.currency,
      status: deal.deal_status,
      payment: deal.payment_status,
      confirmation: deal.confirmation_date,
      due: deal.content_due_date,
      posted: deal.posted_date,
      deliverables: (deal.deliverables || []).join(", "),
      notes: deal.notes,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),
    `DealPass-${new Date().toISOString().slice(0,10)}.xlsx`
  );
}