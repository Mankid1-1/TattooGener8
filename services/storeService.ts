
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
    console.log("[StoreKit] Restoring Receipts...");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 🛡️ SENTINEL: Secure Storage Check
    // Instead of a simple boolean, we check for a signed license object.
    const storedLicense = localStorage.getItem('tc_license_data');
    if (!storedLicense) {
        console.log("[StoreKit] No license found.");
        return AppTier.FREE;
    }

    try {
        const { data, checksum } = JSON.parse(storedLicense);
        const isValid = await verifyChecksum(data, checksum);

        if (isValid) {
            const parsedData = JSON.parse(data);
            if (parsedData.tier === AppTier.PRO) {
                console.log("[StoreKit] Valid PRO license found.");
                return AppTier.PRO;
            }
        } else {
            console.error("[StoreKit] License tampering detected. Checksum mismatch.");
        }
    } catch (e) {
        console.error("[StoreKit] Error parsing license data:", e);
    }

    return AppTier.FREE;
};

export const setPurchaseFlag = async () => {
    // 🛡️ SENTINEL: Secure Storage Write
    // Store signed data to prevent trivial local storage manipulation
    const licenseData = JSON.stringify({
        tier: AppTier.PRO,
        timestamp: Date.now(),
        deviceId: 'browser-device' // Placeholder
    });

    const checksum = await generateChecksum(licenseData);

    localStorage.setItem('tc_license_data', JSON.stringify({
        data: licenseData,
        checksum
    }));

    // Legacy cleanup
    localStorage.removeItem('cc_has_purchased');
};
