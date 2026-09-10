const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchModelMetadata = async () => {
  const res = await fetch(`${API_BASE}/api/model/metadata`);
  if (!res.ok) throw new Error('Failed to fetch model metadata');
  return res.json();
};

export const fetchComplaints = async () => {
  const res = await fetch(`${API_BASE}/api/complaints?limit=50`);
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return res.json();
};

export const fetchPrediction = async (caseId: string) => {
  const res = await fetch(`${API_BASE}/api/predict/${caseId}`);
  if (!res.ok) throw new Error('Failed to fetch prediction');
  return res.json();
};

export const submitComplaint = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/complaint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit complaint');
  return res.json();
};

export const fetchSummary = async () => {
  const res = await fetch(`${API_BASE}/api/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
};
