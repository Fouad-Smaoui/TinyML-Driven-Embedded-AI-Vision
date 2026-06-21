"""Live performance metrics dashboard for the Edge AI perception system.

Replaces the original streamlit_app.py, which read three CSVs
(`data/processed_data.csv`, `data/results/summary_statistics.csv`,
`data/results/model_predictions.csv`) that nothing in the repo ever
produced. This dashboard instead polls the perception app's real /metrics
endpoint (perception/metrics.py + app.py) on an interval and plots live
FPS, inference latency, and verification-rate history.
"""

import os
import time
from collections import deque

import pandas as pd
import plotly.express as px
import requests
import streamlit as st

PERCEPTION_APP_URL = os.environ.get("PERCEPTION_APP_URL", "http://localhost:5000")
POLL_INTERVAL_SECONDS = float(os.environ.get("DASHBOARD_POLL_INTERVAL", "1.5"))
HISTORY_LENGTH = int(os.environ.get("DASHBOARD_HISTORY_LENGTH", "120"))

st.set_page_config(page_title="Edge AI Perception — Metrics", layout="wide")
st.title("Edge AI Perception — Live Performance Metrics")
st.caption(f"Polling {PERCEPTION_APP_URL}/metrics every {POLL_INTERVAL_SECONDS}s")

if "history" not in st.session_state:
    st.session_state.history = deque(maxlen=HISTORY_LENGTH)


def fetch_metrics() -> dict | None:
    try:
        response = requests.get(f"{PERCEPTION_APP_URL}/metrics", timeout=2)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        st.warning(f"Could not reach perception app: {exc}")
        return None


placeholder = st.empty()

metrics = fetch_metrics()
if metrics is not None:
    st.session_state.history.append({"timestamp": time.time(), **metrics})

history_df = pd.DataFrame(st.session_state.history)

with placeholder.container():
    if history_df.empty:
        st.info("Waiting for perception app metrics...")
    else:
        latest = history_df.iloc[-1]
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("FPS", latest["fps"])
        col2.metric("Detection latency (ms)", latest["avg_detection_latency_ms"])
        col3.metric("Embedding latency (ms)", latest["avg_embedding_latency_ms"])
        col4.metric(
            "Verified / Unknown",
            f"{int(latest['verified_count'])} / {int(latest['unknown_count'])}",
        )

        fig_fps = px.line(history_df, x="timestamp", y="fps", title="FPS over time")
        st.plotly_chart(fig_fps, use_container_width=True)

        fig_latency = px.line(
            history_df,
            x="timestamp",
            y=["avg_detection_latency_ms", "avg_embedding_latency_ms"],
            title="Inference latency over time (ms)",
        )
        st.plotly_chart(fig_latency, use_container_width=True)

        fig_verification = px.line(
            history_df,
            x="timestamp",
            y=["verified_count", "unknown_count"],
            title="Cumulative verification outcomes",
        )
        st.plotly_chart(fig_verification, use_container_width=True)

time.sleep(POLL_INTERVAL_SECONDS)
st.rerun()
