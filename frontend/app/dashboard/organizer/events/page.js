'use client';

import { useState, useEffect } from 'react';
import { eventsAPI } from '@/lib/api';
import { Plus, Edit2, Trash2, CalendarDays, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', category: 'Music', image_url: ''
  });
  const [ticketTypes, setTicketTypes] = useState([{ type_name: 'General', price: '', capacity: '' }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsAPI.getMyEvents();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      let imageUrl = form.image_url;

      // Upload image file if one was selected
      if (imageFile) {
        setUploading(true);
        const uploadResult = await eventsAPI.uploadImage(imageFile);
        imageUrl = uploadResult.image_url;
        setUploading(false);
      }

      await eventsAPI.create({
        ...form,
        image_url: imageUrl,
        ticket_types: ticketTypes.map(t => ({
          ...t, price: parseFloat(t.price), capacity: parseInt(t.capacity)
        }))
      });
      setShowModal(false);
      setForm({ title: '', description: '', date: '', location: '', category: 'Music', image_url: '' });
      setTicketTypes([{ type_name: 'General', price: '', capacity: '' }]);
      setImageFile(null);
      setImagePreview(null);
      fetchEvents();
    } catch (err) {
      alert(`Failed to create event: ${err.message}`);
    } finally {
      setCreating(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event? This will orphan existing bookings.')) return;
    try {
      await eventsAPI.delete(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      alert(`Failed to delete event: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="section-title">Manage <span style={{ color: 'var(--primary)' }}>Events</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Create, edit, and monitor your event listings.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ 
            background: 'var(--primary)', color: '#fff', padding: '12px 24px', 
            borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '15px', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
          }}
        >
          <Plus size={18} /> Create New Event
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading roster...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
             <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎪</div>
             <p>No events found. Click "Create New Event" to start making magic!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card2)', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Event Details</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Total Bookings</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Revenue</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isPast = new Date(event.date) < new Date();
                return (
                  <tr key={event.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{event.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                         <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{event.category}</span>
                         <span>• {event.location}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{new Date(event.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '11px', color: isPast ? 'var(--error)' : 'var(--success)', fontWeight: 600, marginTop: '2px' }}>
                        {isPast ? 'ENDED' : 'UPCOMING'}
                      </div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                       <span style={{ background: 'var(--bg-card2)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}>
                         {event.total_bookings || 0} Tickets
                       </span>
                    </td>
                    <td style={{ padding: '20px 16px', color: 'var(--success)', fontWeight: 700, fontSize: '15px' }}>
                       ₹{event.ticket_types?.reduce((s, t) => s + (parseFloat(t.price) * (t.booked_count || 0)), 0).toLocaleString() || 0}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link href={`/events/${event.id}`} title="View Listing" style={{ background: 'var(--bg-card2)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
                          <ExternalLink size={16} />
                        </Link>
                        <button title="Delete Event" onClick={() => handleDelete(event.id)} style={{ background: 'var(--bg-card2)', color: 'var(--error)', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-dark)', width: '100%', maxWidth: '700px', maxHeight: '90vh',
            borderRadius: '24px', border: '1px solid var(--border)', overflowY: 'auto'
          }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 2 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Create New Event</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateEvent} style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Event Title</label>
                  <input type="text" className="input-field" placeholder="e.g. Coldplay Tour 2025" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Description</label>
                  <textarea className="input-field" rows="3" placeholder="Tell attendees what to expect..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Event Image</label>
                  <div
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: '14px',
                      padding: imagePreview ? '0' : '32px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'var(--bg-card2)',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => document.getElementById('event-image-input').click()}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card2)'; }}
                  >
                    <input
                      id="event-image-input"
                      type="file"
                      accept="image/jpeg, image/png, image/webp, image/gif, .jpg, .jpeg, .png, .webp, .gif"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    {imagePreview ? (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: '100%', height: '180px', objectFit: 'cover',
                            display: 'block', borderRadius: '12px',
                          }}
                        />
                        <div style={{
                          position: 'absolute', bottom: '8px', right: '8px',
                          background: 'rgba(0,0,0,0.7)', color: '#fff',
                          borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 600,
                        }}>
                          Click to change
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📸</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                          Click to upload event image
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          JPEG, PNG, WebP or GIF (max 15MB)
                        </div>
                      </div>
                    )}
                  </div>
                  {uploading && (
                    <div style={{ marginTop: '8px', color: 'var(--primary)', fontSize: '13px', fontWeight: 600 }}>
                      ⏳ Uploading image...
                    </div>
                  )}
                </div>
                <div>
                  <label className="input-label">Date & Time</label>
                  <input type="datetime-local" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">Location</label>
                  <input type="text" className="input-field" placeholder="City, Venue" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                    <option value="Music">Music & Concerts</option>
                    <option value="Technology">Technology & Business</option>
                    <option value="Sports">Sports</option>
                    <option value="Art">Art & Comedy</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Ticket Configurations</h3>
                    <button type="button" onClick={() => setTicketTypes([...ticketTypes, { type_name: '', price: '', capacity: '' }])} style={{ background: 'var(--bg-card2)', color: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Add Type</button>
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {ticketTypes.map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input type="text" className="input-field" placeholder="Type (e.g. VIP)" value={t.type_name} onChange={e => { const n = [...ticketTypes]; n[idx].type_name = e.target.value; setTicketTypes(n); }} required />
                        <div style={{ position: 'relative', width: '120px' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }}>₹</span>
                          <input type="number" className="input-field" style={{ paddingLeft: '28px' }} placeholder="Price" value={t.price} onChange={e => { const n = [...ticketTypes]; n[idx].price = e.target.value; setTicketTypes(n); }} required />
                        </div>
                        <input type="number" className="input-field" style={{ width: '120px' }} placeholder="Capacity" value={t.capacity} onChange={e => { const n = [...ticketTypes]; n[idx].capacity = e.target.value; setTicketTypes(n); }} required />
                        {idx > 0 && (
                          <button type="button" onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== idx))} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                 <button type="button" onClick={() => setShowModal(false)} className="input-field" style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>Cancel</button>
                 <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={creating}>
                   {creating ? 'Creating...' : 'Publish Event'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
