import React from "react";
import { t, type Lang } from "../../i18n";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Lang;
  event: {
    title: string;
    date: string | undefined;
    time: string | undefined;
    location: string;
    description: string;
    category?: string;
  } | null;
}

const EventModal = ({
  isOpen,
  onClose,
  event,
  lang = "bs",
}: EventModalProps) => {
  const tr = t(lang);
  if (!isOpen || !event) return null;

  return (
    <div className="fixed z-[9999] inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm transition-opacity">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full transform scale-100 transition-transform relative animate-zoom">
        <button
          onClick={onClose}
          aria-label={tr.events.close}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>

        {event.category && (
          <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
            {event.category}
          </span>
        )}

        <h2 className="text-3xl font-exo2 font-bold mb-6 text-sky-950">
          {event.title}
        </h2>

        <div className="space-y-3 mb-6 text-gray-700">
          <p className="flex items-center">
            <i className="fa-regular fa-calendar w-6 text-sky-700"></i>{" "}
            <strong>{tr.events.date}:</strong> <span className="ml-2">{event.date}</span>
          </p>
          <p className="flex items-center">
            <i className="fa-regular fa-clock w-6 text-sky-700"></i>{" "}
            <strong>{tr.events.time}:</strong> <span className="ml-2">{event.time}</span>
          </p>
          <p className="flex items-center">
            <i className="fa-solid fa-location-dot w-6 text-sky-700"></i>{" "}
            <strong>{tr.events.location}:</strong>{" "}
            <span className="ml-2">{event.location}</span>
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-8">
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
            {tr.events.event_description}
          </h4>
          <p className="text-gray-800 leading-relaxed">{event.description}</p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {tr.events.close}
          </button>
          <button className="bg-sky-950 hover:bg-sky-900 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors">
            {tr.events.register}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
