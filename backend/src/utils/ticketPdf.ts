import PDFDocument from "pdfkit";
import QRCode from "qrcode";

interface TicketPdfData {
  bookingId: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  tickets: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}

export async function generateTicketPdf(
  data: TicketPdfData
): Promise<Buffer> {
  // Generate QR code
  const qrData = JSON.stringify({
    bookingId: data.bookingId,
    eventName: data.eventName,
  });

  const qrBuffer = await QRCode.toBuffer(qrData, {
    type: "png",
    width: 180,
    margin: 2,
  });
  console.log("✅ QR CODE GENERATED:", qrBuffer.length);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", (error) => {
      reject(error);
    });

    // ==============================
    // HEADER
    // ==============================

    doc
      .fontSize(26)
      .font("Helvetica-Bold")
      .text("EventHub");

    doc
      .moveDown(0.5)
      .fontSize(20)
      .text("Event Ticket");

    doc.moveDown(1);

    // ==============================
    // EVENT DETAILS
    // ==============================

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Event Details");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .text(`Event: ${data.eventName}`)
      .text(`Date: ${data.date}`)
      .text(`Time: ${data.time}`)
      .text(`Location: ${data.location}`);

    doc.moveDown(1);

    // ==============================
    // TICKET DETAILS
    // ==============================

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Ticket Details");

    doc.moveDown(0.5);

    doc.font("Helvetica");

    data.tickets.forEach((ticket) => {
      const ticketTotal =
        ticket.price * ticket.quantity;

      doc.text(
        `${ticket.name} x ${ticket.quantity} - Rs.${ticketTotal}`
      );
    });

    doc.moveDown(1);

    // ==============================
    // TOTAL
    // ==============================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`Total Paid: Rs.${data.totalAmount}`);

    doc.moveDown(1.5);

    // ==============================
    // BOOKING INFORMATION
    // ==============================

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Booking Information");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .text(`Booking ID: ${data.bookingId}`)
      .text("Payment Status: Confirmed");

    doc.moveDown(1);

    // ==============================
    // QR CODE
    // ==============================

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Ticket QR Code");

    doc.moveDown(0.5);

    doc.image(qrBuffer, {
      width: 180,
      height: 180,
    });

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "Please show this QR code at the event entrance."
      );

    doc.moveDown(1);

    // ==============================
    // FOOTER
    // ==============================

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "Thank you for booking with EventHub!"
      );

    doc.end();
  });
}