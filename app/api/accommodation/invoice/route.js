import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import pool from '@/lib/db';
import { safeDrawText, sanitizePdfText } from '@/lib/pdfText';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    if (!queryId) {
      return NextResponse.json(
        { error: 'Query ID is required' },
        { status: 400 }
      );
    }

    // Fetch accommodation query
    const [queries] = await pool.query(
      `SELECT * FROM \`hw-accommodation-queries\` WHERE id = ?`,
      [queryId]
    );

    if (queries.length === 0) {
      return NextResponse.json(
        { error: 'Accommodation query not found' },
        { status: 404 }
      );
    }

    const query = queries[0];

    if (query.payment_status !== 'SUCCESS') {
      return NextResponse.json(
        { error: 'Payment not completed. Invoice can only be generated for successful payments.' },
        { status: 400 }
      );
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const orangeColor = rgb(1, 0.48, 0);
    const darkGray = rgb(0.04, 0.04, 0.06);
    const lightGray = rgb(0.5, 0.5, 0.5);

    // Header Section
    let yPosition = height - 50;

    // Try to load logo image
    let logoImage = null;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'assets', 'Hackloho.png');
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        const logoImageBytes = new Uint8Array(logoBytes);
        try {
          logoImage = await pdfDoc.embedPng(logoImageBytes);
        } catch {
          try {
            logoImage = await pdfDoc.embedJpg(logoImageBytes);
          } catch {
            // If logo can't be embedded, continue without it
          }
        }
      }
    } catch (error) {
      // Continue without logo if there's an error
      console.log('Could not load logo:', error.message);
    }

    // Draw logo or text
    if (logoImage) {
      const logoDims = logoImage.scale(0.15);
      page.drawImage(logoImage, {
        x: 50,
        y: yPosition - 10,
        width: logoDims.width,
        height: logoDims.height,
      });
      yPosition -= logoDims.height + 10;
    } else {
      page.drawText('HACKWISE 2.0', {
        x: 50,
        y: yPosition,
        size: 24,
        font: helveticaBold,
        color: orangeColor,
      });
      yPosition -= 30;
    }

    page.drawText('Accommodation Invoice', {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: darkGray,
    });
    yPosition -= 25;

    // Invoice details (right side)
    const invoiceNumber = `INV-ACC-${String(query.id).padStart(6, '0')}`;
    const invoiceDate = new Date(query.updated_at || query.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    page.drawText('Invoice Number:', {
      x: 350,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: lightGray,
    });
    page.drawText(invoiceNumber, {
      x: 350,
      y: yPosition - 15,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    });

    page.drawText('Date:', {
      x: 350,
      y: yPosition - 35,
      size: 10,
      font: helveticaFont,
      color: lightGray,
    });
    page.drawText(invoiceDate, {
      x: 350,
      y: yPosition - 50,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    // Line separator
    yPosition -= 80;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: lightGray,
    });

    // Bill To Section
    yPosition -= 30;
    page.drawText('Bill To:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    });

    yPosition -= 20;
    safeDrawText(page, query.team_lead_name, {
      x: 50,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: darkGray,
    });

    yPosition -= 15;
    safeDrawText(page, query.team_name, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    yPosition -= 12;
    safeDrawText(page, `Email: ${sanitizePdfText(query.team_lead_email)}`, {
      x: 50,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: lightGray,
    });

    yPosition -= 12;
    safeDrawText(page, `Phone: ${sanitizePdfText(query.team_lead_phone)}`, {
      x: 50,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: lightGray,
    });

    // Accommodation Details Section
    yPosition -= 40;
    page.drawText('Accommodation Details:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    });

    // Calculate nights
    const checkIn = new Date(query.check_in_date);
    const checkOut = new Date(query.check_out_date);
    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    yPosition -= 20;
    page.drawText(`Check-in: ${new Date(query.check_in_date).toLocaleDateString('en-IN')}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    yPosition -= 15;
    page.drawText(`Check-out: ${new Date(query.check_out_date).toLocaleDateString('en-IN')}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    yPosition -= 15;
    page.drawText(`Duration: ${nights} night${nights !== 1 ? 's' : ''}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    yPosition -= 15;
    page.drawText(`Total Members: ${query.total_members}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    // Items Table
    yPosition -= 40;
    const tableY = yPosition;

    // Table Header
    page.drawRectangle({
      x: 50,
      y: tableY - 20,
      width: width - 100,
      height: 25,
      color: rgb(0.95, 0.95, 0.95),
    });

    page.drawText('Description', {
      x: 60,
      y: tableY - 5,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });

    page.drawText('Amount', {
      x: width - 150,
      y: tableY - 5,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });

    // Table Row
    const rowY = tableY - 45;
    
    // Get pricing type from settings to show breakdown
    const [priceSettings] = await pool.query(
      `SELECT setting_value FROM \`hw-settings\` WHERE setting_key = 'accommodation_pricing_type'`
    );
    const pricingType = priceSettings.length > 0 ? priceSettings[0].setting_value : 'per_team';
    const [priceSetting] = await pool.query(
      `SELECT setting_value FROM \`hw-settings\` WHERE setting_key = 'accommodation_price'`
    );
    const pricePerNight = priceSetting.length > 0 ? parseFloat(priceSetting[0].setting_value) : 0;
    
    // Build description with breakdown
    let description = `Accommodation (${nights} night${nights !== 1 ? 's' : ''})`;
    if (pricingType === 'per_person') {
      description += ` - ${pricePerNight.toLocaleString('en-IN')} per night × ${nights} night${nights !== 1 ? 's' : ''} × ${query.total_members} member${query.total_members !== 1 ? 's' : ''}`;
    } else {
      description += ` - ${pricePerNight.toLocaleString('en-IN')} per night × ${nights} night${nights !== 1 ? 's' : ''}`;
    }
    
    page.drawText(description, {
      x: 60,
      y: rowY,
      size: 9,
      font: helveticaFont,
      color: darkGray,
      maxWidth: width - 200,
    });

    // Use "Rs." instead of ₹ symbol to avoid encoding issues
    const amountText = `Rs. ${parseFloat(query.amount || 0).toLocaleString('en-IN')}`;
    const amountWidth = helveticaFont.widthOfTextAtSize(amountText, 10);
    page.drawText(amountText, {
      x: width - 60 - amountWidth,
      y: rowY,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    // Total Section
    yPosition = rowY - 50;
    page.drawLine({
      start: { x: width - 200, y: yPosition + 10 },
      end: { x: width - 50, y: yPosition + 10 },
      thickness: 1,
      color: darkGray,
    });

    yPosition -= 20;
    page.drawText('Total Amount:', {
      x: width - 200,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    });

    // Use "Rs." instead of ₹ symbol to avoid encoding issues
    const totalAmountText = `Rs. ${parseFloat(query.amount || 0).toLocaleString('en-IN')}`;
    const totalAmountWidth = helveticaBold.widthOfTextAtSize(totalAmountText, 14);
    page.drawText(totalAmountText, {
      x: width - 60 - totalAmountWidth,
      y: yPosition - 2,
      size: 14,
      font: helveticaBold,
      color: orangeColor,
    });

    // Payment Information
    yPosition -= 50;
    page.drawText('Payment Information:', {
      x: 50,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: darkGray,
    });

    yPosition -= 18;
    safeDrawText(page, `Payment ID: ${query.razorpay_payment_id || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: lightGray,
    });

    yPosition -= 15;
    safeDrawText(page, `Order ID: ${query.razorpay_order_id || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: lightGray,
    });

    yPosition -= 15;
    safeDrawText(page, `Payment Status: ${query.payment_status}`, {
      x: 50,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0.6, 0),
    });

    // Footer
    yPosition = 80;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 0.5,
      color: lightGray,
    });

    yPosition -= 20;
    page.drawText('Thank you for your payment!', {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    yPosition -= 15;
    page.drawText('For any queries, please contact the Hackwise 2.0 organizing team.', {
      x: 50,
      y: yPosition,
      size: 8,
      font: helveticaFont,
      color: lightGray,
    });

    // Generate PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    // Save invoice URL to database (optional - you can store in cloud storage)
    const invoiceUrl = `/api/accommodation/invoice?id=${queryId}`;
    await pool.query(
      `UPDATE \`hw-accommodation-queries\` SET invoice_url = ? WHERE id = ?`,
      [invoiceUrl, queryId]
    );

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error.message },
      { status: 500 }
    );
  }
}

