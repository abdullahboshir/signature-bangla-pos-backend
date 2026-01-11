import { MailService } from "../../shared/mail/mail.service.js";
import { DEFAULT_LEGAL_GOVERNANCE } from "../../app/modules/platform/organization/shared/common.defaults.js";
import appConfig from "@shared/config/app.config.ts";


export class AlertService {

    private static get ownerEmail() {
        return DEFAULT_LEGAL_GOVERNANCE.legalContactEmail || "admin@localhost";
    }

    /**
     * Send a Critical System Alert to the Software Owner.
     * @param title - Short description of the error (e.g., "Database Connection Failed")
     * @param error - The actual error object or message
     * @param context - Additional debugging info (e.g., Module name, Request ID)
     */
    static async sendCriticalAlert(title: string, error: any, context?: Record<string, any>) {
        if (appConfig.NODE_ENV === 'development') {
            console.log(`🔔 [AlertService] Skipped email in Development: ${title}`);
            return;
        }

        const timestamp = new Date().toLocaleString();
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        const stackTrace = error instanceof Error ? error.stack : 'No stack trace available';
        const contextHtml = context ? `<pre style="background:#f4f4f4; padding:10px;">${JSON.stringify(context, null, 2)}</pre>` : '';

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="background-color: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1>🚨 CRITICAL SYSTEM ALERT</h1>
                </div>
                <div style="padding: 20px;">
                    <h2 style="color: #DC2626;">${title}</h2>
                    <p><strong>Time:</strong> ${timestamp}</p>
                    <p><strong>Environment:</strong> ${appConfig.NODE_ENV}</p>
                    
                    <h3>Error Details:</h3>
                    <div style="background-color: #FFF5F5; border: 1px solid #FECACA; padding: 15px; border-radius: 6px; color: #991B1B;">
                        <strong>${errorMessage}</strong>
                    </div>

                    <h3>Context:</h3>
                    ${contextHtml}

                    <h3>Stack Trace:</h3>
                    <pre style="background: #1e1e1e; color: #d4d4d4; padding: 15px; overflow-x: auto; border-radius: 6px; font-size: 12px;">
${stackTrace}
                    </pre>

                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        This is an automated alert from <strong>Signature Bangla Systems</strong>.
                        <br>Please check the admin dashboard immediately.
                    </p>
                </div>
            </div>
        `;

        await MailService.sendEmail(
            this.ownerEmail,
            `🚨 CRITICAL: ${title} - ${appConfig.NODE_ENV.toUpperCase()}`,
            html
        );
    }

    /**
     * Send a Warning (Non-critical but important)
     */
    static async sendWarning(title: string, message: string) {
        // Placeholder for future warning implementations (maybe Slack/SMS)
        console.warn(`⚠️ [AlertService] WARNING: ${title} - ${message}`);
    }
}
