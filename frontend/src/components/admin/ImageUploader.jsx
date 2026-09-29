import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import Button from '../common/Button';
import { getAssetUrl } from '../../services/api';

export const ImageUploader = ({
  label = "Upload Diagram",
  currentImageUrl,
  onUpload,
  onDelete,
  disabled = false
}) => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid image format. Allowed formats: JPEG, PNG, WEBP.");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm("Are you sure you want to remove this diagram?")) return;
    setDeleting(true);
    try {
      await onDelete();
      setPreview(null);
      setSelectedFile(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete diagram: " + (err.message || "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };

  const activeDisplayUrl = preview || getAssetUrl(currentImageUrl);

  return (
    <div className="neo-card-sm" style={{ padding: '1.25rem', marginTop: '0.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
        {label}
      </label>

      {/* Preview Container */}
      {activeDisplayUrl ? (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
          <div
            className="neo-inset"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              maxWidth: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <img
              src={activeDisplayUrl}
              alt="Diagram preview"
              style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            {selectedFile && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadClick}
                loading={uploading}
                icon={Check}
              >
                Save Upload
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteClick}
              loading={deleting}
              icon={Trash2}
            >
              Remove Diagram
            </Button>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--accent)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'var(--surface-color)',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-color)'}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            style={{ display: 'none' }}
            disabled={disabled}
          />
          <div
            className="neo-inset"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              margin: '0 auto 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}
          >
            <Upload size={22} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Click or drop image to upload
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Supports PNG, JPEG, WEBP (Max 5MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
