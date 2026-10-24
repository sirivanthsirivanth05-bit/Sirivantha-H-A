import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Bookmark,
  Plus,
  Trash2,
  Filter,
  Layers,
  GraduationCap,
  X,
  Compass,
  Maximize2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ResourceCategory, ResourceItem } from '../types';

export const ResourcesView: React.FC = () => {
  const { profile, resources, toggleBookmarkResource, addCustomResource, deleteCustomResource, isFocusMode, toggleFocusMode } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  // Custom resource modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customForm, setCustomForm] = useState<{
    title: string;
    subject: string;
    category: ResourceCategory;
    url: string;
    description: string;
    tags: string;
  }>({
    title: '',
    subject: profile.subjects[0]?.name || 'Computer Science',
    category: 'Cheat Sheet',
    url: '',
    description: '',
    tags: '',
  });

  const categories: ResourceCategory[] = [
    'Cheat Sheet',
    'Video Course',
    'Interactive Simulator',
    'Documentation',
    'Practice Bank',
  ];

  // Submit custom resource
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.title.trim() || !customForm.url.trim()) return;

    const tagsArray = customForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addCustomResource({
      title: customForm.title.trim(),
      subject: customForm.subject,
      category: customForm.category,
      url: customForm.url.trim().startsWith('http') ? customForm.url.trim() : `https://${customForm.url.trim()}`,
      description: customForm.description.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['Custom', 'Class Resource'],
    });

    setCustomForm({
      title: '',
      subject: profile.subjects[0]?.name || 'Computer Science',
      category: 'Cheat Sheet',
      url: '',
      description: '',
      tags: '',
    });
    setIsAddModalOpen(false);
  };

  // Filtered resources
  const filteredResources = resources.filter((res) => {
    if (selectedSubject !== 'All' && res.subject !== selectedSubject) return false;
    if (selectedCategory !== 'All' && res.category !== selectedCategory) return false;
    if (onlyBookmarks && !res.isBookmarked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.subject.toLowerCase().includes(q) ||
        res.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Resource Library</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
              Curated & Verified
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Authoritative cheat sheets, video courses, visual simulators, and student syllabus bookmarks
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {!isFocusMode && (
            <button
              onClick={toggleFocusMode}
              className="px-3.5 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Enter distraction-free study space (hides sidebar & footer)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Focus Reading</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Resource</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cheat sheets, courses, algorithms, or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                onlyBookmarks
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>Bookmarks Only</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Subject:
          </span>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs text-slate-700 font-medium"
          >
            <option value="All">All Subjects ({resources.length})</option>
            {profile.subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-2">
            Category:
          </span>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs text-slate-700 font-medium"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(selectedSubject !== 'All' || selectedCategory !== 'All' || onlyBookmarks || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSubject('All');
                setSelectedCategory('All');
                setOnlyBookmarks(false);
                setSearchQuery('');
              }}
              className="text-xs text-teal-700 hover:underline font-medium ml-auto"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs space-y-2">
            <Compass className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No learning resources found matching your search.</p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const subjObj = profile.subjects.find((s) => s.name === res.subject);

            return (
              <div
                key={res.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {res.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleBookmarkResource(res.id)}
                        className={`p-1.5 rounded hover:bg-slate-100 transition ${
                          res.isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-slate-600'
                        }`}
                        title={res.isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                      >
                        <Bookmark className={`w-4 h-4 ${res.isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>

                      {res.isCustom && (
                        <button
                          onClick={() => deleteCustomResource(res.id)}
                          className="p-1.5 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Custom Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition leading-snug">
                    {res.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: subjObj?.color || '#0D9488' }}
                    />
                    <span>{res.subject}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {res.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {res.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Open Educational Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Academic Course Resource</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professor Davis Lecture Slides (Drive Folder)"
                  value={customForm.title}
                  onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={customForm.subject}
                    onChange={(e) => setCustomForm({ ...customForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    {profile.subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm({ ...customForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Link URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://drive.google.com/... or textbook link"
                  value={customForm.url}
                  onChange={(e) => setCustomForm({ ...customForm, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Important chapters, midterms coverage, or formula reference..."
                  value={customForm.description}
                  onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="LectureNotes, MidtermPrep, SlideDeck"
                  value={customForm.tags}
                  onChange={(e) => setCustomForm({ ...customForm, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-xs"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
