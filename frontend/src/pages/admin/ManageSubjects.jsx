import React, { useState, useEffect } from 'react';
import { Plus, Book } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.getSubjects();
      if (res?.success) setSubjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setDescription('');
    setOrder(subjects.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setName(subject.name || '');
    setDescription(subject.description || '');
    setOrder(subject.order || 1);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        order: parseInt(order, 10) || 1
      };

      if (editingSubject) {
        await api.updateSubject(editingSubject.id, payload);
      } else {
        await api.createSubject(payload);
      }

      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      alert("Operation failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (subject) => {
    await api.deleteSubject(subject.id);
    fetchSubjects();
  };

  const columns = [
    { header: "Order", accessor: "order" },
    {
      header: "Subject Name",
      accessor: "name",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
          {row.description && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.description}</div>
          )}
        </div>
      )
    },
    {
      header: "Created At",
      accessor: "createdAt",
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'
    }
  ];

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Subjects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Root curriculum subjects and course outlines.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} icon={Plus}>
          Add Subject
        </Button>
      </div>

      {loading ? (
        <Loader skeleton={true} count={3} />
      ) : (
        <DataTable
          columns={columns}
          data={subjects}
          onEdit={openEditModal}
          onDelete={handleDelete}
          emptyMessage="No subjects have been created yet. Click 'Add Subject' to start."
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? "Edit Subject" : "Create New Subject"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Subject Name *
            </label>
            <input
              type="text"
              className="neo-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Explainable Artificial Intelligence"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Description
            </label>
            <textarea
              rows={3}
              className="neo-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of this subject syllabus..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Sort Order
            </label>
            <input
              type="number"
              min="1"
              className="neo-input"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingSubject ? "Update Subject" : "Create Subject"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSubjects;
