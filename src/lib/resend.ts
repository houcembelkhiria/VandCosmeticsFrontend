/**
 * Resend Email Integration
 * 
 * ⚠️ SECURITY WARNING: This is a DEMO implementation only!
 * 
 * In production, NEVER expose your Resend API key in frontend code.
 * Move this logic to a serverless function or backend endpoint.
 * 
 * Recommended architecture:
 * Frontend -> POST /api/send-email -> Backend/Serverless Function -> Resend API
 * 
 * The backend should:
 * 1. Validate the request
 * 2. Rate limit to prevent abuse
 * 3. Keep the API key in environment variables server-side
 * 4. Call Resend API securely
 */

import axios from 'axios';
import { Order } from '@/data/dummyData';

export async function sendOrderConfirmation(
  order: Order,
  resendApiKey?: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: In production, replace this with a call to your backend:
  // await axios.post('/api/send-order-confirmation', { orderId: order.id });
  
  if (!resendApiKey) {
    console.warn('Resend API key not provided. Email not sent.');
    return { 
      success: false, 
      error: 'API key not configured. In production, this should be set in backend environment variables.' 
    };
  }

  try {
    const html = generateOrderEmailHTML(order);
    
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: 'Vanda <orders@vanda.test>',
        to: order.shipping.email,
        subject: `Order Confirmation - ${order.id}`,
        html
      },
      {
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Order confirmation email sent:', response.data);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send order confirmation:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

function generateOrderEmailHTML(order: Order): string {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.title} ${item.variantId ? `(${item.variantId})` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        $${item.unitPrice.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        $${(item.quantity * item.unitPrice).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f9a8d4 0%, #fda4af 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">Vanda</h1>
          <p style="margin: 8px 0 0 0; color: white; font-size: 16px;">Thank you for your order!</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; margin-bottom: 24px;">
            Hi ${order.shipping.fullName},
          </p>
          
          <p style="font-size: 16px; margin-bottom: 24px;">
            We've received your order and will send you a shipping confirmation once your items are on their way.
          </p>
          
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Order Number</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: #f472b6;">${order.id}</p>
          </div>
          
          <h2 style="font-size: 18px; margin: 24px 0 16px 0; color: #111827;">Order Summary</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; font-size: 14px;">Product</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #6b7280; font-size: 14px;">Qty</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; font-size: 14px;">Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; font-size: 14px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Subtotal:</span>
              <span style="font-weight: 600;">$${order.subtotal.toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Discount:</span>
                <span style="font-weight: 600; color: #10b981;">-$${order.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #e5e7eb;">
              <span style="font-size: 18px; font-weight: 700;">Total:</span>
              <span style="font-size: 18px; font-weight: 700; color: #f472b6;">$${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <h2 style="font-size: 18px; margin: 24px 0 16px 0; color: #111827;">Shipping Address</h2>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 4px 0;">${order.shipping.fullName}</p>
            <p style="margin: 0 0 4px 0;">${order.shipping.address}</p>
            <p style="margin: 0 0 4px 0;">${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}</p>
            <p style="margin: 0;">${order.shipping.country}</p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            If you have any questions, please contact us at support@vanda.test
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">
            With love,<br>
            The Vanda Team
          </p>
        </div>
      </body>
    </html>
  `;
}
