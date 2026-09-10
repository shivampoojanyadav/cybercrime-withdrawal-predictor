import os

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

ML_PIPELINE_DIR   = os.path.join(BACKEND_DIR, "ml")
DATA_PIPELINE_DIR = os.path.join(BACKEND_DIR, "data")

MODEL_FILES = {
    "predictor":    os.path.join(ML_PIPELINE_DIR, "predictor.pkl"),
    "encoders":     os.path.join(ML_PIPELINE_DIR, "encoders.pkl"),
    "cluster_ids":  os.path.join(ML_PIPELINE_DIR, "cluster_ids.pkl"),
    "classes":      os.path.join(ML_PIPELINE_DIR, "classes.pkl"),
}

DATA_FILES = {
    "cluster_centroids": os.path.join(DATA_PIPELINE_DIR, "cluster_centroids.csv"),
    "atm_locations":     os.path.join(DATA_PIPELINE_DIR, "atm_locations.csv"),
}
