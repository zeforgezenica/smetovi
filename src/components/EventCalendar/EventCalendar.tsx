import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import bsLocale from '@fullcalendar/core/locales/bs'
import EventModal from './EventModal'
import type {EventClickArg} from "@fullcalendar/core"

interface Event {
  data: {
      datetime: string;
    title: string;
    description: string;
    date: string;
    location: string;
  };
}

interface SelectedEvent {
  title: string;
  description: string;
  location: string;
  date: string | undefined;
  time: string | undefined;
}

export default function EventCalendar({events} : {events: Event[]}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);

    const calendarEvents = events.map(event => ({
        title: event.data.title,
        date: event.data.datetime,
        extendedProps: {
            description: event.data.description,
            location: event.data.location,
        }
    }));

    const handleEventClick = (clickInfo: EventClickArg) => {
        setSelectedEvent({
            title: clickInfo.event.title,
            description: clickInfo.event.extendedProps?.description,
            location: clickInfo.event.extendedProps?.location,
            date: clickInfo.event.start?.toLocaleDateString(),
            time: clickInfo.event.start?.toLocaleTimeString(),
        });
        setIsModalOpen(true);
    }

    return (
    <div className="event-calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin]}
        headerToolbar={{
          left: '',
          center: 'title'
        }}
        initialView="dayGridMonth"
        dayMaxEvents={true}
        events={calendarEvents}
        businessHours={true}
        fixedWeekCount={false}
        height={'90vh'}
        locale={bsLocale}
        eventDisplay={'block'}
        eventColor={'var(--gray-light)'}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false
        }}
        eventClick={handleEventClick}
      />
      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  )
}