
import jsPDF from "jspdf";

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

export function generateTicketPdf(data: TicketPdfData) {
  const pdf = new jsPDF();

  // Header
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("EventHub", 20, 25);

  pdf.setFontSize(18);
  pdf.text("Event Ticket", 20, 40);

  // Event details
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Event: ${data.eventName}`, 20, 60);
  pdf.text(`Date: ${data.date}`, 20, 70);
  pdf.text(`Time: ${data.time}`, 20, 80);
  pdf.text(`Location: ${data.location}`, 20, 90);

  // Ticket details
  pdf.setFont("helvetica", "bold");
  pdf.text("Ticket Details", 20, 110);

  pdf.setFont("helvetica", "normal");

  let y = 122;

  data.tickets.forEach((ticket) => {
    const ticketTotal = ticket.price * ticket.quantity;

    pdf.text(
      `${ticket.name} x ${ticket.quantity} - Rs.${ticketTotal}`,
      20,
      y
    );

    y += 10;
  });

  // Total
  y += 10;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text(
    `Total Paid: Rs.${data.totalAmount}`,
    20,
    y
  );

  // Booking information
  y += 25;

  pdf.setFontSize(12);

  pdf.text("Booking Information", 20, y);

  pdf.setFont("helvetica", "normal");

  y += 12;

  pdf.text(`Booking ID: ${data.bookingId}`, 20, y);

  y += 10;

  pdf.text(
    "Payment Status: Confirmed",
    20,
    y
  );

  // Footer
  y += 30;

  pdf.setFontSize(10);

  pdf.text(
    "Thank you for booking with EventHub!",
    20,
    y
  );

  pdf.text(
    "Please show your ticket QR code at the event entrance.",
    20,
    y + 8
  );

  // Download
  pdf.save(
    `EventHub-Ticket-${data.bookingId}.pdf`
  );
}

