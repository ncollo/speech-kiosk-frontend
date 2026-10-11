import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockStaffMembers } from '../../data/adminData';
import type { ClinicianStaff } from '../../types';
import './ClinicianUnlockScreen.css';

export default function ClinicianUnlockScreen() {
  const navigate = useNavigate();
  const [selectedStaff, setSelectedStaff] = useState<ClinicianStaff>(mockStaffMembers[0]);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setErrorMsg('');
      if (newPin.length === 4) {
        validatePin(newPin, selectedStaff);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const validatePin = (enteredPin: string, staff: ClinicianStaff) => {
    if (enteredPin === staff.pin || enteredPin === '0000') {
      sessionStorage.setItem('active_clinician_name', staff.name);
      sessionStorage.setItem('active_clinician_role', staff.role);
      sessionStorage.setItem('active_clinician_desk', staff.deskNumber);
      navigate('/kiosk?view=clinician');
    } else {
      setErrorMsg('Incorrect PIN. Please try again or use Desk 1 fallback (0000).');
      setPin('');
    }
  };

  const handleStaffChange = (staff: ClinicianStaff) => {
    setSelectedStaff(staff);
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="pin-unlock-screen">
      <header className="pin-header">
        <Link to="/" className="pin-header__back">
          ← Back to Overview
        </Link>
        <div className="pin-header__title">
          <span className="pin-header__badge">Staff Console</span>
          <h1>Clinician Session Unlock</h1>
        </div>
        <Link to="/admin" className="pin-header__admin-link">
          Admin Portal →
        </Link>
      </header>

      <main className="pin-main">
        <div className="pin-card">
          <div className="pin-staff-selector">
            <label className="pin-section-label">Select Active Staff Member</label>
            <div className="staff-chips" role="radiogroup" aria-label="Staff selection">
              {mockStaffMembers.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  className={`staff-chip ${selectedStaff.id === staff.id ? 'staff-chip--active' : ''}`}
                  onClick={() => handleStaffChange(staff)}
                >
                  <span className="staff-chip__name">{staff.name}</span>
                  <span className="staff-chip__role">{staff.deskNumber} · {staff.role}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pin-entry-box">
            <span className="pin-entry-prompt">
              Enter 4-digit PIN for <strong>{selectedStaff.name}</strong>
            </span>

            {/* PIN Dots Indicator */}
            <div className="pin-dots" aria-label={`PIN entered: ${pin.length} of 4 digits`}>
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className={`pin-dot ${idx < pin.length ? 'pin-dot--filled' : ''}`}
                />
              ))}
            </div>

            {errorMsg && <p className="pin-error" role="alert">{errorMsg}</p>}

            {/* Quick Demo Assist */}
            <div className="pin-demo-hint">
              <span>Demo Quick-PIN: <strong>{selectedStaff.pin}</strong></span>
              <button
                type="button"
                className="pin-autofill-btn"
                onClick={() => validatePin(selectedStaff.pin, selectedStaff)}
              >
                Autofill & Unlock
              </button>
            </div>

            {/* Tactical Keypad */}
            <div className="pin-keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  className="pin-key"
                  onClick={() => handleKeyPress(digit)}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                className="pin-key pin-key--action"
                onClick={handleClear}
                title="Clear entered PIN"
              >
                C
              </button>
              <button
                type="button"
                className="pin-key"
                onClick={() => handleKeyPress('0')}
              >
                0
              </button>
              <button
                type="button"
                className="pin-key pin-key--action"
                onClick={handleDelete}
                title="Delete previous digit"
              >
                ⌫
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="pin-footer">
        <span>Frictionless Staff Authentication · No Patient Sign-In Barrier</span>
        <span>St. Mary's Medical Center Reception Network</span>
      </footer>
    </div>
  );
}
