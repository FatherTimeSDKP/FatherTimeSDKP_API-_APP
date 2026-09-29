import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../firebase/authContext';
import {
  ClassroomCourse,
  ClassroomCourseWork,
  listClassroomCourses,
  createClassroomCourse,
  listCourseWork,
  publishResearchToCourse,
  deleteClassroomCourse,
} from '../services/googleClassroomService';
import { ResearchEntry } from '../types/research';
import {
  GraduationCap,
  BookOpen,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  Layers,
  Sparkles,
  School
} from 'lucide-react';

interface GoogleClassroomHubProps {
  researchEntries: ResearchEntry[];
}

export const GoogleClassroomHub: React.FC<GoogleClassroomHubProps> = ({ researchEntries }) => {
  const { user, accessToken, signInWithGoogle, logout } = useAuth();
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  const [courseWork, setCourseWork] = useState<ClassroomCourseWork[]>([]);
  
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingWork, setIsLoadingWork] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Course Modal
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('FatherTimeSDKP: Deterministic Crystal Topologies');
  const [newCourseSection, setNewCourseSection] = useState('DCP Research Seminar 2026');
  const [newCourseDesc, setNewCourseDesc] = useState('Curriculum on discrete Kapnack boundary conditions, Mod-9 phase locks, and zero-drift cross-chain bridges.');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  // Publish Research Modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string>(researchEntries[0]?.id || '');
  const [targetCourseId, setTargetCourseId] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Delete Course Confirmation (MANDATORY per Workspace guidelines)
  const [deleteCandidate, setDeleteCandidate] = useState<ClassroomCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingCourses(true);
    setErrorMessage(null);
    try {
      const list = await listClassroomCourses(accessToken);
      setCourses(list);
      if (list.length > 0 && !selectedCourse) {
        setSelectedCourse(list[0]);
        setTargetCourseId(list[0].id);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error fetching courses from Google Classroom');
    } finally {
      setIsLoadingCourses(false);
    }
  }, [accessToken, selectedCourse]);

  const fetchWorkForCourse = useCallback(async (courseId: string) => {
    if (!accessToken) return;
    setIsLoadingWork(true);
    try {
      const workList = await listCourseWork(accessToken, courseId);
      setCourseWork(workList);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error fetching coursework');
    } finally {
      setIsLoadingWork(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchCourses();
    }
  }, [accessToken, fetchCourses]);

  useEffect(() => {
    if (selectedCourse?.id) {
      fetchWorkForCourse(selectedCourse.id);
    }
  }, [selectedCourse, fetchWorkForCourse]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newCourseName.trim()) return;

    setIsCreatingCourse(true);
    setErrorMessage(null);
    try {
      const created = await createClassroomCourse(accessToken, {
        name: newCourseName,
        section: newCourseSection,
        description: newCourseDesc,
      });
      setSuccessMessage(`Course "${created.name}" created successfully in Google Classroom!`);
      setIsNewCourseModalOpen(false);
      await fetchCourses();
      setSelectedCourse(created);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create course in Google Classroom');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handlePublishResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !targetCourseId || !selectedEntryId) return;

    const entry = researchEntries.find((r) => r.id === selectedEntryId);
    if (!entry) return;

    setIsPublishing(true);
    setErrorMessage(null);
    try {
      const assignmentTitle = `Treatise Study: ${entry.title}`;
      const assignmentBody = `Category: ${entry.category}\n\nAbstract:\n${entry.summary}\n\nKey Equations:\n${entry.equations}\n\nObservational Telemetry:\n${entry.dataPoints}\n\nDecoherence Stability: ${entry.decoherenceScore ?? 1.000000}\nMod-9 Prime Lock: ${entry.primeLock ?? 104729}\n\nAssignment Task: Review equations, confirm zero-drift invariants, and submit verification log.`;

      await publishResearchToCourse(accessToken, targetCourseId, assignmentTitle, assignmentBody);
      setSuccessMessage(`Research "${entry.title}" published as an assignment to Google Classroom!`);
      setIsPublishModalOpen(false);
      await fetchWorkForCourse(targetCourseId);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to publish research to Classroom');
    } finally {
      setIsPublishing(false);
    }
  };

  const executeDeleteCourse = async () => {
    if (!accessToken || !deleteCandidate) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteClassroomCourse(accessToken, deleteCandidate.id);
      setSuccessMessage(`Course "${deleteCandidate.name}" removed from Google Classroom.`);
      setDeleteCandidate(null);
      await fetchCourses();
      if (selectedCourse?.id === deleteCandidate.id) {
        setSelectedCourse(null);
        setCourseWork([]);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-900/60 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Google Classroom Integration
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-300">
                1P Google Workspace Client OAuth
              </span>
              {user && (
                <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[11px] text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Authenticated: {user.email}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Google Classroom &amp; Academic Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Publish FatherTimeSDKP treatises, Kapnack solvers, and Digital Crystal Protocol coursework directly into Google Classroom with permission from instructors and students.
            </p>
          </div>

          {/* Connect / User Info Card */}
          <div className="rounded-2xl border border-emerald-800/80 bg-slate-950/90 p-4 shadow-xl flex-shrink-0 space-y-3 min-w-[260px]">
            {!user || !accessToken ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                  <School className="h-4 w-4 text-emerald-400" />
                  <span>Connect Google Classroom</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Grant permission to access and publish coursework to your Google Classroom.
                </p>

                {/* Sign in with Google Button */}
                <button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white px-4 py-2.5 text-xs font-medium text-slate-900 shadow-md hover:bg-slate-100 transition-all cursor-pointer font-sans"
                >
                  <svg className="h-4 w-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Classroom Connected</span>
                  </span>
                  <button onClick={logout} className="text-[11px] text-slate-400 hover:text-rose-400 underline cursor-pointer">
                    Disconnect
                  </button>
                </div>
                <div className="text-[11px] text-slate-300 truncate">{user.email}</div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setIsNewCourseModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600/30 border border-emerald-500/50 px-2.5 py-1.5 text-[11px] text-emerald-200 hover:bg-emerald-600/40 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Course</span>
                  </button>
                  <button
                    onClick={fetchCourses}
                    disabled={isLoadingCourses}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white cursor-pointer"
                    title="Refresh Courses"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingCourses ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPublishModalOpen(true)}
            disabled={!accessToken || courses.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Publish Research to Course</span>
          </button>

          <a
            href="https://classroom.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-400 hover:text-emerald-300 transition-colors ml-auto"
          >
            <span>Open Google Classroom</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Course & Coursework Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Courses List */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100">Your Classes</h2>
              <span className="text-[10px] text-slate-500">({courses.length})</span>
            </div>
          </div>

          {!accessToken ? (
            <div className="p-6 text-center rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
              Sign in with Google above to view classes.
            </div>
          ) : isLoadingCourses ? (
            <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Loading classes...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <School className="h-6 w-6 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No classes found in Google Classroom.</p>
              <button
                onClick={() => setIsNewCourseModalOpen(true)}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                + Create your first class
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {courses.map((course) => {
                const isSelected = selectedCourse?.id === course.id;
                return (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-600/80 shadow-md'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-200">{course.name}</div>
                        {course.section && <div className="text-[10px] text-slate-400">{course.section}</div>}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCandidate(course);
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Code: {course.enrollmentCode || 'N/A'}</span>
                      {course.alternateLink && (
                        <a
                          href={course.alternateLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-emerald-400 hover:underline"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Coursework in Selected Course */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-400" />
                <span>Coursework &amp; Research Assignments</span>
              </h2>
              {selectedCourse && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Class: <span className="text-emerald-300 font-semibold">{selectedCourse.name}</span>
                </p>
              )}
            </div>

            {selectedCourse && (
              <button
                onClick={() => {
                  setTargetCourseId(selectedCourse.id);
                  setIsPublishModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/50 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-600/40 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Assignment</span>
              </button>
            )}
          </div>

          {!selectedCourse ? (
            <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
              Select a class on the left to view assignments and coursework.
            </div>
          ) : isLoadingWork ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-teal-400" />
              <span>Loading coursework...</span>
            </div>
          ) : courseWork.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <BookOpen className="h-6 w-6 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No assignments created yet in this class.</p>
              <button
                onClick={() => {
                  setTargetCourseId(selectedCourse.id);
                  setIsPublishModalOpen(true);
                }}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                Publish a research treatise to this class
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {courseWork.map((work) => (
                <div
                  key={work.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-800/60 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-100">{work.title}</div>
                      {work.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-3 whitespace-pre-line">
                          {work.description}
                        </p>
                      )}
                    </div>

                    {work.alternateLink && (
                      <a
                        href={work.alternateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-1 text-[11px] text-emerald-400 hover:text-white flex-shrink-0"
                      >
                        <span>View</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                    <span>Points: {work.maxPoints ?? 100}</span>
                    <span>State: {work.state || 'PUBLISHED'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MANDATORY Confirmation Dialog for Deleting Course */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-900/60 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertCircle className="h-5 w-5" />
              <span>Confirm Class Deletion</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete the Google Classroom course <span className="text-white font-bold">&ldquo;{deleteCandidate.name}&rdquo;</span>? This will permanently remove access for teachers and students.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteCourse}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Course Modal */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <School className="h-4 w-4 text-emerald-400" />
                <span>Create Course in Google Classroom</span>
              </div>
              <button
                onClick={() => setIsNewCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Course Name:</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Section:</label>
                <input
                  type="text"
                  value={newCourseSection}
                  onChange={(e) => setNewCourseSection(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Description:</label>
                <textarea
                  rows={3}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCourse}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingCourse ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Research Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-teal-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <Send className="h-4 w-4 text-teal-400" />
                <span>Publish Research as Classroom Assignment</span>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishResearch} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Target Google Classroom Course:</label>
                <select
                  required
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
                >
                  <option value="">Select a course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.section ? `(${c.section})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Research Paper to Publish:</label>
                <select
                  required
                  value={selectedEntryId}
                  onChange={(e) => setSelectedEntryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
                >
                  {researchEntries.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.category}] {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-teal-500 hover:to-emerald-500 cursor-pointer disabled:opacity-50"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
