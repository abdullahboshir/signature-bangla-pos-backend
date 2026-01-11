import nodemailer from "nodemailer";
import appConfig from "../config/app.config.ts";

/**
 * Industrial Standard Centralized Email Service
 */
export class MailService {
    private static transporter = nodemailer.createTransport({
        host: appConfig.smtp_host,
        port: appConfig.smtp_port,
        secure: appConfig.smtp_port === 465, // true for 465, false for other ports
        auth: {
            user: appConfig.smtp_user,
            pass: appConfig.smtp_pass,
        },
    });

    /**
     * Generic Method to Send Email
     */
    static async sendEmail(to: string, subject: string, html: string) {
        try {
            console.log(`✉️ Attempting to send email to: ${to}`);
            console.log(`🔧 SMTP Debug - Host: ${appConfig.smtp_host}, User: ${appConfig.smtp_user ? '***' : 'MISSING'}, Pass: ${appConfig.smtp_pass ? '***' : 'MISSING'}`);

            const info = await this.transporter.sendMail({
                from: `"${appConfig.smtp_from_name || 'Signature Bangla'}" <${appConfig.smtp_from}>`,
                to,
                subject,
                html,
            });

            console.log(`✉️ Email sent successfully to ${to}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error);
            // We don't throw here to prevent breaking the main flow (e.g., company creation)
            // but in production, we should log this to a monitoring system.
            return null;
        }
    }
}
