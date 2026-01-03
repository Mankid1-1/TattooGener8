
import { AppTier, Product } from "../types";
import { generateChecksum, verifyChecksum } from "../utils/security";

// This service mocks the Native Bridge (StoreKit/BillingClient)
// In a real Cordova/Capacitor app, this would call native plugins.

export const SUBSCRIPTION_PRODUCT: Product = {
  id: 'com.colorcrate.pro.monthly',
  title: 'ColorCrate Pro',
  price: '$4.99',
  description: 'Unlimited access to all features',
  currency: 'USD'
};

const LICENSE_KEY = 'tc_license_data';

export const getStoredLicense = (): AppTier => {
    try {
        const raw = localStorage.getItem(LICENSE_KEY);
        if (!raw) return AppTier.FREE;

        const data = JSON.parse(raw);
        if (!data || !data.tier || !data.checksum) return AppTier.FREE;

        // Verify integrity
        // We construct the payload that was signed: tier + timestamp
        const payload = `${data.tier}:${data.timestamp}`;
        if (verifyChecksum(payload, data.checksum)) {
             return data.tier as AppTier;
        } else {
            console.warn("[Security] License tamper detected. Reverting to FREE.");
            localStorage.removeItem(LICENSE_KEY);
            return AppTier.FREE;
        }
    } catch (e) {
        return AppTier.FREE;
    }
};

export const saveLicense = (tier: AppTier) => {
    const timestamp = Date.now();
    const payload = `${tier}:${timestamp}`;
    const checksum = generateChecksum(payload);

    const data = {
        tier,
        timestamp,
        checksum
    };
    localStorage.setItem(LICENSE_KEY, JSON.stringify(data));
};

export const purchaseSubscription = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    console.log("[StoreKit] Initiating Purchase Flow...");
    
    // Simulate Network/Native Delay
    setTimeout(() => {
      // Randomly simulate user cancellation (for testing) or success
      // For this demo, we always succeed.
      const isSuccess = true;
      
      if (isSuccess) {
        console.log("[StoreKit] Transaction Verified.");
        resolve(true);
      } else {
        console.warn("[StoreKit] User Cancelled.");
        reject(new Error("User cancelled transaction"));
      }
    }, 2500);
  });
};

export const restorePurchases = async (): Promise<AppTier> => {
  return new Promise((resolve) => {
    console.log("[StoreKit] Restoring Receipts...");
    
    setTimeout(() => {
      const tier = getStoredLicense();
      
      console.log(`[StoreKit] Restore Complete. Found: ${tier}`);
      resolve(tier);
    }, 2000);
  });
};

// Deprecated: Use saveLicense instead
export const setPurchaseFlag = () => {
    saveLicense(AppTier.PRO);
};
