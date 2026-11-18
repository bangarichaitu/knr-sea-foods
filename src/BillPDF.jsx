import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const addWatermark = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.saveGraphicsState();

  doc.setTextColor(230, 230, 230);
  doc.setFontSize(45);
  doc.setFont("helvetica", "bold");

  doc.text("KNR SEA FOODS", pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: 45,
  });

  doc.restoreGraphicsState();
};

export const printBill = (bill) => {
  const doc = new jsPDF();
  const watsapp = bill.watsapp || false;
  addWatermark(doc);

  // Company details
  doc.setFontSize(20);
  doc.text("KNR SEA FOODS", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.text("Seafood Sales & Distribution", 105, 27, {
    align: "center",
  });

  doc.line(14, 32, 196, 32);

  // Bill details
  doc.setFontSize(11);
  doc.text(`Bill No: ${bill.billNumber}`, 14, 42);
  doc.text(`Date: ${bill.date}`, 140, 42);

  doc.text(`Customer: ${bill.customerName}`, 14, 50);
  doc.text(`Phone: ${bill.phone}`, 14, 58);

  // Products table
  autoTable(doc, {
    startY: 68,
    head: [["S.No", "Item", "Qty", "Price", "Amount"]],
    body: bill.items.map((item, index) => [
      index + 1,
      item.name,
      item.quantity,
      `Rs. ${item.price}`,
      `Rs. ${item.quantity * item.price}`,
    ]),
    theme: "grid",
  });

  // Total
  const finalY = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(12);
  doc.text(`Total Amount: Rs. ${bill.total}`, 195, finalY, { align: "right" });

  doc.setFontSize(10);
  doc.text("Thank you for your business!", 105, finalY + 20, {
    align: "center",
  });

  if (watsapp) {
    return doc.output("blob");
  }

  // Open print dialog
  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
};
