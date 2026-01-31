import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../context/NotesContext';
import { Photo } from '../types';
import { uploadMultiplePhotos, UploadProgress } from '../utils/imageUpload';
import { getEarliestPhotoDate } from '../utils/exifReader';
import { TRIP_START_DATE, TRIP_END_DATE, toLocalDateString } from '../constants';

const JOURNAL_PASSWORD = 'jordan2024';
const SESSION_KEY = 'journal_authenticated';

// Generate array of all trip dates
const generateTripDates = (): { value: string; label: string }[] => {
  const dates: { value: string; label: string }[] = [];
  const current = new Date(TRIP_START_DATE);
  const end = new Date(TRIP_END_DATE);

  while (current <= end) {
    const isoDate = toLocalDateString(current);
    const dayNum = Math.floor((current.getTime() - TRIP_START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const label = `Day ${dayNum} - ${current.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })}`;
    dates.push({ value: isoDate, label });
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const TRIP_DATES = generateTripDates();

interface SelectedPhoto {
  file: File;
  preview: string;
  status: UploadProgress['status'];
  progress: number;
}

interface NoteFormProps {
  date: string;
  location?: string;
}

export const NoteForm: React.FC<NoteFormProps> = ({ date, location }) => {
  const { addNote } = useNotes();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [author, setAuthor] = useState<'Harry' | 'Trent'>('Harry');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tripDate, setTripDate] = useState(date); // The trip day being described
  const [exifDetected, setExifDetected] = useState<string | null>(null); // Show EXIF detection message
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update tripDate if the viewing date changes (user navigates to different day)
  useEffect(() => {
    if (selectedPhotos.length === 0) {
      setTripDate(date);
    }
  }, [date, selectedPhotos.length]);

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText =
      content.substring(0, start) +
      prefix + selectedText + suffix +
      content.substring(end);

    setContent(newText);

    // Restore cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText
        ? start + prefix.length + selectedText.length + suffix.length
        : start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertBulletPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    // Find the start of the current line
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;

    const newText =
      content.substring(0, lineStart) +
      '- ' +
      content.substring(lineStart);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2);
    }, 0);
  };

  useEffect(() => {
    const authenticated = sessionStorage.getItem(SESSION_KEY) === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === JOURNAL_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setPasswordError(false);
      window.dispatchEvent(new Event('journal-authenticated'));
    } else {
      setPasswordError(true);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const newPhotos: SelectedPhoto[] = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'compressing' as const,
      progress: 0,
    }));

    setSelectedPhotos((prev) => [...prev, ...newPhotos]);
    setUploadError(null);

    // Try to extract EXIF date from photos
    try {
      const exifDate = await getEarliestPhotoDate(fileArray);
      if (exifDate) {
        // Check if the detected date falls within the trip dates
        const tripDateObj = TRIP_DATES.find(d => d.value === exifDate.dateString);
        if (tripDateObj) {
          setTripDate(exifDate.dateString);
          setExifDetected(`Photo date detected: ${tripDateObj.label}`);
          setTimeout(() => setExifDetected(null), 5000);
        } else {
          // Date is outside trip range, just notify
          const detectedDate = exifDate.date.toLocaleDateString('en-AU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          setExifDetected(`Photo from ${detectedDate} (outside trip dates)`);
          setTimeout(() => setExifDetected(null), 5000);
        }
      }
    } catch (err) {
      console.warn('Could not read EXIF data:', err);
    }

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedPhotos.length === 0) return;

    setIsSubmitting(true);
    setUploadError(null);

    try {
      let uploadedPhotos: Photo[] = [];

      // Upload photos if any selected
      if (selectedPhotos.length > 0) {
        const files = selectedPhotos.map((p) => p.file);

        uploadedPhotos = await uploadMultiplePhotos(
          files,
          author,
          tripDate, // Use the selected trip date for organizing photos
          (index, status) => {
            setSelectedPhotos((prev) => {
              const updated = [...prev];
              if (updated[index]) {
                updated[index] = {
                  ...updated[index],
                  status: status.status,
                  progress: status.progress,
                };
              }
              return updated;
            });
          }
        );
      }

      // Add note with photos - uses tripDate (the day being described)
      const writeStatus = await addNote(author, content.trim(), tripDate, location, uploadedPhotos);

      // Cleanup
      selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
      setContent('');
      setSelectedPhotos([]);
      setTripDate(date); // Reset to current viewing date
      setExifDetected(null);
      setSuccessMessage(writeStatus === 'confirmed' ? 'Note posted!' : 'Note saved locally, syncing...');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit note:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="text-lg">🔒</span> Add a Journal Entry
        </h4>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Enter password to write notes
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              placeholder="Password"
              className={`w-full px-4 py-3 rounded-xl border ${
                passwordError
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-200 bg-white'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-2">Incorrect password</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Unlock Journal
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="text-lg">📝</span> Add a Journal Entry
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Who's writing?</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAuthor('Harry')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                author === 'Harry'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              Harry
            </button>
            <button
              type="button"
              onClick={() => setAuthor('Trent')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                author === 'Trent'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              Trent
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Which trip day is this about?
          </label>
          <select
            value={tripDate}
            onChange={(e) => {
              setTripDate(e.target.value);
              setExifDetected(null);
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            {TRIP_DATES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          {exifDetected && (
            <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {exifDetected}
            </p>
          )}
          <p className="text-slate-400 text-xs mt-1">
            Photos will appear on this day in the journal
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Your note</label>
          {/* Formatting toolbar */}
          <div className="flex gap-1 mb-2">
            <button
              type="button"
              onClick={() => insertFormatting('**')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 italic text-sm transition-colors"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={insertBulletPoint}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm transition-colors"
              title="Bullet point"
            >
              • List
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening on your adventure today?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Photo Upload Section */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Add Photos</label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            className="hidden"
            id="photo-upload"
          />

          <div className="flex flex-wrap gap-3">
            {/* Photo previews */}
            {selectedPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                />
                {/* Upload progress overlay */}
                {isSubmitting && photo.status !== 'done' && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="text-white text-xs text-center">
                      {photo.status === 'compressing' && (
                        <div>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mx-auto mb-1"></div>
                          <span>Compressing</span>
                        </div>
                      )}
                      {photo.status === 'uploading' && (
                        <div>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mx-auto mb-1"></div>
                          <span>Uploading</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {photo.status === 'done' && isSubmitting && (
                  <div className="absolute inset-0 bg-emerald-500/50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {/* Remove button */}
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    x
                  </button>
                )}
              </div>
            ))}

            {/* Add photo button */}
            <label
              htmlFor="photo-upload"
              className={`w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs text-slate-400 mt-1">Add</span>
            </label>
          </div>

          {uploadError && (
            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && selectedPhotos.length === 0)}
            className={`bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all ${
              isSubmitting || (!content.trim() && selectedPhotos.length === 0)
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post Note'}
          </button>

          {showSuccess && (
            <span className={`font-medium animate-in fade-in ${successMessage.includes('syncing') ? 'text-amber-600' : 'text-emerald-600'}`}>
              {successMessage}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
