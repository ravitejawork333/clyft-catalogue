import React, { useState } from 'react';

interface Props {
  suppliers: any[];
  items: any[];
  categories: any[];
}

const SupplierAnalytics: React.FC<Props> = ({ suppliers, items, categories }) => {
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);

  // Map supplier id to assigned item count
  const assignmentCounts: Record<string, number> = {};
  items.forEach(it => {
    if (it.currentSupplierId) {
      assignmentCounts[it.currentSupplierId] = (assignmentCounts[it.currentSupplierId] || 0) + 1;
    }
  });

  // Sort suppliers by assignment count
  const sortedSuppliers = [...suppliers].sort((a, b) => 
    (assignmentCounts[b.id] || 0) - (assignmentCounts[a.id] || 0)
  );

  // Catalog stats
  const totalCategories = categories.length;
  const visibleCategories = categories.filter(c => c.visible !== false).length;
  const totalItems = items.length;
  const visibleItems = items.filter(it => it.visible !== false).length;

  // Supplier stats
  const totalSuppliers = suppliers.length;
  const totalAssignments = Object.values(assignmentCounts).reduce((sum, count) => sum + count, 0);
  const itemsNotAssigned = totalItems - totalAssignments;
  const activeSuppliers = sortedSuppliers.filter(s => (assignmentCounts[s.id] || 0) > 0).length;

  const now = Date.now();
  const buckets = suppliers.map(s => {
    const ts = s.lastPriceUpdate ? (s.lastPriceUpdate.toDate ? s.lastPriceUpdate.toDate().getTime() : (s.lastPriceUpdate.seconds ? s.lastPriceUpdate.seconds * 1000 : null)) : null;
    const diffDays = ts ? Math.floor((now - ts) / 86400000) : null;
    return { id: s.id, name: s.businessName || s.name || 'Unnamed', diffDays };
  });

  const today = buckets.filter(b => b.diffDays === 0).length;
  const recent = buckets.filter(b => b.diffDays !== null && b.diffDays > 0 && b.diffDays <= 7).length;
  const old = buckets.filter(b => b.diffDays !== null && b.diffDays > 7).length;
  const never = buckets.filter(b => b.diffDays === null).length;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Main Analytics Row - All 4 Sections Horizontal */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 2fr',
        gap: 16
      }}>
        {/* Catalog Statistics */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#6b7280',
            marginBottom: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            📚 Catalog Stats
          </div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Total Cats</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{totalCategories}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Visible</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{visibleCategories}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Total Items</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{totalItems}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Visible</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{visibleItems}</div>
            </div>
          </div>
        </div>

        {/* Supplier Statistics */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#6b7280',
            marginBottom: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            👥 Supplier Stats
          </div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Total</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{totalSuppliers}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Active</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{activeSuppliers}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Assigned</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{totalAssignments}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Unassigned</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{itemsNotAssigned}</div>
            </div>
          </div>
        </div>

        {/* Price Update Status */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#6b7280',
            marginBottom: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            ⏱️ Price Updates
          </div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Today</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{today}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Last 7d</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{recent}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Older</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{old}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 500 }}>Never</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{never}</div>
            </div>
          </div>
        </div>

        {/* Supplier Assignments Table */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          padding: 20, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb',
          maxHeight: 400,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
        <div style={{ 
          fontSize: 13, 
          fontWeight: 600, 
          color: '#6b7280', 
          marginBottom: 14,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          📊 Supplier Assignments
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: 13
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '10px 8px', 
                  fontWeight: 600, 
                  color: '#6b7280',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Supplier
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '10px 8px', 
                  fontWeight: 600, 
                  color: '#6b7280',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Assigned Items
                </th>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '10px 8px', 
                  fontWeight: 600, 
                  color: '#6b7280',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Last Updated
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '10px 8px', 
                  fontWeight: 600, 
                  color: '#6b7280',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: 60
                }}>
                  Info
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSuppliers.slice(0, 10).map(s => {
                const count = assignmentCounts[s.id] || 0;
                if (count === 0) return null;
                const lastUpdate = s.lastPriceUpdate?.toDate ? s.lastPriceUpdate.toDate() : null;
                const lastUpdateStr = lastUpdate 
                  ? `${lastUpdate.toLocaleDateString()} ${lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Never';
                const isExpanded = expandedSupplierId === s.id;
                const itemsOffered = s.prices ? Object.keys(s.prices).length : 0;
                
                return (
                  <React.Fragment key={s.id}>
                    <tr 
                      style={{ 
                        borderBottom: isExpanded ? 'none' : '1px solid #f3f4f6',
                        transition: 'background 0.15s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setExpandedSupplierId(isExpanded ? null : s.id)}
                    >
                      <td style={{ 
                        padding: '10px 8px',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        {s.businessName || s.name || 'Unnamed'}
                      </td>
                      <td style={{ 
                        padding: '10px 8px',
                        textAlign: 'center'
                      }}>
                        <span style={{ 
                          background: '#eef2ff',
                          color: '#6366f1',
                          padding: '4px 12px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 13
                        }}>
                          {count}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '10px 8px',
                        color: '#6b7280',
                        fontSize: 13
                      }}>
                        {lastUpdateStr}
                      </td>
                      <td style={{ 
                        padding: '10px 8px',
                        textAlign: 'center'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedSupplierId(isExpanded ? null : s.id);
                          }}
                          style={{ 
                            cursor: 'pointer',
                            border: 'none',
                            background: isExpanded ? '#6366f1' : '#e0e7ff',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            color: isExpanded ? '#ffffff' : '#6366f1',
                            transition: 'all 0.2s'
                          }}
                          title={isExpanded ? "Hide info" : "Show info"}
                        >
                          {isExpanded ? '−' : 'i'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td colSpan={4} style={{ padding: 0 }}>
                          <div style={{
                            background: '#f9fafb',
                            padding: 16,
                            fontSize: 13,
                            lineHeight: 1.8
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div>
                                <strong style={{ color: '#6b7280' }}>Supplier ID:</strong>
                                <span style={{ marginLeft: 8, color: '#374151' }}>{s.id}</span>
                              </div>
                              <div>
                                <strong style={{ color: '#6b7280' }}>Items Offered:</strong>
                                <span style={{ marginLeft: 8, color: '#374151' }}>{itemsOffered}</span>
                              </div>
                              {s.contact && (
                                <div>
                                  <strong style={{ color: '#6b7280' }}>Contact:</strong>
                                  <span style={{ marginLeft: 8, color: '#374151' }}>{s.contact}</span>
                                </div>
                              )}
                              {s.email && (
                                <div>
                                  <strong style={{ color: '#6b7280' }}>Email:</strong>
                                  <span style={{ marginLeft: 8, color: '#374151' }}>{s.email}</span>
                                </div>
                              )}
                              {s.phone && (
                                <div>
                                  <strong style={{ color: '#6b7280' }}>Phone:</strong>
                                  <span style={{ marginLeft: 8, color: '#374151' }}>{s.phone}</span>
                                </div>
                              )}
                              {s.address && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <strong style={{ color: '#6b7280' }}>Address:</strong>
                                  <span style={{ marginLeft: 8, color: '#374151' }}>{s.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {sortedSuppliers.filter(s => (assignmentCounts[s.id] || 0) > 0).length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: 40, 
              color: '#9ca3af', 
              fontSize: 14
            }}>
              No supplier assignments yet
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default SupplierAnalytics;
