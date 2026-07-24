import React, { useEffect, useState } from "react";
import { t, type Lang } from "../../i18n";
import "./EventCalendar.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; message: string },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 mt-8 flex-col">
          <h2>{this.props.message}</h2>
          <pre className="text-sm mt-2">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import bsLocale from "@fullcalendar/core/locales/bs";
import enGbLocale from "@fullcalendar/core/locales/en-gb";

import EventModal from "./EventModal";

interface EventData {
  title: string;
  description: string;
  datetime: string | Date;
  location: string;
  category?: string;
}

interface Event {
  data: EventData;
}

interface SelectedEvent {
  title: string;
  description: string;
  location: string;
  category?: string;
  date: string;
  time: string;
}

export default function EventCalendar({
  events = [],
  lang = "bs",
}: {
  events?: Event[];
  lang?: Lang;
}) {
  const tr = t(lang);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string>(tr.events.all);
  const mobileMonthNames =
    lang === "bs"
      ? ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  // Extract unique categories
  const categories = Array.from(
    new Set([
      tr.events.all,
      ...(events.map((e) => e.data.category).filter(Boolean) as string[]),
    ]),
  );

  const filteredEvents =
    activeCategory === tr.events.all
      ? events
      : events.filter((e) => e.data.category === activeCategory);

  const calendarEvents = filteredEvents.map((event) => ({
    title: event.data.title,
    date: event.data.datetime,
    extendedProps: {
      description: event.data.description,
      location: event.data.location,
      category: event.data.category,
    },
  }));

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description,
      location: clickInfo.event.extendedProps.location,
      category: clickInfo.event.extendedProps.category,
      date: clickInfo.event.start?.toLocaleDateString(),
      time: clickInfo.event.start?.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setIsModalOpen(true);
  };

  return (
    <ErrorBoundary message={tr.events.calendar_error}>
      <div className="event-calendar-container bg-white p-4 md:p-8 shadow-md mt-8 mb-16">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-sky-950 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <FullCalendar
          plugins={[dayGridPlugin]}
          locales={[bsLocale, enGbLocale]}
          locale={lang === "bs" ? "bs" : "en-gb"}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "today",
          }}
          titleFormat={
            isMobile
              ? ({ date }) =>
                  `${mobileMonthNames[date.month]} ${date.year}`
              : { year: "numeric", month: "long" }
          }
          dayHeaderFormat={
            isMobile ? { weekday: "narrow" } : { weekday: "short" }
          }
          initialView="dayGridMonth"
          dayMaxEvents={true}
          events={calendarEvents}
          displayEventTime={!isMobile}
          businessHours={true}
          fixedWeekCount={false}
          height={"auto"}
          contentHeight={600}
          eventDisplay="block"
          eventDidMount={(info) => {
            info.el.title = info.event.title;
          }}
          eventClick={handleEventClick}
        />

        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          lang={lang}
        />
      </div>
    </ErrorBoundary>
  );
}
