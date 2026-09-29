import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Code,
  Undo,
  Redo,
  Save,
  ArrowLeft
} from 'lucide-react';
import Button from '../common/Button';
import ImageUploader from './ImageUploader';
import api from '../../services/api';

export const QuestionEditor = ({
  question,
  subjectId,
  assignmentId,
  onSave,
  onCancel
}) => {
  const [questionNumber, setQuestionNumber] = useState(question?.questionNumber || 1);
  const [questionText, setQuestionText] = useState(question?.questionText || '');
  const [order, setOrder] = useState(question?.order || 1);
  const [questionDiagramUrl, setQuestionDiagramUrl] = useState(question?.questionDiagramUrl || null);
  const [answerDiagramUrl, setAnswerDiagramUrl] = useState(question?.answerDiagramUrl || null);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: question?.answer || '<p>Enter clear, structured answer here...</p>',
  });

  useEffect(() => {
    if (editor && question?.answer && editor.getHTML() !== question.answer) {
      editor.commands.setContent(question.answer);
    }
  }, [question, editor]);

  // Diagram upload handlers (Subject -> Assignment -> Question, NO Unit)
  const handleUploadQuestionDiagram = async (file) => {
    if (!question?.id) {
      alert("Please save the question first before uploading diagrams.");
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId || question.subjectId);
    formData.append('assignmentId', assignmentId || question.assignmentId);
    formData.append('questionId', question.id);

    const res = await api.uploadQuestionDiagram(formData);
    if (res?.success && res?.data?.url) {
      setQuestionDiagramUrl(res.data.url);
    }
  };

  const handleDeleteQuestionDiagram = async () => {
    if (question?.id) {
      await api.deleteQuestionDiagram(question.id, questionDiagramUrl);
    }
    setQuestionDiagramUrl(null);
  };

  const handleUploadAnswerDiagram = async (file) => {
    if (!question?.id) {
      alert("Please save the question first before uploading diagrams.");
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId || question.subjectId);
    formData.append('assignmentId', assignmentId || question.assignmentId);
    formData.append('questionId', question.id);

    const res = await api.uploadAnswerDiagram(formData);
    if (res?.success && res?.data?.url) {
      setAnswerDiagramUrl(res.data.url);
    }
  };

  const handleDeleteAnswerDiagram = async () => {
    if (question?.id) {
      await api.deleteAnswerDiagram(question.id, answerDiagramUrl);
    }
    setAnswerDiagramUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert("Please enter the question text.");
      return;
    }

    setSaving(true);
    try {
      const answerHtml = editor ? editor.getHTML() : '';
      const payload = {
        subjectId: subjectId || question?.subjectId,
        assignmentId: assignmentId || question?.assignmentId,
        questionNumber: parseInt(questionNumber, 10) || 1,
        questionText: questionText.trim(),
        answer: answerHtml,
        order: parseInt(order, 10) || 1,
        questionDiagramUrl,
        answerDiagramUrl
      };

      await onSave(payload);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save question: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="neo-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: 'var(--border-subtle)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
          {question?.id ? 'Edit Question' : 'Create New Question'}
        </h2>
        <Button onClick={onCancel} icon={ArrowLeft} size="sm">
          Back
        </Button>
      </div>

      {/* Row: Question Number & Order */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Question Number *
          </label>
          <input
            type="number"
            min="1"
            className="neo-input"
            value={questionNumber}
            onChange={(e) => setQuestionNumber(e.target.value)}
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

      {/* Question Text */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Question Statement *
        </label>
        <textarea
          rows={3}
          className="neo-input"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="e.g. Explain supervised learning and its mathematical foundations."
          required
        />
      </div>

      {/* Question Diagram (STRICTLY OUTSIDE answer box) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <ImageUploader
          label="Question Diagram (Renders OUTSIDE answer box)"
          currentImageUrl={questionDiagramUrl}
          onUpload={handleUploadQuestionDiagram}
          onDelete={handleDeleteQuestionDiagram}
          disabled={!question?.id}
        />
        {!question?.id && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            * Note: Save question first to enable direct image attachment.
          </span>
        )}
      </div>

      {/* TipTap Rich Text Answer Editor */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Answer Content (Rich Text)
        </label>

        {/* Toolbar */}
        {editor && (
          <div
            className="neo-card-sm"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              padding: '0.5rem',
              marginBottom: '0.5rem',
              background: 'var(--surface-color)'
            }}
          >
            <Button
              size="sm"
              variant="icon"
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <Bold size={15} />
            </Button>
            <Button
              size="sm"
              variant="icon"
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <Italic size={15} />
            </Button>
            <Button
              size="sm"
              variant="icon"
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            >
              <Heading2 size={15} />
            </Button>
            <Button
              size="sm"
              variant="icon"
              active={editor.isActive('heading', { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Heading 3"
            >
              <Heading3 size={15} />
            </Button>
            <Button
              size="sm"
              variant="icon"
              active={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              <List size={15} />
            </Button>
            <Button
              size="sm"
              variant="icon"
              active={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <ListOrdered size={15} />
            </Button>
            <Button
              size="sm"
              variant="icon"
              active={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
            >
              <Code size={15} />
            </Button>
            <Button
              size="sm"
              variant="icon"
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo size={15} />
            </Button>
            <Button
              size="sm"
              variant="icon"
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo size={15} />
            </Button>
          </div>
        )}

        <div className="neo-inset tiptap-editor" style={{ padding: '1rem', minHeight: '220px' }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Answer Diagram (STRICTLY INSIDE answer box) */}
      <div style={{ marginBottom: '2rem' }}>
        <ImageUploader
          label="Answer Diagram (Renders INSIDE answer box)"
          currentImageUrl={answerDiagramUrl}
          onUpload={handleUploadAnswerDiagram}
          onDelete={handleDeleteAnswerDiagram}
          disabled={!question?.id}
        />
      </div>

      {/* Save Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: 'var(--border-subtle)', paddingTop: '1.25rem' }}>
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving} icon={Save}>
          Save Question
        </Button>
      </div>
    </form>
  );
};

export default QuestionEditor;
