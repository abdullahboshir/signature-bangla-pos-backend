/**
 * POS Tax Adapter
 * Handles tax calculations independently of where the tax rules are defined.
 */
export class TaxAdapter {
    constructor(private readonly businessUnitId: string) { }

    async getTaxRules(productId: string): Promise<any> {
        const commerceEnabled = await this.isCommerceEnabled();

        if (commerceEnabled) {
            // Fetch from commerce tax settings
            return [];
        }

        // Fallback to minimal POS tax rules
        return this.getDefaultTaxRules();
    }

    private async isCommerceEnabled(): Promise<boolean> {
        return true;
    }

    private getDefaultTaxRules() {
        return [{ name: 'N/A', rate: 0 }];
    }
}
