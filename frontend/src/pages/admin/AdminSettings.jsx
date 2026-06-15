import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { FiSliders, FiLock, FiInfo } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import '../../css/admin.css';

const AdminSettings = () => {
  const { user, updateProfile, changeUserPassword } = useContext(AuthContext);

  // Settings states
  const [currency, setCurrency] = useState('₹ (INR)');
  const [taxRate, setTaxRate] = useState('18');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('3000');
  const [flatShippingFee, setFlatShippingFee] = useState('150');

  // Account states
  const [adminName, setAdminName] = useState(user?.name || '');
  const [adminMobile, setAdminMobile] = useState(user?.mobile || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    const res = await updateProfile(adminName, adminMobile);
    setUpdatingProfile(false);

    if (res.success) {
      toast.success('Admin info updated.');
    } else {
      toast.error(res.message);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    toast.success('System parameters saved successfully!');
  };

  const handleAdminChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.warn('Passwords do not match');
      return;
    }

    setChangingPass(true);
    const res = await changeUserPassword(currentPassword, newPassword);
    setChangingPass(false);

    if (res.success) {
      toast.success('Admin password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>System Settings</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
        {/* Core Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Store configurations */}
          <div className="profile-content-panel" style={{ padding: '30px' }}>
            <h3 className="checkout-box-title" style={{ fontSize: '1.15rem' }}><FiSliders /> E-Store Parameters</h3>
            <form onSubmit={handleSaveConfig}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Store Currency Symbol</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Standard GST Tax Rate (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Free Shipping Limit (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Flat Delivery Charge (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={flatShippingFee}
                    onChange={(e) => setFlatShippingFee(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
                Save Configurations
              </button>
            </form>
          </div>

          {/* Admin profile */}
          <div className="profile-content-panel" style={{ padding: '30px' }}>
            <h3 className="checkout-box-title" style={{ fontSize: '1.15rem' }}><FiInfo /> Administrator Profile</h3>
            <form onSubmit={handleUpdateAdminProfile}>
              <div className="form-group">
                <label className="form-label">Admin Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={adminMobile}
                  onChange={(e) => setAdminMobile(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }} disabled={updatingProfile}>
                {updatingProfile ? 'Saving...' : 'Update Details'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Admin Password */}
        <div className="profile-content-panel" style={{ padding: '30px', height: 'fit-content' }}>
          <h3 className="checkout-box-title" style={{ fontSize: '1.15rem' }}><FiLock /> Change credentials</h3>
          <form onSubmit={handleAdminChangePassword}>
            <div className="form-group">
              <label className="form-label">Current password</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }} disabled={changingPass}>
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
