import { jsPDF } from 'jspdf';

/**
 * Format currency in Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  return `Rs. ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

/**
 * Generate booking confirmation PDF with professional styling
 * @param {Object} bookingData - Booking details
 * @returns {jsPDF} PDF document instance
 */
export const generateBookingConfirmationPDF = (bookingData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Color scheme
  const primaryColor = [0, 102, 204]; // Blue
  const secondaryColor = [240, 248, 255]; // Light blue
  const darkGray = [51, 51, 51];
  const lightGray = [128, 128, 128];
  
  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING CONFIRMATION', pageWidth / 2, 20, { align: 'center' });
  
  // Hotel name
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(bookingData.hotelName || 'Hotel Name', pageWidth / 2, 32, { align: 'center' });
  
  // Booking number badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 50, contentWidth, 12, 2, 2, 'F');
  doc.setTextColor(...darkGray);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Number: ', margin + 3, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(bookingData.bookingNo || 'N/A', margin + 40, 58);
  
  let yPos = 70;
  
  // Guest Information Section
  doc.setFillColor(...secondaryColor);
  doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GUEST INFORMATION', margin + 3, yPos + 5.5);
  
  yPos += 12;
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const guestInfo = [
    ['Name:', bookingData.guestName || 'N/A'],
    ['Email:', bookingData.email || 'N/A'],
    ['Mobile:', bookingData.mobileNo || 'N/A'],
    ['Guests:', `${bookingData.adults || 0} Adult(s)${bookingData.children > 0 ? `, ${bookingData.children} Child(ren)` : ''}`]
  ];
  
  guestInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 30, yPos);
    yPos += 6;
  });
  
  // Stay Details Section
  yPos += 6;
  doc.setFillColor(...secondaryColor);
  doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('STAY DETAILS', margin + 3, yPos + 5.5);
  
  yPos += 12;
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const stayInfo = [
    ['Check-in:', bookingData.checkIn || 'N/A'],
    ['Check-out:', bookingData.checkOut || 'N/A'],
    ['Duration:', `${bookingData.nights || 'N/A'} Night(s)`]
  ];
  
  stayInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 30, yPos);
    yPos += 6;
  });
  
  // Room Details Section
  if (bookingData.rooms && bookingData.rooms.length > 0) {
    yPos += 6;
    doc.setFillColor(...secondaryColor);
    doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ROOM DETAILS', margin + 3, yPos + 5.5);
    
    yPos += 12;
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    
    bookingData.rooms.forEach((room, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${room.name || 'Room'}`, margin + 5, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Quantity: ${room.quantity || 1}`, margin + 8, yPos);
      yPos += 5;
      
      doc.text(`Rate: ${formatCurrency(room.rate || 0)} per night`, margin + 8, yPos);
      yPos += 5;
      
      if (room.totalAmount) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: ${formatCurrency(room.totalAmount)}`, margin + 8, yPos);
        yPos += 7;
      }
    });
  }
  
  // Payment Summary Section
  yPos += 4;
  doc.setFillColor(...secondaryColor);
  doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT SUMMARY', margin + 3, yPos + 5.5);
  
  yPos += 12;
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Payment breakdown
  const rightAlign = pageWidth - margin - 5;
  
  doc.text('Subtotal:', margin + 5, yPos);
  doc.text(formatCurrency(bookingData.subtotal || 0), rightAlign, yPos, { align: 'right' });
  yPos += 6;
  
  if (bookingData.cgst) {
    doc.text('CGST:', margin + 5, yPos);
    doc.text(formatCurrency(bookingData.cgst), rightAlign, yPos, { align: 'right' });
    yPos += 6;
  }
  
  if (bookingData.sgst) {
    doc.text('SGST:', margin + 5, yPos);
    doc.text(formatCurrency(bookingData.sgst), rightAlign, yPos, { align: 'right' });
    yPos += 6;
  }
  
  if (bookingData.totalTax) {
    doc.text('Total Tax:', margin + 5, yPos);
    doc.text(formatCurrency(bookingData.totalTax), rightAlign, yPos, { align: 'right' });
    yPos += 8;
  }
  
  // Grand Total with highlight
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos - 2, contentWidth, 10, 2, 2, 'FD');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', margin + 5, yPos + 5);
  doc.text(formatCurrency(bookingData.grandTotal || 0), rightAlign, yPos + 5, { align: 'right' });
  
  // Payment Status
  yPos += 16;
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (bookingData.paymentStatus) {
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Status: ', margin + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 128, 0); // Green for confirmed
    doc.text(bookingData.paymentStatus, margin + 40, yPos);
    yPos += 6;
  }
  
  if (bookingData.transactionId) {
    doc.setTextColor(...lightGray);
    doc.setFontSize(9);
    doc.text(`Transaction ID: ${bookingData.transactionId}`, margin + 5, yPos);
  }
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setTextColor(...lightGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for choosing us!', pageWidth / 2, footerY, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN', { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })}`, pageWidth / 2, footerY + 5, { align: 'center' });
  
  return doc;
};

/**
 * Convert PDF to base64 string
 * @param {jsPDF} pdfDoc - PDF document instance
 * @returns {string} Base64 encoded PDF
 */
export const pdfToBase64 = (pdfDoc) => {
  const pdfOutput = pdfDoc.output('datauristring');
  // Remove the 'data:application/pdf;filename=generated.pdf;base64,' prefix
  const base64String = pdfOutput.split(',')[1];
  return base64String;
};

/**
 * Download PDF to user's device
 * @param {jsPDF} pdfDoc - PDF document instance
 * @param {string} filename - Name for downloaded file
 */
export const downloadPDF = (pdfDoc, filename = 'booking-confirmation.pdf') => {
  pdfDoc.save(filename);
};

/**
 * Generate and get base64 PDF in one function
 * @param {Object} bookingData - Booking details
 * @returns {string} Base64 encoded PDF
 */
export const generateBookingPDFBase64 = (bookingData) => {
  const pdfDoc = generateBookingConfirmationPDF(bookingData);
  return pdfToBase64(pdfDoc);
};
