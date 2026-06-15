import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiMapPin, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import '../../css/profile.css';

const Profile = () => {
  const {
    user,
    updateProfile,
    changeUserPassword,
    addAddress,
    updateAddress,
    deleteAddress
  } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('info');

  // Tab 1 Info State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMobile, setProfileMobile] = useState(user?.mobile || '');
  const [updatingInfo, setUpdatingInfo] = useState(false);

  // Tab 2 Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Tab 3 Address management State
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Handle Profile Update
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!profileName) {
      toast.warn('Name cannot be empty');
      return;
    }
    setUpdatingInfo(true);
    const res = await updateProfile(profileName, profileMobile);
    setUpdatingInfo(false);

    if (res.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(res.message);
    }
  };

  // Handle Password Update
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.warn('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.warn('Password must be at least 6 characters long');
      return;
    }

    setChangingPass(true);
    const res = await changeUserPassword(currentPassword, newPassword);
    setChangingPass(false);

    if (res.success) {
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.message);
    }
  };

  // Handle Address Submit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const { street, city, state, zipCode } = addressData;
    if (!street || !city || !state || !zipCode) {
      toast.warn('All address fields are required');
      return;
    }

    if (editingAddressId) {
      const res = await updateAddress(editingAddressId, addressData);
      if (res.success) {
        toast.success('Address updated successfully!');
        resetAddressForm();
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await addAddress(addressData);
      if (res.success) {
        toast.success('Address added successfully!');
        resetAddressForm();
      } else {
        toast.error(res.message);
      }
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddressId(addr._id);
    setAddressData({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddressClick = async (addrId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this address?');
    if (!confirmDelete) return;

    const res = await deleteAddress(addrId);
    if (res.success) {
      toast.info('Address deleted.');
    } else {
      toast.error(res.message);
    }
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressData({ street: '', city: '', state: '', zipCode: '', country: 'India' });
  };

  return (
    <div className="container section">
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>My Account</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Update profile settings and manage shipping destinations.</p>

      <div className="profile-grid">
        {/* Left Side: Tabs Selection */}
        <aside className="profile-tabs-sidebar">
          <button
            className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <FiUser /> Personal Info
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FiLock /> Change Password
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <FiMapPin /> Manage Addresses
          </button>
        </aside>

        {/* Right Side: Tab Panel Content */}
        <section className="profile-content-panel">
          {activeTab === 'info' && (
            <div>
              <h2 className="profile-panel-title">Personal Information</h2>
              <form onSubmit={handleUpdateInfo}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Cannot change)</label>
                  <input
                    type="email"
                    className="form-input"
                    disabled
                    style={{ opacity: 0.6 }}
                    value={user?.email || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileMobile}
                    onChange={(e) => setProfileMobile(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={updatingInfo}>
                  {updatingInfo ? 'Updating...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <h2 className="profile-panel-title">Security Settings</h2>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={changingPass}>
                  {changingPass ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="profile-panel-title">Shipping Destinations</h2>

              {/* Add Address Form overlay or toggle */}
              {showAddressForm ? (
                <form onSubmit={handleAddressSubmit} style={{ marginBottom: '30px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressData.street}
                      onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input"
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-input"
                        value={addressData.state}
                        onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        className="form-input"
                        value={addressData.zipCode}
                        onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-input"
                        disabled
                        value={addressData.country}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      onClick={resetAddressForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ marginBottom: '24px', padding: '10px 20px', fontSize: '0.875rem' }}
                  onClick={() => setShowAddressForm(true)}
                >
                  + Add New Address
                </button>
              )}

              {/* List of addresses */}
              {user?.addresses && user.addresses.length > 0 ? (
                <div>
                  {user.addresses.map((addr, idx) => (
                    <div key={addr._id} className="address-manager-card">
                      <div>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>Address Option #{idx + 1}</strong>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}, {addr.country}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          className="nav-action-btn"
                          title="Edit"
                          style={{ color: 'var(--info)' }}
                          onClick={() => handleEditAddressClick(addr)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="nav-action-btn"
                          title="Delete"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDeleteAddressClick(addr._id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px 0', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No saved addresses found. Please save one to speed up checkout.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
