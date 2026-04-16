import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { updateProfile } from '../services/auth';
import { getInitials } from '../utils/helpers';
import Modal from '../components/common/Modal';
import { User, Mail, Phone, FileText, Shield, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [roleModal, setRoleModal] = useState(false);

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleSwitch = async () => {
    const newRole = user?.role === 'creator' ? 'user' : 'creator';
    setSaving(true);
    try {
      const res = await updateProfile({ role: newRole });
      updateUser(res.data);
      toast.success(`Switched to ${newRole} role.`);
      setRoleModal(false);
    } catch {
      toast.error('Failed to switch role.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-2xl font-bold text-text mb-6">Profile</h1>

      {/* Avatar section */}
      <div className="glass-card p-6 mb-6 flex items-center gap-5">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-2xl font-bold border-2 border-primary/30">
            {getInitials(
              user?.first_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username
            )}
          </div>
        )}
        <div>
          <h2 className="font-heading font-semibold text-text text-lg">
            {user?.first_name
              ? `${user.first_name} ${user.last_name}`
              : user?.username}
          </h2>
          <p className="text-sm text-text-muted">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge bg-primary/20 text-primary-light border border-primary/30 capitalize">
              {user?.role}
            </span>
            <span className="text-xs text-text-dim">
              via {user?.oauth_provider || 'email'}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
              <User size={14} /> First Name
            </label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="input-field"
              placeholder="Your first name"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
              <User size={14} /> Last Name
            </label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="input-field"
              placeholder="Your last name"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
            <Mail size={14} /> Avatar URL
          </label>
          <input
            name="avatar"
            value={form.avatar}
            onChange={handleChange}
            className="input-field"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
            <Phone size={14} /> Phone
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input-field"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
            <FileText size={14} /> Bio
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="input-field resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Role switch */}
      <div className="glass-card p-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold text-text flex items-center gap-2">
              <Shield size={16} className="text-primary-light" />
              Switch Role
            </h3>
            <p className="text-sm text-text-muted mt-1">
              Currently: <span className="capitalize font-medium text-text">{user?.role}</span>.
              {user?.role === 'user'
                ? ' Switch to Creator to create and manage sessions.'
                : ' Switch to User to browse and book sessions only.'}
            </p>
          </div>
          <button onClick={() => setRoleModal(true)} className="btn-secondary text-sm flex-shrink-0">
            Switch to {user?.role === 'creator' ? 'User' : 'Creator'}
          </button>
        </div>
      </div>

      {/* Role confirmation modal */}
      <Modal
        isOpen={roleModal}
        onClose={() => setRoleModal(false)}
        title="Switch Role"
        size="sm"
      >
        <p className="text-text-muted text-sm mb-4">
          Are you sure you want to switch to{' '}
          <span className="font-medium text-text capitalize">
            {user?.role === 'creator' ? 'User' : 'Creator'}
          </span>
          ?{' '}
          {user?.role === 'user'
            ? 'As a Creator, you can create and manage sessions.'
            : 'As a User, you can browse and book sessions.'}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setRoleModal(false)} className="btn-secondary text-sm">
            Cancel
          </button>
          <button onClick={handleRoleSwitch} disabled={saving} className="btn-accent text-sm">
            {saving ? 'Switching...' : 'Confirm Switch'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
