import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PAGE_WIDTH = 210;
const MARGIN = 12;

const COMPANY = {
  name: "KNR SEA FOODS",
  subtitle: "Seafood Sales & Distribution",
  ceo: "Bangari Chaitanya",
  address: "Guntur, Andhra Pradesh",
  phone: "9346606723",

  // Place both logo files inside public/images/
  logoLeft: "/images/knr-logo.png",
  logoRight: "/images/knr-logo-2.png",

  // bankName: "Bank Name",
  // bankBranch: "Branch Name",
  // accountNumber: "Account Number",
  // ifsc: "IFSC CODE",
  // accountHolder: "Account Holder Name",

  // Place NotoSansTelugu-Regular.ttf inside public/fonts/
  // teluguFont: "/fonts/NotoSansTelugu-Regular.ttf",

  // footerTelugu: "ధన్యవాదాలు! మళ్లీ రావాలని కోరుకుంటున్నాము.",
};

const formatCurrency = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const formatDate = (date) => {
  if (!date) return "-";

  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
};

const amountInWords = (amount) => {
  const number = Math.round(Number(amount || 0));

  if (number === 0) return "Zero Rupees only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convert = (n) => {
    if (n < 20) return ones[n];

    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    }

    if (n < 1000) {
      return (
        ones[Math.floor(n / 100)] +
        " Hundred " +
        convert(n % 100)
      ).trim();
    }

    return "";
  };

  const convertIndian = (n) => {
    const parts = [];

    const crore = Math.floor(n / 10000000);
    n %= 10000000;

    const lakh = Math.floor(n / 100000);
    n %= 100000;

    const thousand = Math.floor(n / 1000);
    n %= 1000;

    if (crore) parts.push(convert(crore) + " Crore");
    if (lakh) parts.push(convert(lakh) + " Lakh");
    if (thousand) parts.push(convert(thousand) + " Thousand");
    if (n) parts.push(convert(n));

    return parts.join(" ");
  };

  return convertIndian(number) + " Rupees only";
};

const loadImage = (url) =>
  new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => resolve(null);
    image.src = url;
  });

// const addWatermark = (doc) => {
//   const pageHeight = doc.internal.pageSize.getHeight();

//   doc.saveGraphicsState();
//   doc.setTextColor(240, 240, 240);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(42);

//   doc.text("KNR SEA FOODS", PAGE_WIDTH / 2, pageHeight / 2, {
//     align: "center",
//     angle: 45,
//   });

//   doc.restoreGraphicsState();
// };

const addCompanyHeader = async (doc) => {
  const leftLogo = await loadImage(COMPANY.logoLeft);
  const rightLogo = await loadImage(COMPANY.logoRight);

  if (leftLogo) {
    doc.addImage(leftLogo, "PNG", MARGIN, 8, 24, 20);
  }

  if (rightLogo) {
    doc.addImage(rightLogo, "PNG", PAGE_WIDTH - MARGIN - 24, 8, 24, 20);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(0, 0, 0);

  doc.text(COMPANY.name, PAGE_WIDTH / 2, 15, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(COMPANY.subtitle, PAGE_WIDTH / 2, 21, {
    align: "center",
  });

  doc.setFontSize(8);

  doc.text(COMPANY.address, PAGE_WIDTH / 2, 26, {
    align: "center",
  });

  doc.text(`Phone: ${COMPANY.phone}`, PAGE_WIDTH / 2, 30, { align: "center" });

  doc.line(MARGIN, 34, PAGE_WIDTH - MARGIN, 34);
};

const addInvoiceDetails = (doc, bill) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);

  doc.text("Tax Invoice", PAGE_WIDTH / 2, 42, {
    align: "center",
  });

  doc.setFontSize(10);

  doc.text("Bill To", MARGIN, 52);
  doc.text("Invoice Details", 125, 52);

  doc.setFont("helvetica", "bold");
  doc.text(bill.customerName + " Garu" || "", MARGIN, 59);

  doc.setFont("helvetica", "normal");
  doc.text(`Contact No.: ${bill.phone || "-"}`, MARGIN, 65);

  doc.text(`Invoice No.: ${bill.invoiceNumber || bill.billNumber}`, 125, 59);

  doc.text(`From Date: ${formatDate(bill.fromDate)}`, 125, 65);
  doc.text(`To Date: ${formatDate(bill.toDate)}`, 125, 71);
};

const addInvoiceTable = (doc, bill) => {
  const items = bill.items || [];

  const groupedItems = items.reduce((groups, item) => {
    const date = item.transactionDate || "Unknown Date";

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(item);

    return groups;
  }, {});

  const sortedDates = Object.keys(groupedItems).sort();

  let currentY = 78;
  let grandTotalQuantity = 0;
  let grandTotal = 0;

  sortedDates.forEach((date) => {
    const dateItems = groupedItems[date];

    const dateQuantity = dateItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );

    const dateTotal = dateItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
      0,
    );

    grandTotalQuantity += dateQuantity;
    grandTotal += dateTotal;

    // Date heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(formatDate(date), MARGIN, currentY);

    currentY += 4;

    // Date-wise transaction table
    autoTable(doc, {
      startY: currentY,
      margin: {
        left: MARGIN,
        right: MARGIN,
      },
      head: [["#", "Item Name", "Quantity", "Unit", "Price / Unit", "Amount"]],
      body: dateItems.map((item, index) => [
        index + 1,
        item.name || "",
        formatNumber(item.quantity),
        item.unit || "Kg",
        formatCurrency(item.price),
        formatCurrency(Number(item.quantity || 0) * Number(item.price || 0)),
      ]),
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        textColor: [30, 30, 30],
        lineColor: [180, 180, 180],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [35, 65, 90],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 62 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 34, halign: "right" },
        5: { cellWidth: 44, halign: "right" },
      },
    });

    currentY = doc.lastAutoTable.finalY + 5;

    // Daily subtotal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    doc.text(`Total Quantity: ${formatNumber(dateQuantity)}`, MARGIN, currentY);

    doc.text(
      `Daily Total: ${formatCurrency(dateTotal)}`,
      PAGE_WIDTH - MARGIN,
      currentY,
      { align: "right" },
    );

    currentY += 12;
  });

  // Grand total quantity
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text(
    `Grand Total Quantity: ${formatNumber(grandTotalQuantity)}`,
    MARGIN,
    currentY,
  );

  currentY += 12;

  // Amount summary
  const received = Number(bill.received || 0);
  const balance = Number(bill.balance ?? grandTotal - received);

  doc.text("Invoice Amount In Words", MARGIN, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.text(amountInWords(grandTotal), MARGIN, currentY + 7, { maxWidth: 100 });

  const amountX = 125;

  doc.setFont("helvetica", "bold");
  doc.text("Amounts", amountX, currentY);

  doc.setFont("helvetica", "normal");

  doc.text("Sub Total", amountX, currentY + 8);
  doc.text(formatCurrency(grandTotal), 195, currentY + 8, {
    align: "right",
  });

  doc.text("Total", amountX, currentY + 16);
  doc.text(formatCurrency(grandTotal), 195, currentY + 16, {
    align: "right",
  });

  doc.text("Received", amountX, currentY + 24);
  doc.text(formatCurrency(received), 195, currentY + 24, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");

  doc.text("Balance", amountX, currentY + 32);
  doc.text(formatCurrency(balance), 195, currentY + 32, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");

  doc.text(
    `Payment Type: ${bill.paymentType || "Credit"}`,
    MARGIN,
    currentY + 24,
  );

  return currentY + 42;
};

// const addBankDetails = (doc, startY) => {
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);

//   doc.text("Bank Details", MARGIN, startY);

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(8);

//   doc.text(`Bank Name: ${COMPANY.bankName}`, MARGIN, startY + 7);
//   doc.text(`Branch: ${COMPANY.bankBranch}`, MARGIN, startY + 13);
//   doc.text(`Account No.: ${COMPANY.accountNumber}`, MARGIN, startY + 19);
//   doc.text(`IFSC Code: ${COMPANY.ifsc}`, MARGIN, startY + 25);
//   doc.text(`Account Holder: ${COMPANY.accountHolder}`, MARGIN, startY + 31);

//   doc.setFont("helvetica", "bold");

//   doc.text(`For: ${COMPANY.name}`, 195, startY + 10, { align: "right" });

//   doc.setFont("helvetica", "normal");

//   doc.line(155, startY + 32, 195, startY + 32);

//   doc.text("Authorized Signatory", 195, startY + 38, {
//     align: "right",
//   });

//   return startY + 45;
// };

const addFooter = async (doc, startY) => {
  // try {
  //   const response = await fetch(COMPANY.teluguFont);

  //   if (response.ok) {
  //     const buffer = await response.arrayBuffer();

  //     const bytes = new Uint8Array(buffer);
  //     let binary = "";

  //     bytes.forEach((byte) => {
  //       binary += String.fromCharCode(byte);
  //     });

  //     doc.addFileToVFS("NotoSansTelugu-Regular.ttf", btoa(binary));

  //     doc.addFont("NotoSansTelugu-Regular.ttf", "NotoTelugu", "normal");

  //     doc.setFont("NotoTelugu", "normal");
  //     doc.setFontSize(10);

  //     doc.text(COMPANY.footerTelugu, PAGE_WIDTH / 2, startY, {
  //       align: "center",
  //     });
  //   }
  // } catch (error) {
  //   console.error("Telugu font loading failed:", error);
  // }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(
    "Thank you for doing business with us.",
    PAGE_WIDTH / 2,
    startY + 7,
    { align: "center" },
  );

  return startY + 14;
};

const addAcknowledgment = (doc, startY) => {
  // const total = Number(bill.total || 0);

  doc.setLineDash([2, 2], 0);
  doc.line(MARGIN, startY, PAGE_WIDTH - MARGIN, startY);
  doc.setLineDash([], 0);

  const y = startY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text("Acknowledgment", PAGE_WIDTH / 2, y, {
    align: "center",
  });

  doc.setFontSize(11);

  doc.text(COMPANY.name, PAGE_WIDTH / 2, y + 8, {
    align: "center",
  });

  doc.setFontSize(10);

  doc.text(COMPANY.ceo, PAGE_WIDTH / 2, y + 15, {
    align: "center",
  });

  doc.setFontSize(9);

  // doc.text("Invoice To:", MARGIN, y + 21);
  // doc.text("Invoice Details:", 110, y + 21);

  // doc.setFont("helvetica", "normal");

  // doc.text(bill.customerName || "", MARGIN, y + 28);

  // doc.text(
  //   `Invoice No.: ${bill.invoiceNumber || bill.billNumber}`,
  //   110,
  //   y + 28,
  // );

  // doc.text(`Invoice Date: ${bill.date}`, 110, y + 35);

  // doc.text(`Invoice Amount: ${formatCurrency(total)}`, 110, y + 42);

  doc.rect(135, y, 60, 20);

  doc.text("Receiver's Seal & Sign", 165, y + 12, { align: "center" });
};

export const printBill = async (bill) => {
  const items = bill.items || [];

  const uniqueDates = [...new Set(items.map((item) => item.transactionDate))];

  const pageHeight = Math.max(
    230,
    240 + items.length * 12 + uniqueDates.length * 20,
  );

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [PAGE_WIDTH, pageHeight],
  });

  await addCompanyHeader(doc);

  addInvoiceDetails(doc, bill);

  // Generate date-wise tables and get the final position
  const tableEndY = addInvoiceTable(doc, bill);

  const bankY = tableEndY + 8;

  const acknowledgmentY = await addFooter(doc, bankY);

  addAcknowledgment(doc, acknowledgmentY);

  const watsapp = bill.watsapp || false;

  if (watsapp) {
    return doc.output("blob");
  }

  doc.autoPrint();

  window.open(doc.output("bloburl"), "_blank");
};
