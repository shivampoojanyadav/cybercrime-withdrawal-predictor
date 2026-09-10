# Cybercrime Cash Withdrawal Predictor — Backend
**SIH26184 | Ministry of Home Affairs**

## Setup (run in order)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Generate synthetic data + ATM locations
python data/generate_data.py

# 3. Train XGBoost model (saves predictor.pkl)
python ml/train.py

# 4. Start the API server
uvicorn main:app --reload
```

API will be live at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaint` | Submit complaint → get top 5 ATM hotspot predictions |
| GET | `/api/hotspots` | All ATM clusters with live risk scores |
| GET | `/api/atms` | ATM locations for map rendering |
| GET | `/api/complaints` | Complaint history with predictions |
| GET | `/api/complaints/{id}` | Single complaint detail |

---

## Sample Request

```bash
curl -X POST http://localhost:8000/api/complaint \
  -H "Content-Type: application/json" \
  -d '{
    "victim_name": "Rahul Sharma",
    "victim_city": "Delhi",
    "amount": 85000,
    "bank": "HDFC Bank",
    "fraud_type": "OTP_SCAM",
    "transaction_count": 3,
    "mule_bank": "SBI"
  }'
```

## Sample Response

```json
{
  "complaint_id": "SIH-A1B2C3D4",
  "hotspots": [
    {"cluster_id": 12, "lat": 23.96, "lng": 86.99, "city": "Jamtara", "risk_score": 87.3, "atm_count": 6, "rank": 1},
    {"cluster_id": 8,  "lat": 23.79, "lng": 86.43, "city": "Dhanbad", "risk_score": 61.2, "atm_count": 4, "rank": 2}
  ],
  "predicted_window": "2-6 hours",
  "confidence": 87.3,
  "fraud_type": "OTP_SCAM",
  "amount": 85000,
  "victim_city": "Delhi"
}
```

---

## Fraud Types Supported
`OTP_SCAM` | `KYC_UPDATE` | `LOTTERY_FRAUD` | `INVESTMENT_SCAM` | `LOAN_FRAUD` | `TECH_SUPPORT_SCAM` | `IMPERSONATION` | `JOB_FRAUD`
