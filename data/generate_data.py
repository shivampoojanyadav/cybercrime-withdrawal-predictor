"""
generate_data.py — Synthetic Indian cybercrime data generator for SIH26184
Run from any directory; paths are resolved relative to this file.
"""
import os
import random
import numpy as np
import pandas as pd
from faker import Faker
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors

random.seed(42)
np.random.seed(42)
fake = Faker("en_IN")

# ── Directory paths ──────────────────────────────────────────────────────────
HERE      = os.path.dirname(os.path.abspath(__file__))
ATM_CSV   = os.path.join(HERE, "atm_locations.csv")
CENT_CSV  = os.path.join(HERE, "cluster_centroids.csv")
TRAIN_CSV = os.path.join(HERE, "training_data.csv")

# ── City coordinates ─────────────────────────────────────────────────────────
CITIES = {
    "Delhi":     (28.6139, 77.2090),
    "Mumbai":    (19.0760, 72.8777),
    "Kolkata":   (22.5726, 88.3639),
    "Chennai":   (13.0827, 80.2707),
    "Hyderabad": (17.3850, 78.4867),
    "Bengaluru": (12.9716, 77.5946),
    "Ahmedabad": (23.0225, 72.5714),
    "Jaipur":    (26.9124, 75.7873),
    "Lucknow":   (26.8467, 80.9462),
    "Patna":     (25.5941, 85.1376),
    "Pune":      (18.5204, 73.8567),
    "Surat":     (21.1702, 72.8311),
    "Jamtara":   (23.9630, 86.9947),
    "Dhanbad":   (23.7957, 86.4304),
    "Bharatpur": (27.2152, 77.4900),
    "Nuh":       (28.1040, 77.0029),
    "Mathura":   (27.4924, 77.6737),
    "Deoghar":   (24.4853, 86.6943),
    "Alwar":     (27.5530, 76.6346),
    "Meerut":    (28.9845, 77.7064),
}

BANKS        = ["SBI", "PNB", "Canara", "BOB", "ICICI", "HDFC"]
BANK_WEIGHTS = [0.35, 0.20, 0.15, 0.10, 0.10, 0.10]

VICTIM_BANKS = ["HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Yes Bank"]
MULE_BANKS   = ["SBI", "PNB", "Canara Bank", "Bank of Baroda", "Indian Bank"]

FRAUD_TYPES = [
    "OTP_SCAM", "KYC_UPDATE", "LOTTERY_FRAUD", "INVESTMENT_SCAM",
    "LOAN_FRAUD", "TECH_SUPPORT_SCAM", "IMPERSONATION", "JOB_FRAUD",
]

FRAUD_WITHDRAWAL_BIAS = {
    "OTP_SCAM":          ["Jamtara", "Dhanbad", "Deoghar"],
    "KYC_UPDATE":        ["Bharatpur", "Nuh", "Alwar"],
    "LOTTERY_FRAUD":     ["Mathura", "Jamtara", "Dhanbad"],
    "INVESTMENT_SCAM":   ["Meerut", "Nuh", "Alwar"],
    "LOAN_FRAUD":        ["Jamtara", "Dhanbad", "Mathura"],
    "TECH_SUPPORT_SCAM": ["Nuh", "Meerut", "Bharatpur"],
    "IMPERSONATION":     ["Bharatpur", "Nuh", "Mathura"],
    "JOB_FRAUD":         ["Meerut", "Deoghar", "Dhanbad"],
}

VICTIM_CITIES = [
    "Delhi", "Mumbai", "Kolkata", "Chennai", "Hyderabad",
    "Bengaluru", "Ahmedabad", "Jaipur", "Lucknow", "Patna", "Pune", "Surat",
]


# ════════════════════════════════════════════════════════════════════════════
# STEP 1 — Generate ATM locations
# ════════════════════════════════════════════════════════════════════════════
def generate_atms() -> pd.DataFrame:
    rows = []
    atm_counter = 1
    for city, (base_lat, base_lng) in CITIES.items():
        n_atms = random.randint(15, 40)
        for _ in range(n_atms):
            lat  = base_lat + random.uniform(-0.05, 0.05)
            lng  = base_lng + random.uniform(-0.05, 0.05)
            bank = random.choices(BANKS, weights=BANK_WEIGHTS, k=1)[0]
            rows.append({
                "atm_id":     f"ATM{atm_counter:04d}",
                "lat":        round(lat, 6),
                "lng":        round(lng, 6),
                "city":       city,
                "bank":       bank,
                "address":    fake.address().replace("\n", ", "),
                "cluster_id": -1,  # placeholder
            })
            atm_counter += 1

    df = pd.DataFrame(rows)
    print(f"  Generated {len(df)} ATMs across {len(CITIES)} cities.")
    return df


# ════════════════════════════════════════════════════════════════════════════
# STEP 2 — DBSCAN clustering on ATM coordinates
# ════════════════════════════════════════════════════════════════════════════
def cluster_atms(df: pd.DataFrame) -> pd.DataFrame:
    coords = df[["lat", "lng"]].values
    db     = DBSCAN(eps=0.3, min_samples=3, metric="euclidean").fit(coords)
    labels = db.labels_

    # Reassign noise points (-1) to nearest valid cluster
    valid_mask  = labels != -1
    noise_mask  = labels == -1

    if noise_mask.any() and valid_mask.any():
        valid_coords  = coords[valid_mask]
        valid_labels  = labels[valid_mask]
        noise_coords  = coords[noise_mask]

        nbrs = NearestNeighbors(n_neighbors=1).fit(valid_coords)
        _, indices = nbrs.kneighbors(noise_coords)
        labels[noise_mask] = valid_labels[indices.flatten()]

    df["cluster_id"] = labels
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    print(f"  DBSCAN found {n_clusters} clusters (after noise reassignment).")
    return df, n_clusters


# ════════════════════════════════════════════════════════════════════════════
# STEP 3 — Cluster centroids
# ════════════════════════════════════════════════════════════════════════════
def compute_centroids(df: pd.DataFrame) -> pd.DataFrame:
    grp = df.groupby("cluster_id")
    rows = []
    for cid, group in grp:
        # Majority city in cluster
        city = group["city"].mode().iloc[0]
        rows.append({
            "cluster_id":   int(cid),
            "centroid_lat": round(group["lat"].mean(), 6),
            "centroid_lng": round(group["lng"].mean(), 6),
            "city":         city,
            "atm_count":    len(group),
        })
    centroids = pd.DataFrame(rows).sort_values("cluster_id").reset_index(drop=True)
    print(f"  Computed {len(centroids)} cluster centroids.")
    return centroids


# ════════════════════════════════════════════════════════════════════════════
# STEP 4 — Generate training complaint records
# ════════════════════════════════════════════════════════════════════════════
def generate_training_data(atm_df: pd.DataFrame, centroids: pd.DataFrame) -> pd.DataFrame:
    # Build city → list of cluster_ids mapping
    city_clusters: dict[str, list[int]] = {}
    for _, row in atm_df.drop_duplicates("cluster_id").iterrows():
        city = row["city"]
        cid  = int(row["cluster_id"])
        city_clusters.setdefault(city, [])
        if cid not in city_clusters[city]:
            city_clusters[city].append(cid)

    all_clusters = atm_df["cluster_id"].unique().tolist()
    all_cities   = list(CITIES.keys())

    def amount_to_band(amt: float) -> int:
        if amt < 10_000:   return 0
        if amt < 50_000:   return 1
        if amt < 200_000:  return 2
        if amt < 500_000:  return 3
        return 4

    records = []
    for i in range(3000):
        fraud_type   = random.choice(FRAUD_TYPES)
        victim_city  = random.choice(VICTIM_CITIES)
        victim_bank  = random.choice(VICTIM_BANKS)
        mule_bank    = random.choice(MULE_BANKS)
        tx_count     = random.randint(1, 12)

        # Amount distribution
        r = random.random()
        if r < 0.60:
            amount = random.uniform(10_000, 50_000)
        elif r < 0.90:
            amount = random.uniform(50_000, 200_000)
        else:
            amount = random.uniform(200_000, 1_000_000)

        # Complaint timing
        complaint_hour  = random.randint(0, 23)
        complaint_delay = random.randint(1, 72)   # hours after fraud
        day_of_week     = random.randint(0, 6)

        # Pick withdrawal cluster based on fraud bias
        if random.random() < 0.70:
            biased_cities = FRAUD_WITHDRAWAL_BIAS[fraud_type]
            w_city = random.choice(biased_cities)
            if w_city in city_clusters and city_clusters[w_city]:
                cluster_id = random.choice(city_clusters[w_city])
            else:
                cluster_id = random.choice(all_clusters)
        else:
            # 30% random noise
            cluster_id = random.choice(all_clusters)

        records.append({
            "complaint_id":          f"CMP{i+1:05d}",
            "victim_city":           victim_city,
            "amount":                round(amount, 2),
            "amount_band":           amount_to_band(amount),
            "victim_bank":           victim_bank,
            "fraud_type":            fraud_type,
            "transaction_count":     tx_count,
            "mule_bank":             mule_bank,
            "complaint_hour":        complaint_hour,
            "complaint_delay_hours": complaint_delay,
            "day_of_week":           day_of_week,
            "withdrawal_cluster_id": int(cluster_id),
        })

    df = pd.DataFrame(records)
    print(f"  Generated {len(df)} training complaint records.")
    return df


# ════════════════════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n[1/4] Generating ATM locations...")
    atm_df = generate_atms()

    print("[2/4] Running DBSCAN clustering on ATMs...")
    atm_df, n_clusters = cluster_atms(atm_df)
    atm_df.to_csv(ATM_CSV, index=False)
    print(f"  Saved -> {ATM_CSV}")

    print("[3/4] Computing cluster centroids...")
    centroids = compute_centroids(atm_df)
    centroids.to_csv(CENT_CSV, index=False)
    print(f"  Saved -> {CENT_CSV}")

    print("[4/4] Generating training data...")
    train_df = generate_training_data(atm_df, centroids)
    train_df.to_csv(TRAIN_CSV, index=False)
    print(f"  Saved -> {TRAIN_CSV}")

    print(f"\nData generation complete. Clusters found: {n_clusters}")
