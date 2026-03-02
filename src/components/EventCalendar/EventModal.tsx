import React from 'react';
import { t, getLang } from '../../i18n';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        title: string;
        date: string | undefined;
        time: string | undefined;
        location: string;
        description: string;
    } | null;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
    if (!isOpen || !event) return null;
    const tr = t(getLang());

    return (
        <div className="fixed z-20 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
                <p className="mb-2"><strong>{tr.events.date}:</strong> {event.date}</p>
                <p className="mb-2"><strong>{tr.events.time}:</strong> {event.time}</p>
                <p className="mb-2"><strong>{tr.events.location}:</strong> {event.location}</p>
                <p className="mb-4">{event.description}</p>
                <div className='flex gap-2'>
                    <button className="bg-[#46479e] text-white px-4 py-2 rounded">{tr.events.register}</button>
                    <button onClick={onClose} className="bg-[#46479e] text-white px-4 py-2 rounded">{tr.events.close}</button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;