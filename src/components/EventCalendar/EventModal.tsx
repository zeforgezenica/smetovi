import React from 'react'

const EventModal = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed z-20 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
        <p className="mb-2"><strong>Date:</strong> {event.date}</p>
        <p className="mb-2"><strong>Time:</strong> {event.time}</p>
        <p className="mb-2"><strong>Location:</strong> {event.location}</p>
        <p className="mb-4">{event.description}</p>
        <div className='flex gap-2'>
            <button 
            className="bg-[#46479e] text-white px-4 py-2 rounded"
            >
            Register
            </button>
            <button 
            onClick={onClose}
            className="bg-[#46479e] text-white px-4 py-2 rounded"
            >
            Close
            </button>
        </div>
      </div>
    </div>
  );
}

export default EventModal