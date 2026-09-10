import { useState } from 'react';
import { submitComplaint } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function NewComplaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    victim_name: '',
    victim_city: '',
    amount: '',
    bank: '',
    fraud_type: 'OTP Fraud',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Always save to localStorage to ensure it shows up in the UI even if backend fails
    const mockEntry = {
      complaint_id: `SIH-NEW-${Math.floor(Math.random() * 9000) + 1000}`,
      fraud_type: formData.fraud_type,
      scam_type: formData.fraud_type,
      amount: parseFloat(formData.amount),
      status: 'ACTIVE',
      top_hotspot: { risk_score: 98 },
      victim_city: formData.victim_city,
      actual_atm_lat: 28.6139 + (Math.random() * 0.05),
      actual_atm_lon: 77.2090 + (Math.random() * 0.05),
      priority: 'P1',
      mule_account: `9081${Math.floor(Math.random() * 900000)}`,
      mule_holder_name: `SUSPECT (RECENT DEMO)`
    };
    
    const existingStr = localStorage.getItem('demo_complaints');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    localStorage.setItem('demo_complaints', JSON.stringify([mockEntry, ...existing]));

    try {
      await submitComplaint({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      navigate('/');
    } catch (err) {
      console.warn('API submission failed, redirecting anyway for demo', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-full overflow-y-auto pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-main">Register Complaint</h2>
        <div className="text-sm text-muted">Enter fraud details to generate an AI intercept plan.</div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-main mb-1">Victim Name</label>
              <input 
                required type="text"
                value={formData.victim_name} onChange={e => setFormData({...formData, victim_name: e.target.value})}
                className="w-full bg-base border border-custom rounded-md px-4 py-2 text-main focus:outline-none focus:border-[#3b82f6]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-main mb-1">City</label>
              <select 
                required
                value={formData.victim_city} onChange={e => setFormData({...formData, victim_city: e.target.value})}
                className="w-full bg-base border border-custom rounded-md px-4 py-2 text-main focus:outline-none focus:border-[#3b82f6]" 
              >
                <option value="" disabled>Select Region...</option>
                <option value="Delhi">Delhi</option>
                <option value="Noida">Noida</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Indore">Indore</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-1">Amount Lost (INR)</label>
            <input 
              required type="number"
              value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-base border border-custom rounded-md px-4 py-2 text-main focus:outline-none focus:border-[#3b82f6]" 
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-main mb-1">Source Bank</label>
              <input 
                required type="text" placeholder="e.g. SBI, HDFC"
                value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})}
                className="w-full bg-base border border-custom rounded-md px-4 py-2 text-main focus:outline-none focus:border-[#3b82f6]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-main mb-1">Fraud Type</label>
              <select 
                value={formData.fraud_type} onChange={e => setFormData({...formData, fraud_type: e.target.value})}
                className="w-full bg-base border border-custom rounded-md px-4 py-2 text-main focus:outline-none focus:border-[#3b82f6]"
              >
                <option>OTP Fraud</option>
                <option>Task Fraud</option>
                <option>Investment Scam</option>
                <option>Phishing</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-custom flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#3b82f6] text-white px-6 py-2 rounded-md font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Submit & Analyze'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}