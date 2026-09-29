import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export const ManageAssignments = () => {
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Subject filter
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State (Belongs directly to Subject)
  const [formSubjectId, setFormSubjectId] = useState('');
  const [name, setName] = useState('');
  const [assignmentNumber, setAssignmentNumber] = useState(1);
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.getSubjects();
        if (res?.success) setSubjects(res.data || []);
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    };
    loadSubjects();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.getAssignments(selectedSubjectId || undefined);
      if (res?.success) setAssignments(res.data || []);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [selectedSubjectId]);

  const openCreateModal = () => {
    setEditingAssignment(null);
    setFormSubjectId(selectedSubjectId || (subjects[0]?.id || ''));
    setName('');
    setDescription('');
    setAssignmentNumber(assignments.length + 1);
    setOrder(assignments.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (assign) => {
    setEditingAssignment(assign);
    setFormSubjectId(assign.subjectId);
    setName(assign.name || '');
    setDescription(assign.description || '');
    setAssignmentNumber(assign.assignmentNumber || 1);
    setOrder(assign.order || 1);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !formSubjectId) return;

    setSubmitting(true);
    try {
      const payload = {
        subjectId: formSubjectId,
        name: name.trim(),
        assignmentNumber: parseInt(assignmentNumber, 10) || 1,
        description: description.trim(),
        order: parseInt(order, 10) || 1
      };

      if (editingAssignment) {
        await api.updateAssignment(editingAssignment.id, payload);
      } else {
        await api.createAssignment(payload);
      }

      setModalOpen(false);
      fetchAssignments();
    } catch (err) {
      alert("Operation failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (assign) => {
    await api.deleteAssignment(assign.id);
    fetchAssignments();
  };

  const subjectMap = subjects.reduce((acc, s) => { acc[s.id] = s.name; return acc; }, {});

  const columns = [
    { header: "Assignment #", accessor: "assignmentNumber" },
    {
      header: "Assignment Title",
      accessor: "name",
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700 }}>{row.name}</span>
          {row.description && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.description}</div>
          )}
        </div>
      )
    },
    {
      header: "Subject",
      accessor: "subjectId",
      render: (row) => (
        <span className="neo-badge" style={{ fontSize: '0.8rem' }}>
          {subjectMap[row.subjectId] || row.subjectId}
        </span>
      )
    },
    { header: "Order", accessor: "order" }
  ];

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Assignments</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Problem sets and questions attached directly to subjects.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Subject Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select
              className="neo-input"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              style={{ width: '220px', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <Button variant="primary" onClick={openCreateModal} icon={Plus}>
            Add Assignment
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader skeleton={true} count={3} />
      ) : (
        <DataTable
          columns={columns}
          data={assignments}
          onEdit={openEditModal}
          onDelete={handleDelete}
          emptyMessage="No assignments found. Click 'Add Assignment' to create one."
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAssignment ? "Edit Assignment" : "Create New Assignment"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Parent Subject *
            </label>
            <select
              className="neo-input"
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
              required
            >
              <option value="" disabled>Select Subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Assignment Title *
            </label>
            <input
              type="text"
              className="neo-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Assignment 1: Supervised Learning"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Description
            </label>
            <textarea
              rows={2}
              className="neo-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of requirements..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Assignment Number *
              </label>
              <input
                type="number"
                min="1"
                className="neo-input"
                value={assignmentNumber}
                onChange={(e) => setAssignmentNumber(e.target.value)}
                required
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
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingAssignment ? "Update Assignment" : "Create Assignment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageAssignments;
