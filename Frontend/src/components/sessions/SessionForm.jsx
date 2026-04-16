import { useState, useEffect } from 'react';
import { CATEGORIES } from '../../utils/constants';

export default function SessionForm({ initialData, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    price: '',
    currency: 'INR',
    duration: '',
    date_time: '',
    max_participants: '',
    image: '',
    location: 'Online',
    meeting_link: '',
    status: 'upcoming',
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'other',
        price: initialData.price || '',
        currency: initialData.currency || 'INR',
        duration: initialData.duration || '',
        date_time: initialData.date_time
          ? initialData.date_time.slice(0, 16)
          : '',
        max_participants: initialData.max_participants || '',
        image: initialData.image || '',
        location: initialData.location || 'Online',
        meeting_link: initialData.meeting_link || '',
        status: initialData.status || 'upcoming',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      duration: parseInt(form.duration) || 60,
      max_participants: parseInt(form.max_participants) || 10,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Session Title *
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="e.g. Morning Meditation Workshop"
          className="input-field"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Description *
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Describe your session in detail..."
          className="input-field resize-none"
        />
      </div>

      {/* Category + Price row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input-field"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Price (₹) — 0 for free
          </label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="0"
            className="input-field"
          />
        </div>
      </div>

      {/* Date + Duration row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Date & Time *
          </label>
          <input
            name="date_time"
            type="datetime-local"
            value={form.date_time}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Duration (minutes)
          </label>
          <input
            name="duration"
            type="number"
            min="1"
            value={form.duration}
            onChange={handleChange}
            placeholder="60"
            className="input-field"
          />
        </div>
      </div>

      {/* Max Participants + Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Max Participants
          </label>
          <input
            name="max_participants"
            type="number"
            min="1"
            value={form.max_participants}
            onChange={handleChange}
            placeholder="10"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Location
          </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Online or physical address"
            className="input-field"
          />
        </div>
      </div>

      {/* Image URL + Meeting Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Image URL
          </label>
          <input
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Meeting Link
          </label>
          <input
            name="meeting_link"
            type="url"
            value={form.meeting_link}
            onChange={handleChange}
            placeholder="https://meet.google.com/..."
            className="input-field"
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          name="is_active"
          type="checkbox"
          checked={form.is_active}
          onChange={handleChange}
          id="is_active"
          className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary"
        />
        <label htmlFor="is_active" className="text-sm text-text-muted">
          Active (visible in catalog)
        </label>
      </div>

      {/* Submit */}
      <button type="submit" disabled={isLoading} className="btn-accent w-full justify-center">
        {isLoading
          ? 'Saving...'
          : initialData
          ? 'Update Session'
          : 'Create Session'}
      </button>
    </form>
  );
}
