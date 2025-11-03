import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "../firebase";

export async function fetchCategories() {
  const snap = await getDocs(collection(db, "categories"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchItems() {
  const snap = await getDocs(collection(db, "widelisting"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchSuppliers() {
  const snap = await getDocs(collection(db, "Suppliers"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createCategory(category: { name: string; image?: string; visible?: boolean }) {
  return await addDoc(collection(db, "categories"), category);
}

export async function updateCategory(id: string, updates: Partial<any>) {
  return await updateDoc(doc(db, "categories", id), updates);
}

export async function createOrUpdateItem(item: any) {
  if (item.id) {
    return await updateDoc(doc(db, "widelisting", item.id), item);
  }
  return await addDoc(collection(db, "widelisting"), item);
}

export async function deleteItem(id: string) {
  return await deleteDoc(doc(db, "widelisting", id));
}

// Assign the chosen supplier to a widelisting item and update item prices with supplier prices
export async function assignSupplierToItem(itemId: string, supplierId: string, supplierName?: string) {
  // First, fetch the supplier to get their prices
  const supplierSnap = await getDocs(collection(db, 'Suppliers'));
  const supplier = supplierSnap.docs.find(d => d.id === supplierId);
  
  if (!supplier) {
    throw new Error('Supplier not found');
  }

  const supplierData = supplier.data();
  const supplierPrices = supplierData?.prices?.[itemId];

  const itemRef = doc(db, 'widelisting', itemId);
  const updates: any = {
    currentSupplierId: supplierId,
  };
  
  if (supplierName) {
    updates.currentSupplierName = supplierName;
  }

  // If supplier has prices for this item, update the item's variant and pricing structure
  if (supplierPrices && supplierPrices.variants) {
    // Map supplier's variant structure to item's variant structure
    updates.variantTiers = supplierPrices.variants.map((variant: any) => {
      // Create the variant tier object
      const variantTier: any = {
        values: variant.values || [],
        quantityTiers: []
      };

      // Map price tiers to quantity tiers
      if (variant.priceTiers && Array.isArray(variant.priceTiers)) {
        variantTier.quantityTiers = variant.priceTiers.map((tier: any) => ({
          min: tier.min,
          max: tier.max,
          price: tier.price
        }));
      }

      return variantTier;
    });

    // If there's only one variant with empty values and one price tier, 
    // it might be a simple product without variants
    if (supplierPrices.variants.length === 1 && 
        (!supplierPrices.variants[0].values || supplierPrices.variants[0].values.length === 0) &&
        supplierPrices.variants[0].priceTiers?.length === 1) {
      // This is a simple product, just update the price field
      updates.price = supplierPrices.variants[0].priceTiers[0].price;
    }
  }

  return await updateDoc(itemRef, updates);
}
