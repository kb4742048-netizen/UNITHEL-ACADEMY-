import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Compass } from 'lucide-react';
import { Event } from '../types';

interface EventsViewProps {
  events: Event[];
}

export default function EventsView({ events }: EventsViewProps) {
  const [filterMode, setFilterMode] = useState<'upcoming' | 'past'>('upcoming');

  const now = new Date().setHours(0,0,0,0);

  const upcomingEvents = events
    .filter(e => new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime());

  const pastEvents = events
    .filter(e => new Date(e.date).getTime() < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayedEvents = filterMode === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="bg-[#F5F1E8] text-[#1E293B] min-h-screen py-6 px-4">
      <div className="max-w-md mx-auto sm:max-w-xl md:max-w-4xl space-y-5">
        
        {/* Banner header */}
        <div className="text-center bg-[#0A1F44] border-2 border-[#C9A227] text-white py-8 px-4 shadow-sm relative">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A227] font-sans font-bold block mb-1">
            Circle Gatherings
          </span>
          <h1 className="font-serif text-xl sm:text-2xl font-black uppercase tracking-wide">
            Events & Gatherings
          </h1>
          <p className="max-w-sm mx-auto text-[11px] text-gray-300 mt-1 font-sans leading-relaxed">
            Coordinate your schedule for upcoming academic symposia, alumni dinner lectures, annual networking forums, and reunions.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex justify-center">
          <div className="bg-white border border-gray-300 p-1 inline-flex w-full sm:w-auto">
            <button
              onClick={() => setFilterMode('upcoming')}
              className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors text-center ${
                filterMode === 'upcoming'
                  ? 'bg-[#C9A227] text-[#0A1F44]'
                  : 'text-gray-600 hover:text-[#0A1F44]'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilterMode('past')}
              className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors text-center ${
                filterMode === 'past'
                  ? 'bg-[#0A1F44] text-white border border-[#C9A227]'
                  : 'text-gray-600 hover:text-[#0A1F44]'
              }`}
            >
              Past Records
            </button>
          </div>
        </div>

        {/* Event List */}
        {displayedEvents.length > 0 ? (
          <div className="space-y-4">
            {displayedEvents.map((event) => (
              <div 
                key={event.id} 
                className="bg-white border border-[#C9A227]/20 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-sm transition-shadow relative"
              >
                {/* Visual Insignia decoration (hidden on mobile) */}
                <div className="absolute right-4 top-4 hidden md:block opacity-5 pointer-events-none">
                  <Compass className="h-16 w-16 text-[#C9A227]" />
                </div>

                {/* Calendar Ribbon block (Horizontal on mobile, vertical block on desktop) */}
                <div className="bg-[#0D2B4E] border border-[#C9A227] text-white py-3 px-4 flex flex-row sm:flex-col items-center justify-between sm:justify-center text-center shrink-0 w-full sm:w-24 sm:h-24">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-amber-200">
                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                  <span className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white leading-none">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="text-[9px] uppercase text-gray-300 font-sans tracking-wider">
                    {new Date(event.date).getFullYear()}
                  </span>
                </div>

                {/* Info area */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wide">
                      {event.title}
                    </h3>
                    <p className="text-[11px] text-gray-600 leading-relaxed font-sans mt-1">
                      {event.description || 'No additional logistics coordinates have been declared.'}
                    </p>
                  </div>

                  {/* Coordinates metrics bar */}
                  <div className="grid grid-cols-1 gap-1.5 text-[11px] font-sans text-gray-500 border-t border-gray-100 pt-2">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
                      <span>Time: {event.time}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
                      <span>Venue: {event.venue}</span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-sans uppercase tracking-widest">No scheduled events in this view.</p>
          </div>
        )}

      </div>
    </div>
  );
}
