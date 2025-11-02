import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { fetchSuppliers, assignSupplierToItem } from '../services/firestoreService';

interface Props {
  visible: boolean;
  onClose: () => void;
  item: any;
  onAssigned?: () => void;
}

const SupplierPricePopup: React.FC<Props> = ({ visible, onClose, item, onAssigned }) => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const s: any[] = await fetchSuppliers();
        // compute first tier price for comparison (if supplier has prices[item.id])
        const enriched = s
          .map((sup: any) => {
            const priceObj = sup?.prices?.[item.id];
            let firstTierPrice = Number.POSITIVE_INFINITY;
            if (priceObj && Array.isArray(priceObj.variants) && priceObj.variants[0]?.priceTiers?.[0]) {
              firstTierPrice = priceObj.variants[0].priceTiers[0].price ?? firstTierPrice;
            }
            return { ...sup, firstTierPrice, priceObj };
          })
          .filter((sup: any) => sup.priceObj); // Only show suppliers who offered prices for this item

        enriched.sort((a: any, b: any) => {
          const pa = a.firstTierPrice ?? Number.POSITIVE_INFINITY;
          const pb = b.firstTierPrice ?? Number.POSITIVE_INFINITY;
          return pa - pb;
        });

        setSuppliers(enriched);
      } catch (err) {
        console.error('Failed to fetch suppliers', err);
      }
    })();
  }, [visible, item]);

  const handleAssign = async (supplier: any) => {
    try {
      setLoading(true);
      await assignSupplierToItem(item.id, supplier.id, supplier.businessName || supplier.name || '');
      Modal.success({ title: 'Assigned', content: `${supplier.businessName || supplier.name} assigned to ${item.name}` });
      onAssigned && onAssigned();
      onClose();
    } catch (err) {
      console.error('Assign failed', err);
      Modal.error({ title: 'Error', content: 'Failed to assign supplier. See console.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      open={visible} 
      title={
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
          Supplier Offers for <span style={{ color: '#6366f1' }}>{item?.name || ''}</span>
        </div>
      } 
      onCancel={onClose} 
      footer={null} 
      width={900}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto', padding: '24px' }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {suppliers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: '#64748b', 
            fontSize: 15,
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px dashed #cbd5e1'
          }}>
            No suppliers have offered prices for this item
          </div>
        ) : suppliers.map(sup => {
          const priceObj = sup.priceObj;
          const isCurrent = item.currentSupplierId === sup.id;
          const lastUpdate = sup.lastPriceUpdate ? 
            (sup.lastPriceUpdate.toDate ? 
              sup.lastPriceUpdate.toDate() : 
              new Date(sup.lastPriceUpdate.seconds * 1000)
            ) : null;
          const formattedTime = lastUpdate ? 
            lastUpdate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + 
            ' ' + 
            lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) 
            : 'Never';

          return (
            <div 
              key={sup.id} 
              style={{ 
                padding: 14, 
                borderRadius: 12, 
                border: isCurrent ? '2px solid #6366f1' : '1px solid #e5e7eb', 
                background: isCurrent ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))' : '#fff',
                boxShadow: isCurrent ? '0 4px 16px rgba(99,102,241,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header - Compact */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1f2937' }}>
                      {sup.businessName || sup.name || 'Unnamed'}
                    </div>
                    {isCurrent && (
                      <div style={{ 
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                        color: '#fff', 
                        padding: '2px 8px', 
                        borderRadius: 5, 
                        fontSize: 10, 
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase'
                      }}>
                        ✓ Current
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    {sup.email || ''} {sup.phone ? `• ${sup.phone}` : ''} • {formattedTime}
                  </div>
                </div>
                <Button 
                  type={isCurrent ? 'default' : 'primary'} 
                  onClick={() => handleAssign(sup)} 
                  loading={loading}
                  size="middle"
                  style={{
                    borderRadius: 8,
                    fontWeight: 600,
                    minWidth: 90,
                    background: isCurrent ? '#f3f4f6' : 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    fontSize: 13
                  }}
                >
                  {isCurrent ? '✓ Assigned' : 'Assign'}
                </Button>
              </div>

              {/* Variants & Price Tiers - Compact Table Format */}
              <div style={{ 
                background: '#fff', 
                borderRadius: 8, 
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <tbody>
                    {priceObj.variants?.map((variant: any, vi: number) => (
                      <tr 
                        key={vi}
                        style={{ 
                          borderBottom: vi < priceObj.variants.length - 1 ? '1px solid #e5e7eb' : 'none',
                          background: vi % 2 === 0 ? '#fafbfc' : '#fff'
                        }}
                      >
                        {/* Variant Values Column - Fixed Width */}
                        <td style={{ 
                          padding: '10px 12px',
                          verticalAlign: 'middle',
                          width: '25%',
                          minWidth: 120,
                          borderRight: '1px solid #e5e7eb'
                        }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {variant.values && variant.values.length > 0 ? (
                              variant.values.map((val: string, idx: number) => (
                                <span 
                                  key={idx}
                                  style={{
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    padding: '3px 8px',
                                    borderRadius: 4,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {val}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: 12 }}>-</span>
                            )}
                          </div>
                        </td>
                        
                        {/* Price Tiers Columns - Flexible */}
                        <td style={{ 
                          padding: '10px 12px',
                          verticalAlign: 'middle'
                        }}>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {variant.priceTiers?.map((tier: any, ti: number) => (
                              <div 
                                key={ti}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <span style={{ 
                                  color: '#6b7280',
                                  fontSize: 13,
                                  fontWeight: 500
                                }}>
                                  {tier.min}-{tier.max ?? '∞'}:
                                </span>
                                <span style={{ 
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: '#059669'
                                }}>
                                  ₹{typeof tier.price === 'number' ? tier.price.toFixed(2) : tier.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default SupplierPricePopup;
