import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, Sparkles, User, AlertCircle, Phone, Mail } from 'lucide-react';
import { Student } from '../../types';
import { useClassData } from '../../context/ClassDataContext';

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
];

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit
}) => {
  const { addStudent, updateStudent } = useClassData();
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    grade: 'Grade 5',
    section: 'Room 5-A',
    gender: 'female' as 'female' | 'male' | 'other',
    dob: '2014-05-15',
    photoUrl: AVATAR_PRESETS[0],
    parentName: '',
    parentRelationship: 'Mother',
    parentEmail: '',
    parentPhone: '',
    emergencyContact: '',
    learningNeeds: '',
    medicalNotes: '',
    interestsInput: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        name: studentToEdit.name,
        rollNumber: studentToEdit.rollNumber,
        grade: studentToEdit.grade || 'Grade 5',
        section: studentToEdit.section || 'Room 5-A',
        gender: studentToEdit.gender || 'female',
        dob: studentToEdit.dob || '2014-05-15',
        photoUrl: studentToEdit.photoUrl || AVATAR_PRESETS[0],
        parentName: studentToEdit.parentName || '',
        parentRelationship: studentToEdit.parentRelationship || 'Parent',
        parentEmail: studentToEdit.parentEmail || '',
        parentPhone: studentToEdit.parentPhone || '',
        emergencyContact: studentToEdit.emergencyContact || '',
        learningNeeds: studentToEdit.learningNeeds || '',
        medicalNotes: studentToEdit.medicalNotes || '',
        interestsInput: studentToEdit.interests?.join(', ') || ''
      });
    } else {
      setFormData({
        name: '',
        rollNumber: `G5-${Math.floor(100 + Math.random() * 900)}`,
        grade: 'Grade 5',
        section: 'Room 5-A',
        gender: 'female',
        dob: '2014-05-15',
        photoUrl: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
        parentName: '',
        parentRelationship: 'Parent',
        parentEmail: '',
        parentPhone: '',
        emergencyContact: '',
        learningNeeds: '',
        medicalNotes: '',
        interestsInput: 'Reading, Science, Art'
      });
    }
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter student full name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const interests = formData.interestsInput
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);

    try {
      if (studentToEdit) {
        await updateStudent(studentToEdit.id, {
          name: formData.name.trim(),
          rollNumber: formData.rollNumber.trim(),
          grade: formData.grade,
          section: formData.section,
          gender: formData.gender,
          dob: formData.dob,
          photoUrl: formData.photoUrl,
          parentName: formData.parentName.trim(),
          parentRelationship: formData.parentRelationship.trim(),
          parentEmail: formData.parentEmail.trim(),
          parentPhone: formData.parentPhone.trim(),
          emergencyContact: formData.emergencyContact.trim(),
          learningNeeds: formData.learningNeeds.trim(),
          medicalNotes: formData.medicalNotes.trim(),
          interests,
        });
      } else {
        await addStudent({
          name: formData.name.trim(),
          rollNumber: formData.rollNumber.trim(),
          grade: formData.grade,
          section: formData.section,
          gender: formData.gender,
          dob: formData.dob,
          photoUrl: formData.photoUrl,
          parentName: formData.parentName.trim(),
          parentRelationship: formData.parentRelationship.trim(),
          parentEmail: formData.parentEmail.trim(),
          parentPhone: formData.parentPhone.trim(),
          emergencyContact: formData.emergencyContact.trim(),
          learningNeeds: formData.learningNeeds.trim(),
          medicalNotes: formData.medicalNotes.trim(),
          interests,
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save student profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {studentToEdit ? 'Edit Student Profile' : 'Enroll New Student'}
              </h2>
              <p className="text-xs text-slate-500">
                Record academic baseline, photo, and parent contact details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Photo Picker */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Student Photo
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                <img
                  src={formData.photoUrl || AVATAR_PRESETS[0]}
                  alt="Student preview"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/20"
                />
                <label
                  htmlFor="photo-file-input"
                  className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  title="Upload custom image"
                >
                  <Camera className="w-5 h-5" />
                </label>
                <input
                  id="photo-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1 w-full">
                <p className="text-xs text-slate-600 mb-2 font-medium">
                  Select a student photo avatar or upload a picture:
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photoUrl: preset }))}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                        formData.photoUrl === preset
                          ? 'border-blue-600 scale-105 shadow-xs'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="photo-file-input"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    Upload from Device
                  </label>
                  <input
                    type="url"
                    placeholder="Or paste image URL"
                    value={formData.photoUrl.startsWith('data:') ? '' : formData.photoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin Chen"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student ID / Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. G5-101"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grade Level
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Section / Homeroom
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 5-A"
                  value={formData.section}
                  onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Non-Binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Parent / Guardian Info */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              2. Parent & Emergency Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Kevin & Wei Chen"
                  value={formData.parentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mother & Father, Guardian"
                  value={formData.parentRelationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentRelationship: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Email (for progress reports)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="parent@example.com"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secondary / Emergency Contact
                </label>
                <input
                  type="text"
                  placeholder="e.g. (555) 234-8909 (Grandmother - Mrs. Lin)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Educational & Medical Notes */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Learning Needs & Medical Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Learning Style / Accommodations
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Visual learner, benefits from graphic organizers, ESL support..."
                  value={formData.learningNeeds}
                  onChange={(e) => setFormData(prev => ({ ...prev, learningNeeds: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical / Allergy Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Peanut allergy, carries asthma inhaler, wears glasses..."
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalNotes: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Interests & Hobbies (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Robotics, Violin, Chess, Soccer, Creative Writing"
                  value={formData.interestsInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, interestsInput: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : studentToEdit ? 'Save Changes' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
};
