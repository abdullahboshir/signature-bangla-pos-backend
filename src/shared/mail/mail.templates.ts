/**
 * Industrial Standard Email Templates
 * Designed for Premium SaaS Aesthetics
 */

export const MailTemplates = {
    /**
     * Welcome Email for Company Owners
     */
    getWelcomeEmail: (data: {
        ownerName: string;
        companyName: string;
        email: string;
        setupUrl: string;
    }) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a202c; }
              .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; line-height: 1.6; }
              .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #718096; }
              .info-box { background: #f8fafc; border: 1px dashed #cbd5e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Setup Your Account</h1>
              </div>
              <div class="content">
                  <p>As-salamu alaykum <strong>${data.ownerName}</strong>,</p>
                  <p>Congratulations! Your company, <strong>${data.companyName}</strong>, has been successfully registered on the <strong>Signature Bangla POS Platform</strong>.</p>
                  
                  <p>To access your dashboard, you first need to set up your password. Please use the button below to initialize your account:</p>
                  
                  <div class="info-box">
                      <p><strong>Registered Email:</strong> ${data.email}</p>
                  </div>

                  <a href="${data.setupUrl}" class="btn">Setup My Password</a>

                  <p style="margin-top: 30px;">This link will expire in 72 hours. If you did not request this, please ignore this email.</p>
                  
                  <p>Best Regards,<br><strong>Signature Bangla Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Signature Bangla. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    },
    /**
     * Subscription Overdue Reminder (Grace Period)
     */
    getSubscriptionReminderEmail: (data: {
        clientName: string;
        planName: string;
        dueDate: string;
        graceEndDate: string;
    }) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a202c; }
              .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; line-height: 1.6; }
              .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #718096; }
              .alert-box { background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; color: #92400e; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Payment Overdue</h1>
              </div>
              <div class="content">
                  <p>As-salamu alaykum <strong>${data.clientName}</strong>,</p>
                  <p>This is a friendly reminder that the payment for your <strong>${data.planName}</strong> plan was due on <strong>${data.dueDate}</strong>.</p>
                  
                  <div class="alert-box">
                      <p><strong>Grace Period Active:</strong> Your services are still active, but they will be automatically suspended after <strong>${data.graceEndDate}</strong> if payment is not received.</p>
                  </div>

                  <p>Please log in to your dashboard to complete the payment and avoid service interruption.</p>
                  
                  <a href="#" class="btn">Pay Now</a>

                  <p>Best Regards,<br><strong>Signature Bangla Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Signature Bangla. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    },

    /**
     * Subscription Suspended Email
     */
    getSubscriptionSuspendedEmail: (data: {
        clientName: string;
        planName: string;
        expiryDate: string;
    }) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a202c; }
              .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; line-height: 1.6; }
              .btn { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #718096; }
              .error-box { background: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; color: #991b1b; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Service Suspended</h1>
              </div>
              <div class="content">
                  <p>As-salamu alaykum <strong>${data.clientName}</strong>,</p>
                  <p>We're sorry to inform you that your subscription to the <strong>${data.planName}</strong> plan has been suspended due to non-payment of the invoice due on <strong>${data.expiryDate}</strong>.</p>
                  
                  <div class="error-box">
                      <p><strong>Access Restricted:</strong> Your access to POS, ERP, and other business modules has been temporarily restricted. Your data remains safe, but you cannot perform new transactions.</p>
                  </div>

                  <p>To restore access immediately, please complete your pending payment.</p>
                  
                  <a href="#" class="btn">Restore My Account</a>

                  <p>Best Regards,<br><strong>Signature Bangla Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Signature Bangla. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    },

    /**
     * Inventory Low Stock Alert
     */
    getInventoryAlertEmail: (data: {
        buName: string;
        products: { name: string; stock: number }[];
    }) => {
        const productRows = data.products.map(p =>
            `<tr><td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${p.name}</td><td style="padding: 10px; border-bottom: 1px solid #edf2f7; color: #e53e3e; font-weight: bold;">${p.stock}</td></tr>`
        ).join('');

        return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a202c; }
              .header { background: #e53e3e; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; line-height: 1.6; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #718096; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Low Stock Alert</h1>
              </div>
              <div class="content">
                  <p>As-salamu alaykum,</p>
                  <p>The following items in <strong>${data.buName}</strong> have reached critical stock levels:</p>
                  
                  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                      <thead>
                          <tr style="background: #f8fafc;">
                              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0;">Product Name</th>
                              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0;">Stock Level</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${productRows}
                      </tbody>
                  </table>

                  <p style="margin-top: 30px;">Please arrange for restocking as soon as possible to avoid sales interruption.</p>
                  
                  <p>Best Regards,<br><strong>Signature Bangla Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Signature Bangla. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    },

    /**
     * System Backup Success Email
     */
    getSystemBackupSuccessEmail: (data: {
        timestamp: string;
        path: string;
    }) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a202c; }
              .header { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; line-height: 1.6; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #718096; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Backup Successful</h1>
              </div>
              <div class="content">
                  <p>The automated system backup has been completed successfully.</p>
                  
                  <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <p><strong>Timestamp:</strong> ${data.timestamp}</p>
                      <p><strong>Storage Path:</strong> ${data.path}</p>
                  </div>

                  <p>Your data is safely stored in the backup repository.</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Signature Bangla. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    },

    /**
     * Daily Sales Summary
     */
    getSalesSummaryEmail: (data: {
        buName: string;
        revenue: number;
        orders: number;
        paid: number;
        date: string;
    }) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a202c; }
              .header { background: #3182ce; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; line-height: 1.6; }
              .stat-box { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #edf2f7; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #718096; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Daily Performance Summary</h1>
                  <p>${data.buName} | ${data.date}</p>
              </div>
              <div class="content">
                  <p>As-salamu alaykum,</p>
                  <p>Here is your business performance summary for ${data.date}:</p>
                  
                  <div style="margin-top: 20px;">
                      <div class="stat-box">
                          <span>Total Revenue:</span>
                          <strong>${data.revenue.toFixed(2)}</strong>
                      </div>
                      <div class="stat-box">
                          <span>Total Orders:</span>
                          <strong>${data.orders}</strong>
                      </div>
                      <div class="stat-box">
                          <span>Paid Revenue:</span>
                          <strong style="color: #38a169;">${data.paid.toFixed(2)}</strong>
                      </div>
                  </div>

                  <p style="margin-top: 30px;">Keep up the great work!</p>
                  <p>Best Regards,<br><strong>Signature Bangla Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Signature Bangla. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    },

    /**
     * Inactivity Reminder
     */
    getInactivityReminderEmail: (data: {
        name: string;
        platformName: string;
    }) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a202c; }
              .header { background: #805ad5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; line-height: 1.6; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #718096; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>We Missed You!</h1>
              </div>
              <div class="content">
                  <p>As-salamu alaykum ${data.name},</p>
                  <p>It's been a while since we last saw you on <strong>${data.platformName}</strong>. We noticed you haven't logged in for over 30 days.</p>
                  
                  <p>Is there anything we can help you with? We've added many new features to help grow your business faster!</p>
                  
                  <div style="text-align: center; margin-top: 30px;">
                      <a href="https://signaturebangla.com/login" style="background: #805ad5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
                  </div>

                  <p style="margin-top: 30px;">If you have any feedback or need assistance, simply reply to this email.</p>
                  <p>Best Regards,<br><strong>Signature Bangla Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Signature Bangla. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    }
};
