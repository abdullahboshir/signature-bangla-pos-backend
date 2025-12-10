export class ULIDGenerator {
  // ==================== CONSTANTS & CONFIGURATION ====================
  private static readonly ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  private static readonly ENCODING_LEN = 32;
  private static readonly TIME_LENGTH = 10;
  private static readonly RANDOM_LENGTH = 16;
  private static readonly MAX_RETRIES = 3;
  
  // Thread-safe state management
  private static lastTime: number = 0;
  private static lastRandom: string = '';
  private static readonly stateLock = new Map<string, boolean>();

  // ==================== CORE ULID GENERATION ====================
  /**
   * Generate a cryptographically secure ULID
   * @returns ULID string (26 characters)
   * @throws Error if ULID generation fails after retries
   */
  static generateULID(): string {
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        return this.generateULIDSafe();
      } catch (error) {
        if (attempt === this.MAX_RETRIES - 1) { 
          throw new Error(`ULID generation failed after ${this.MAX_RETRIES} attempts: ${error}`);
        }
        // Wait briefly before retry (progressive backoff)
        console.log('dddddddddddd', attempt,  attempt * 10)
        this.delay(Math.pow(2, attempt) * 10);
      }
    }
    throw new Error('ULID generation failed unexpectedly');
  }

  private static generateULIDSafe(): string {
    const now = Date.now();
    
    // Validate timestamp (prevent clock skew issues)
    if (now < this.lastTime) {
      throw new Error('System clock moved backwards');
    }

    // Acquire lock for thread safety
    if (!this.acquireLock('ulid_generation')) {
      throw new Error('Unable to acquire lock for ULID generation');
    }

    try {
      let randomPart: string;
      
      if (now === this.lastTime) {
        randomPart = this.incrementRandom(this.lastRandom);
      } else {
        randomPart = this.generateSecureRandom(this.RANDOM_LENGTH);
        this.lastTime = now;
      }
      
      this.lastRandom = randomPart;
      const timePart = this.encodeTime(now, this.TIME_LENGTH);
      
      // Final validation
      const ulid = timePart + randomPart;
      if (!this.validateULID(ulid)) {
        throw new Error('Generated ULID failed validation');
      }
      
      return ulid;
    } finally {
      this.releaseLock('ulid_generation');
    }
  }

  // ==================== ENTITY-SPECIFIC GENERATORS ====================

  // 🎯 USER MANAGEMENT
  static generateAdminId(): string {
    this.validateInput({}, 'generateAdminId');
    return `USR_${this.generateULID()}_ADM`;
  }

  static generateVendorId(): string {
    this.validateInput({}, 'generateVendorId');
    return `USR_${this.generateULID()}_VEN`;
  }

  static generateCustomerId(region: string = 'GLO'): string {
    this.validateInput({ region }, 'generateCustomerId');
    if (!/^[A-Z]{2,5}$/.test(region)) {
      throw new Error('Region must be 2-5 uppercase letters');
    }
    return `USR_${this.generateULID()}_CUS_${region}`;
  }

  static generateStaffId(businessUnit: string = 'GEN'): string {
    this.validateInput({ businessUnit }, 'generateStaffId');
    if (!/^[A-Z]{2,5}$/.test(businessUnit)) {
      throw new Error('Business Unit must be 2-5 uppercase letters');
    }
    return `USR_${this.generateULID()}_STF_${businessUnit}`;
  }

  // 🏢 BUSINESS ENTITIES
  static generateStoreId(vendorType: string = 'STD'): string {
    this.validateInput({ vendorType }, 'generateStoreId');
    if (!/^[A-Z]{2,5}$/.test(vendorType)) {
      throw new Error('Vendor type must be 2-5 uppercase letters');
    }
    return `STR_${this.generateULID()}_${vendorType}`;
  }

  static generateCategoryId(level: number, parentCode: string = 'ROOT'): string {
    this.validateInput({ level, parentCode }, 'generateCategoryId');
    if (level < 1 || level > 5) throw new Error('Category level must be 1-5');
    if (!/^[A-Z0-9_]{1,10}$/.test(parentCode)) {
      throw new Error('Parent code must be 1-10 alphanumeric characters');
    }
    return `CAT_${level}_${parentCode}_${this.generateULID()}`;
  }

  static generateBrandId(): string {
    this.validateInput({}, 'generateBrandId');
    return `BRN_${this.generateULID()}`;
  }

  // 📦 PRODUCT CATALOG
  static generateProductId(categoryCode: string = 'GEN'): string {
    this.validateInput({ categoryCode }, 'generateProductId');
    if (!/^[A-Z]{2,6}$/.test(categoryCode)) {
      throw new Error('Category code must be 2-6 uppercase letters');
    }
    return `PRO_${this.generateULID()}_${categoryCode}`;
  }

  static generateProductVariantId(baseProductId: string, variantCode: string): string {
    this.validateInput({ baseProductId, variantCode }, 'generateProductVariantId');
    if (!baseProductId.startsWith('PRO_')) {
      throw new Error('Base product ID must start with PRO_');
    }
    if (!/^[A-Z0-9_]{1,10}$/.test(variantCode)) {
      throw new Error('Variant code must be 1-10 alphanumeric characters');
    }
    return `VAR_${this.generateULID()}_${variantCode}`;
  }

  static generateInventoryId(location: string = 'MAIN'): string {
    this.validateInput({ location }, 'generateInventoryId');
    if (!/^[A-Z0-9_]{1,8}$/.test(location)) {
      throw new Error('Location must be 1-8 alphanumeric characters');
    }
    return `INV_${this.generateULID()}_${location}`;
  }

  // 🛒 ORDERS & PAYMENTS
  static generateOrderId(priority: string = 'STD'): string {
    this.validateInput({ priority }, 'generateOrderId');
    const validPriorities = ['STD', 'EXP', 'PRI', 'VIP'];
    if (!validPriorities.includes(priority)) {
      throw new Error(`Priority must be one of: ${validPriorities.join(', ')}`);
    }
    return `ORD_${this.generateULID()}_${priority}`;
  }

  static generateOrderItemId(orderId: string, sequence: number): string {
    this.validateInput({ orderId, sequence }, 'generateOrderItemId');
    if (!orderId.startsWith('ORD_')) {
      throw new Error('Order ID must start with ORD_');
    }
    if (sequence < 1 || sequence > 9999) {
      throw new Error('Sequence must be between 1-9999');
    }
    return `OIT_${this.generateULID()}_${sequence.toString().padStart(4, '0')}`;
  }

  static generatePaymentId(gateway: string = 'STRIPE'): string {
    this.validateInput({ gateway }, 'generatePaymentId');
    if (!/^[A-Z]{3,10}$/.test(gateway)) {
      throw new Error('Gateway must be 3-10 uppercase letters');
    }
    return `PAY_${this.generateULID()}_${gateway}`;
  }

  static generateRefundId(refundType: string = 'FULL'): string {
    this.validateInput({ refundType }, 'generateRefundId');
    const validTypes = ['FULL', 'PARTIAL', 'EXCHANGE'];
    if (!validTypes.includes(refundType)) {
      throw new Error(`Refund type must be one of: ${validTypes.join(', ')}`);
    }
    return `REF_${this.generateULID()}_${refundType}`;
  }

  // 📢 MARKETING & ANALYTICS
  static generateCampaignId(campaignType: string = 'SALE'): string {
    this.validateInput({ campaignType }, 'generateCampaignId');
    if (!/^[A-Z]{2,8}$/.test(campaignType)) {
      throw new Error('Campaign type must be 2-8 uppercase letters');
    }
    return `CAM_${this.generateULID()}_${campaignType}`;
  }

  static generateCouponId(discountType: string = 'PERC'): string {
    this.validateInput({ discountType }, 'generateCouponId');
    const validTypes = ['PERC', 'FIXED', 'SHIPPING', 'BOGO'];
    if (!validTypes.includes(discountType)) {
      throw new Error(`Discount type must be one of: ${validTypes.join(', ')}`);
    }
    return `CPN_${this.generateULID()}_${discountType}`;
  }

  static generateReviewId(entityType: string = 'PROD'): string {
    this.validateInput({ entityType }, 'generateReviewId');
    const validTypes = ['PROD', 'STORE', 'VENDOR', 'DELIVERY'];
    if (!validTypes.includes(entityType)) {
      throw new Error(`Entity type must be one of: ${validTypes.join(', ')}`);
    }
    return `REV_${this.generateULID()}_${entityType}`;
  }

  // ==================== SECURE INTERNAL METHODS ====================

  private static encodeTime(now: number, len: number): string {
    let str = '';
    let time = now;
    
    for (let i = len; i > 0; i--) {
      const mod = time % this.ENCODING_LEN;
      str = this.ENCODING[mod] + str;
      time = Math.floor(time / this.ENCODING_LEN);
    }
    
    return str;
  }

  private static generateSecureRandom(len: number): string {
    try {
      const bytes = new Uint8Array(len) as any;
      
      // Use cryptographically secure random generator
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
      } else {
        // Fallback for Node.js without crypto (shouldn't happen in modern environments)
        throw new Error('Cryptographically secure random generator not available');
      }
      
      let str = '';
      for (let i = 0; i < len; i++) {
        str += this.ENCODING[bytes[i] % this.ENCODING_LEN];
      }
      
      return str;
    } catch (error) {
      throw new Error(`Secure random generation failed: ${error}`);
    }
  }

  private static incrementRandom(random: string): string {
    const chars = random.split('') as any;
    
    for (let i = chars.length - 1; i >= 0; i--) {
      const index = this.ENCODING.indexOf(chars[i]);
      if (index < this.ENCODING_LEN - 1) {
        chars[i] = this.ENCODING[index + 1];
        return chars.join('');
      } else {
        chars[i] = this.ENCODING[0];
      }
    }
    
    // If we get here, all characters rolled over - generate new random
    return this.generateSecureRandom(random.length);
  }

  // ==================== VALIDATION & SAFETY METHODS ====================

  private static validateULID(ulid: string): boolean {
    if (ulid.length !== 26) return false;
    
    const regex = /^[0-9A-HJ-KM-NP-TV-Z]{26}$/;
    if (!regex.test(ulid)) return false;
    
    // Additional entropy check
    const uniqueChars = new Set(ulid.split(''));
    if (uniqueChars.size < 5) return false; // Ensure sufficient entropy
    
    return true;
  }

  private static validateInput(params: Record<string, any>, method: string): void {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        throw new Error(`Parameter '${key}' is required for ${method}`);
      }
      
      if (typeof value === 'string' && value.trim().length === 0) {
        throw new Error(`Parameter '${key}' cannot be empty for ${method}`);
      }
    }
  }

  private static acquireLock(lockKey: string): boolean {
    if (this.stateLock.has(lockKey)) {
      return false;
    }
    this.stateLock.set(lockKey, true);
    return true;
  }

  private static releaseLock(lockKey: string): void {
    this.stateLock.delete(lockKey);
  }

  private static delay(ms: number): void {
    // Simple delay for retry mechanism
    const start = Date.now();
    while (Date.now() - start < ms) {
      // Busy wait (acceptable for very short delays in ID generation)
    }
  }

  // ==================== UTILITY METHODS ====================
  
  /**
   * Extract timestamp from any entity ID
   */
  static extractTimestamp(entityId: string): Date {
    try {
      const parts = entityId.split('_');
      if (parts.length < 2) {
        throw new Error('Invalid entity ID format');
      }
      
      const ulidPart = parts[1] as any;
      if (!this.validateULID(ulidPart)) {
        throw new Error('Invalid ULID in entity ID');
      }
      
      const timeStr = ulidPart.substring(0, this.TIME_LENGTH);
      let timestamp = 0;
      
      for (let i = 0; i < timeStr.length; i++) {
        const char = timeStr[i];
        const value = this.ENCODING.indexOf(char);
        if (value === -1) {
          throw new Error('Invalid timestamp encoding');
        }
        timestamp = timestamp * this.ENCODING_LEN + value;
      }
      
      return new Date(timestamp);
    } catch (error) {
      throw new Error(`Failed to extract timestamp from ID: ${error}`);
    }
  }

  /**
   * Validate any entity ID format
   */
  static validateEntityId(entityId: string): boolean {
    try {
      if (typeof entityId !== 'string' || entityId.length < 30 || entityId.length > 50) {
        return false;
      }
      
      const parts = entityId.split('_');
      if (parts.length < 2) return false;
      
      const prefix = parts[0] as any;
      const ulidPart = parts[1] as any;
      
      // Validate prefix
      const validPrefixes = ['USR', 'STR', 'CAT', 'BRN', 'PRO', 'VAR', 'INV', 'ORD', 'OIT', 'PAY', 'REF', 'CAM', 'CPN', 'REV'];
      if (!validPrefixes.includes(prefix)) return false;
      
      // Validate ULID part
      return this.validateULID(ulidPart);
    } catch {
      return false;
    }
  }
}