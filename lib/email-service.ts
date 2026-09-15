import nodemailer from 'nodemailer';
import { EmailNotificationConfig, SiteContactInfo, formatWhatsAppUrlDigits } from './site-config';

export interface OrderEmailData {
  id: string;
  orderId?: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  items: Array<{ id: string; title: string; price: number; quantity: number }>;
  totalPrice: number;
  paymentMethod?: string;
  createdAt: string;
}

/**
 * Generate Customer Order Confirmation HTML
 */
export function generateCustomerEmailHtml(order: OrderEmailData, contact: SiteContactInfo, emailConfig: EmailNotificationConfig): string {
  const orderNumber = order.orderId || order.id;
  const safeItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{ id: 'item-1', title: 'Himalayan Herbal Product', price: order.totalPrice, quantity: 1 }];

  const itemsRows = safeItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e7e5e4; color: #1c1917; font-size: 14px; font-weight: 600;">
          ${item.title}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e7e5e4; color: #44403c; font-size: 14px; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e7e5e4; color: #1c1917; font-size: 14px; text-align: right; font-family: monospace; font-weight: 700;">
          PKR ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${orderNumber}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f4; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e7e5e4;">
            <!-- Header Banner -->
            <tr>
              <td style="background-color: #064e3b; padding: 32px 24px; text-align: center;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #6ee7b7; font-weight: 700; margin-bottom: 8px;">
                  100% Pure Himalayan Herbs • Karakoram Harvest
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; font-family: Georgia, serif;">
                  IronAsh Himalayan Shilajit
                </h1>
                <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px;">
                  Order Confirmation & Receipt
                </p>
              </td>
            </tr>

            <!-- Status Banner -->
            <tr>
              <td style="padding: 24px 24px 16px 24px;">
                <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 14px 16px; border-radius: 8px;">
                  <div style="color: #065f46; font-weight: 700; font-size: 15px;">
                    Thank you, ${order.customerName}!
                  </div>
                  <div style="color: #047857; font-size: 13px; margin-top: 4px; line-height: 1.5;">
                    ${emailConfig.customerEmailNote || 'Your order has been safely placed. We are preparing your authentic batch for dispatch with nationwide Cash on Delivery.'}
                  </div>
                </div>
              </td>
            </tr>

            <!-- Order Overview -->
            <tr>
              <td style="padding: 8px 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px;">
                  <tr>
                    <td style="font-size: 12px; color: #78716c; text-transform: uppercase; font-weight: 700;">Order ID:</td>
                    <td style="font-size: 14px; color: #1c1917; font-family: monospace; font-weight: 700; text-align: right;">${orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #78716c; text-transform: uppercase; font-weight: 700; padding-top: 8px;">Date Placed:</td>
                    <td style="font-size: 13px; color: #44403c; text-align: right; padding-top: 8px;">${new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #78716c; text-transform: uppercase; font-weight: 700; padding-top: 8px;">Payment:</td>
                    <td style="font-size: 13px; color: #065f46; font-weight: 700; text-align: right; padding-top: 8px;">${order.paymentMethod || 'Cash on Delivery (COD)'}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Itemized Table -->
            <tr>
              <td style="padding: 8px 24px 16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #f5f5f4;">
                      <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: #57534e; font-weight: 700;">Product</th>
                      <th style="padding: 10px 16px; text-align: center; font-size: 11px; text-transform: uppercase; color: #57534e; font-weight: 700;">Qty</th>
                      <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; color: #57534e; font-weight: 700;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsRows}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 12px 16px; font-size: 13px; color: #57534e; font-weight: 600; text-align: right; border-top: 2px solid #e7e5e4;">
                        Nationwide Shipping:
                      </td>
                      <td style="padding: 12px 16px; font-size: 13px; color: #059669; font-weight: 700; text-align: right; border-top: 2px solid #e7e5e4;">
                        FREE (COD)
                      </td>
                    </tr>
                    <tr style="background-color: #fafaf9;">
                      <td colspan="2" style="padding: 14px 16px; font-size: 15px; color: #1c1917; font-weight: 800; text-align: right;">
                        Total Payable at Doorstep:
                      </td>
                      <td style="padding: 14px 16px; font-size: 17px; color: #064e3b; font-weight: 900; font-family: monospace; text-align: right;">
                        PKR ${order.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>

            <!-- Delivery Address -->
            <tr>
              <td style="padding: 8px 24px 24px 24px;">
                <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px;">
                  <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716c; font-weight: 700; margin-bottom: 6px;">
                    Destination & Courier Address:
                  </div>
                  <div style="font-size: 14px; font-weight: 700; color: #1c1917;">${order.customerName}</div>
                  <div style="font-size: 13px; color: #44403c; margin-top: 2px;">Phone / WhatsApp: <strong>${order.phone}</strong></div>
                  <div style="font-size: 13px; color: #44403c; margin-top: 4px; line-height: 1.4;">${order.address}</div>
                  ${order.notes ? `<div style="font-size: 12px; color: #b45309; margin-top: 6px; font-style: italic;">Delivery Note: ${order.notes}</div>` : ''}
                </div>
              </td>
            </tr>

            <!-- Need Help / WhatsApp Direct Contact -->
            <tr>
              <td style="background-color: #f5f5f4; padding: 24px; text-align: center; border-top: 1px solid #e7e5e4;">
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #57534e;">
                  Questions or need to update your delivery address?
                </p>
                <a href="https://wa.me/${formatWhatsAppUrlDigits(contact.whatsappNumber)}?text=Salam%20IronAsh!%20Inquiry%20regarding%20my%20Order%20${orderNumber}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700;">
                  Chat with us on WhatsApp: ${contact.whatsappNumber}
                </a>
                <div style="margin-top: 16px; font-size: 12px; color: #78716c;">
                  Support Email: ${contact.supportEmail} • Location: ${contact.hubLocation}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Generate Admin New Order Alert HTML
 */
export function generateAdminEmailHtml(order: OrderEmailData, contact: SiteContactInfo): string {
  const orderNumber = order.orderId || order.id;
  const safeItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{ id: 'item-1', title: 'Himalayan Herbal Product', price: order.totalPrice, quantity: 1 }];

  const itemsListHtml = safeItems
    .map((item) => `<li><strong>${item.title}</strong> × ${item.quantity} (PKR ${(item.price * item.quantity).toLocaleString()})</li>`)
    .join('');

  const waDigits = formatWhatsAppUrlDigits(order.phone);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>New Order Alert: ${orderNumber}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #1c1917;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 16px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <tr>
              <td style="background-color: #1c1917; padding: 24px; color: #ffffff;">
                <span style="font-size: 11px; background-color: #059669; padding: 3px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">
                  New Order Received
                </span>
                <h2 style="margin: 12px 0 4px 0; font-size: 22px;">Order ${orderNumber}</h2>
                <div style="font-size: 14px; color: #a8a29e;">Total: <strong style="color: #6ee7b7; font-family: monospace;">PKR ${order.totalPrice.toLocaleString()}</strong> (Cash on Delivery)</div>
              </td>
            </tr>

            <tr>
              <td style="padding: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 15px; text-transform: uppercase; color: #78716c; letter-spacing: 1px;">Customer Information</h3>
                <table width="100%" style="font-size: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #78716c; width: 130px;">Name:</td>
                    <td style="padding: 6px 0; font-weight: bold; color: #1c1917;">${order.customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #78716c;">Phone:</td>
                    <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #1c1917;">
                      ${order.phone}
                    </td>
                  </tr>
                  ${order.email ? `
                  <tr>
                    <td style="padding: 6px 0; color: #78716c;">Email:</td>
                    <td style="padding: 6px 0; color: #0369a1;"><a href="mailto:${order.email}">${order.email}</a></td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding: 6px 0; color: #78716c;">Delivery Address:</td>
                    <td style="padding: 6px 0; color: #1c1917; line-height: 1.4;">${order.address}</td>
                  </tr>
                  ${order.notes ? `
                  <tr>
                    <td style="padding: 6px 0; color: #b45309; font-weight: bold;">Special Note:</td>
                    <td style="padding: 6px 0; color: #b45309; font-style: italic;">${order.notes}</td>
                  </tr>` : ''}
                </table>

                <div style="margin: 16px 0;">
                  <a href="https://wa.me/${waDigits}?text=Salam%20${encodeURIComponent(order.customerName)}!%20This%20is%20IronAsh%20Himalayan%20Shilajit%20confirming%20your%20Order%20${orderNumber}." style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: bold;">
                    📱 WhatsApp Customer Now (${order.phone})
                  </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 20px 0;" />

                <h3 style="margin: 0 0 12px 0; font-size: 15px; text-transform: uppercase; color: #78716c; letter-spacing: 1px;">Ordered Items</h3>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #1c1917; font-size: 14px;">
                  ${itemsListHtml}
                </ul>

                <div style="margin-top: 20px; padding: 12px; background-color: #ecfdf5; border-radius: 8px; font-size: 13px; color: #065f46;">
                  <strong>Action Required:</strong> Verify customer address and prepare shipment package with courier tracking.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Send order notification emails via configured SMTP transporter
 */
export async function sendOrderEmails(
  order: OrderEmailData,
  contact: SiteContactInfo,
  emailConfig: EmailNotificationConfig
): Promise<{ customerSent: boolean; adminSent: boolean; errors: string[] }> {
  const result = { customerSent: false, adminSent: false, errors: [] as string[] };

  if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPass) {
    result.errors.push('SMTP not configured on server. Provide Host, User, and Pass in Admin Settings.');
    return result;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort || 587,
      secure: emailConfig.smtpSecure ?? (emailConfig.smtpPort === 465),
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const fromAddress = `"${emailConfig.senderName || 'IronAsh Himalayan Shilajit'}" <${emailConfig.fromEmail || emailConfig.smtpUser}>`;

    // 1. Send customer email if enabled and customer provided email
    if (emailConfig.notifyCustomerOnNewOrder && order.email && order.email.includes('@')) {
      try {
        const custHtml = generateCustomerEmailHtml(order, contact, emailConfig);
        await transporter.sendMail({
          from: fromAddress,
          to: order.email.trim(),
          subject: `Order Confirmation: ${order.orderId || order.id} - IronAsh Himalayan Shilajit`,
          html: custHtml,
        });
        result.customerSent = true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown customer email error';
        console.error('Customer email sending error:', msg);
        result.errors.push(`Customer email failed: ${msg}`);
      }
    }

    // 2. Send admin email if enabled
    if (emailConfig.notifyAdminOnNewOrder && emailConfig.adminNotificationEmail && emailConfig.adminNotificationEmail.includes('@')) {
      try {
        const adminHtml = generateAdminEmailHtml(order, contact);
        await transporter.sendMail({
          from: fromAddress,
          to: emailConfig.adminNotificationEmail.trim(),
          subject: `🚨 New Order ${order.orderId || order.id} (PKR ${order.totalPrice.toLocaleString()}) - ${order.customerName}`,
          html: adminHtml,
        });
        result.adminSent = true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown admin email error';
        console.error('Admin notification email sending error:', msg);
        result.errors.push(`Admin email failed: ${msg}`);
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown SMTP transporter error';
    console.error('SMTP error:', msg);
    result.errors.push(`SMTP error: ${msg}`);
  }

  return result;
}

/**
 * Send a quick test email to verify SMTP configuration
 */
export async function sendTestEmail(
  targetEmail: string,
  emailConfig: EmailNotificationConfig,
  contact: SiteContactInfo
): Promise<{ success: boolean; message: string }> {
  if (!targetEmail || !targetEmail.includes('@')) {
    return { success: false, message: 'Please provide a valid recipient email address.' };
  }
  if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPass) {
    return { success: false, message: 'SMTP Host, User, and Password are required to send emails.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort || 587,
      secure: emailConfig.smtpSecure ?? (emailConfig.smtpPort === 465),
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const fromAddress = `"${emailConfig.senderName || 'IronAsh Himalayan Shilajit'}" <${emailConfig.fromEmail || emailConfig.smtpUser}>`;

    const sampleOrder: OrderEmailData = {
      id: `ASH-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Test Customer',
      phone: '0300 1234567',
      email: targetEmail,
      address: 'House #12, Street 5, F-7/2, Islamabad, Pakistan',
      notes: 'This is a test notification verifying your IronAsh email delivery.',
      items: [
        { id: 'sample-1', title: 'Pure Himalayan Shilajit Resin (Gold Grade)', price: 3500, quantity: 1 },
      ],
      totalPrice: 3500,
      paymentMethod: 'Cash on Delivery',
      createdAt: new Date().toISOString(),
    };

    const htmlContent = generateCustomerEmailHtml(sampleOrder, contact, emailConfig);

    await transporter.sendMail({
      from: fromAddress,
      to: targetEmail.trim(),
      subject: `✅ [Test Email] IronAsh Email Notification System Operational`,
      html: htmlContent,
    });

    return { success: true, message: `Test email successfully dispatched to ${targetEmail}!` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: `Failed to send test email: ${msg}` };
  }
}
