# Platform Module Constraints

> **STRICT ARCHITECTURAL BOUNDARY**

## Purpose
This directory (`modules/platform`) contains logic that is **strictly for the SaaS Owner / Super Admin**.

## Rules
1. ❌ **NO Business Logic:** Code here must not contain logic specific to a single tenant's retail operations (e.g., selling a product, refunding an order).
2. ✅ **Infrastructure & Tenancy:** This module manages the creation of tenants (Business Units), subscriptions, licenses, and global system settings.
3. 🔒 **Restricted Access:** End-users (Business Unit Admins/Staff) should NEVER access APIs in this namespace directly.

## Contents
- **Automation:** Global job schedulers.
- **License:** Subscription management.
- **Organization:** Master CRUD for Business Units & Outlets.
- **Settings:** Global system configuration (API Keys, Backups).
