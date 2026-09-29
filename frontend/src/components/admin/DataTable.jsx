import React, { useState } from 'react';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';

export const DataTable = ({
  columns,
  data = [],
  onEdit,
  onDelete,
  title = "Records",
  emptyMessage = "No items found."
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="neo-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        {data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
            {emptyMessage}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--accent-light)' }}>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    style={{
                      padding: '0.85rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {col.header}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      textAlign: 'right'
                    }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  style={{
                    borderBottom: 'var(--border-subtle)',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: '1rem',
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                        verticalAlign: 'middle'
                      }}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td style={{ padding: '1rem', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {onEdit && (
                          <Button
                            variant="icon"
                            size="sm"
                            onClick={() => onEdit(row)}
                            title="Edit"
                            aria-label="Edit item"
                            style={{ width: '34px', height: '34px' }}
                          >
                            <Edit2 size={15} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="icon"
                            size="sm"
                            onClick={() => setDeleteTarget(row)}
                            title="Delete"
                            aria-label="Delete item"
                            className="neo-btn-danger"
                            style={{ width: '34px', height: '34px' }}
                          >
                            <Trash2 size={15} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal (Specification 39) */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Deletion"
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div
              className="neo-inset"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--danger)',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Are you sure?
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Deleting this item may permanently remove it along with all related child content (Units, Assignments, Questions, or Diagrams).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={isDeleting}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DataTable;
