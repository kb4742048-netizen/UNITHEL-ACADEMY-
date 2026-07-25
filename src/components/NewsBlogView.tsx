import React, { useState } from 'react';
import { Search, BookOpen, Calendar, X } from 'lucide-react';
import { Blog } from '../types';

interface NewsBlogViewProps {
  blogs: Blog[];
}

export default function NewsBlogView({ blogs }: NewsBlogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [readingBlog, setReadingBlog] = useState<Blog | null>(null);

  // Derive categories
  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category)))];

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#F5F1E8] text-[#1E293B] min-h-screen py-6 px-4">
      <div className="max-w-md mx-auto sm:max-w-xl md:max-w-4xl space-y-5">
        
        {/* Page Banner */}
        <div className="text-center bg-[#0A1F44] border-2 border-[#C9A227] text-white py-8 px-4 shadow-sm relative">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A227] font-sans font-bold block mb-1">
            Circle Newsroom
          </span>
          <h1 className="font-serif text-xl sm:text-2xl font-black uppercase tracking-wide">
            News & Updates
          </h1>
          <p className="max-w-sm mx-auto text-[11px] text-gray-300 mt-1 font-sans leading-relaxed">
            Read updates on alumni achievements, academic accomplishments, community initiatives, and general notifications.
          </p>
        </div>

        {/* Filters and Search toolbar */}
        <div className="bg-white p-4 border border-gray-200 shadow-sm flex flex-col gap-3">
          {/* Category buttons */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#C9A227] text-[#0A1F44]'
                    : 'bg-[#F5F1E8] text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search updates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5F1E8] border border-gray-300 text-xs px-3 py-2 pl-9 focus:outline-none focus:border-[#C9A227] rounded-none"
            />
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Blog Post Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBlogs.map((blog) => (
              <div 
                key={blog.id} 
                className="bg-white border border-[#C9A227]/20 shadow-sm flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="h-40 overflow-hidden relative bg-gray-100">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-[#0A1F44] text-[#C9A227] border border-[#C9A227] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                      {blog.category}
                    </span>
                    {blog.isPinned && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                        PINNED
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center space-x-1.5 text-[9px] text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(blog.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wide line-clamp-1">
                      {blog.title}
                    </h3>
                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => setReadingBlog(blog)}
                    className="w-full py-2 border border-[#C9A227] text-[#0A1F44] font-bold text-[10px] uppercase tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-colors"
                  >
                    Read Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200">
            <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-sans uppercase tracking-wider">No matching updates found.</p>
          </div>
        )}

      </div>

      {/* READ BLOG OVERLAY MODAL */}
      {readingBlog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#F5F1E8] text-[#1E293B] border-2 border-[#C9A227] max-w-sm sm:max-w-md w-full relative shadow-xl overflow-hidden my-4">
            
            {/* Header branding */}
            <div className="bg-[#0A1F44] text-white p-3.5 flex justify-between items-center border-b border-[#C9A227]">
              <span className="font-serif text-[10px] uppercase font-bold tracking-widest text-[#C9A227]">
                Update Entry #{readingBlog.id}
              </span>
              <button 
                onClick={() => setReadingBlog(null)}
                className="p-1 text-gray-300 hover:text-[#C9A227] active:scale-90 transition-transform"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Banner image */}
            <div className="h-44 relative bg-gray-900">
              <img 
                src={readingBlog.image} 
                alt={readingBlog.title} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-95"
              />
              <span className="absolute bottom-3 left-3 bg-[#C9A227] text-[#0A1F44] font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 border border-white/20">
                {readingBlog.category}
              </span>
            </div>

            {/* Content area */}
            <div className="p-4 space-y-3 max-h-[45vh] overflow-y-auto">
              <div className="text-[10px] text-gray-400 font-sans flex items-center space-x-1.5">
                <Calendar className="h-3 w-3" />
                <span>{new Date(readingBlog.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </div>
              <h2 className="font-serif text-sm sm:text-base font-bold text-[#0A1F44] uppercase tracking-wide leading-tight">
                {readingBlog.title}
              </h2>
              <div className="h-0.5 bg-[#C9A227]/30 w-full" />
              <p className="text-[11px] text-[#0A1F44] font-serif italic bg-amber-50 border border-[#C9A227]/10 p-2.5 leading-relaxed">
                {readingBlog.excerpt}
              </p>
              <div className="text-xs text-gray-700 leading-relaxed font-sans whitespace-pre-wrap space-y-3">
                {readingBlog.content}
              </div>
            </div>

            {/* Footer actions */}
            <div className="bg-white p-3 border-t border-gray-200 text-right">
              <button
                onClick={() => setReadingBlog(null)}
                className="px-4 py-2 bg-[#0D2B4E] text-white hover:bg-[#C9A227] hover:text-[#0A1F44] font-bold text-[10px] uppercase tracking-wider transition-colors"
              >
                Close Reader
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
