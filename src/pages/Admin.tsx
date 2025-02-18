import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Edit, Trash2, Save, X } from 'lucide-react';

interface Event {
  id?: string;
  name: string;
  date: string;
  description: string;
  category: 'feliceUpcoming' | 'robocciaUpcoming' | 'past';
}

const Admin: React.FC = () => {
  const [event, setEvent] = useState<Omit<Event, 'id'>>({
    name: '',
    date: '',
    description: '',
    category: 'feliceUpcoming',
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editedEvent, setEditedEvent] = useState<Event>({
    name: '',
    date: '',
    description: '',
    category: 'feliceUpcoming',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList: Event[] = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(eventsList);
    };

    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEvent(prevEvent => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'events'), event);
      alert('Event added successfully!');
      setEvent({
        name: '',
        date: '',
        description: '',
        category: 'feliceUpcoming',
      });
      // Refresh events list
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList: Event[] = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(eventsList);
    } catch (error) {
      console.error('Error adding event: ', error);
      alert('Failed to add event.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const eventDoc = doc(db, 'events', id);
        await deleteDoc(eventDoc);
        alert('Event deleted successfully!');
        // Refresh events list
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList: Event[] = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        setEvents(eventsList);
      } catch (error) {
        console.error('Error deleting event: ', error);
        alert('Failed to delete event.');
      }
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEventId(event.id || null);
    setEditedEvent(event);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editedEvent) return;

    const { name, value } = e.target;
    setEditedEvent(prevEvent => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!editedEvent || !editingEventId) return;

    try {
      const eventDoc = doc(db, 'events', editingEventId);
      await updateDoc(eventDoc, {
        name: editedEvent.name,
        date: editedEvent.date,
        description: editedEvent.description,
        category: editedEvent.category,
      });
      alert('Event updated successfully!');
      setEditingEventId(null);
      setEditedEvent({
        name: '',
        date: '',
        description: '',
        category: 'feliceUpcoming',
      });
      // Refresh events list
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList: Event[] = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(eventsList);
    } catch (error) {
      console.error('Error updating event: ', error);
      alert('Failed to update event.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Page</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-8">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Event Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={event.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
            Date:
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={event.date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={event.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
            Category:
          </label>
          <select
            id="category"
            name="category"
            value={event.category}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="feliceUpcoming">Felice Upcoming</option>
            <option value="robocciaUpcoming">Roboccia Upcoming</option>
            <option value="past">Past Events</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Add Event
          </button>
        </div>
      </form>

      {/* Events Table */}
      <h2 className="text-2xl font-bold mb-4">Events List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                  {editingEventId === event.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedEvent.name}
                      onChange={handleEditChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  ) : (
                    event.name
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editingEventId === event.id ? (
                    <input
                      type="date"
                      name="date"
                      value={editedEvent.date}
                      onChange={handleEditChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  ) : (
                    event.date
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editingEventId === event.id ? (
                    <textarea
                      name="description"
                      value={editedEvent.description}
                      onChange={handleEditChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  ) : (
                    event.description
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editingEventId === event.id ? (
                    <select
                      name="category"
                      value={editedEvent.category}
                      onChange={handleEditChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="feliceUpcoming">Felice Upcoming</option>
                      <option value="robocciaUpcoming">Roboccia Upcoming</option>
                      <option value="past">Past Events</option>
                    </select>
                  ) : (
                    event.category
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editingEventId === event.id ? (
                    <>
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mr-2"
                        onClick={handleUpdate}
                      >
                        <Save className="h-4 w-4"/>
                      </button>
                      <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => {
                          setEditingEventId(null);
                          setEditedEvent({
                            name: '',
                            date: '',
                            description: '',
                            category: 'feliceUpcoming',
                          });
                        }}
                      >
                        <X className="h-4 w-4"/>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mr-2"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-4 w-4"/>
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this event?')) {
                            handleDelete(event.id || '');
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4"/>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
