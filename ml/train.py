"""
train.py — Train XGBoost cluster predictor for SIH26184
Run from any directory; paths are resolved relative to this file.
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier

# ── Paths ────────────────────────────────────────────────────────────────────
HERE       = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(HERE, "..", "data")
TRAIN_CSV  = os.path.join(DATA_DIR, "training_data.csv")
CENT_CSV   = os.path.join(DATA_DIR, "cluster_centroids.csv")

MODEL_PKL    = os.path.join(HERE, "predictor.pkl")
ENC_PKL      = os.path.join(HERE, "encoders.pkl")
CLUSTERS_PKL = os.path.join(HERE, "cluster_ids.pkl")
CLASSES_PKL  = os.path.join(HERE, "classes.pkl")

CATEGORICAL_COLS = ["victim_city", "victim_bank", "fraud_type", "mule_bank"]
FEATURE_COLS     = [
    "amount_band",
    "victim_city_encoded",
    "victim_bank_encoded",
    "fraud_type_encoded",
    "mule_bank_encoded",
    "transaction_count",
    "complaint_hour",
    "complaint_delay_hours",
    "day_of_week",
]
TARGET_COL = "withdrawal_cluster_id"


def train():
    print("\n[1/5] Loading data...")
    df = pd.read_csv(TRAIN_CSV)
    centroids = pd.read_csv(CENT_CSV)
    print(f"  Training rows : {len(df)}")
    print(f"  Unique clusters: {df[TARGET_COL].nunique()}")

    print("[2/5] Encoding categorical features...")
    encoders: dict[str, LabelEncoder] = {}
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        df[f"{col}_encoded"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        print(f"  {col}: {len(le.classes_)} classes")

    print("[3/5] Preparing features and target...")
    X = df[FEATURE_COLS].values
    y = df[TARGET_COL].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("[4/5] Training XGBoost classifier...")
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"  [OK] Test Accuracy: {acc:.4f} ({acc*100:.2f}%)")

    print("[5/5] Saving model artifacts...")
    valid_cluster_ids = sorted(centroids["cluster_id"].tolist())

    joblib.dump(model,             MODEL_PKL)
    joblib.dump(encoders,          ENC_PKL)
    joblib.dump(valid_cluster_ids, CLUSTERS_PKL)
    joblib.dump(model.classes_,    CLASSES_PKL)

    print(f"  predictor.pkl   -> {MODEL_PKL}")
    print(f"  encoders.pkl    -> {ENC_PKL}")
    print(f"  cluster_ids.pkl -> {CLUSTERS_PKL}")
    print(f"  classes.pkl     -> {CLASSES_PKL}")
    print(f"\nTraining complete. Model accuracy: {acc*100:.2f}%")
    return acc


if __name__ == "__main__":
    train()
