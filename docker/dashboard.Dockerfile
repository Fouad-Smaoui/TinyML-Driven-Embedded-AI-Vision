FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
# Dashboard only needs streamlit/plotly/pandas/requests — installing the
# full requirements.txt is simplest here since it's still a light list
# without dlib/onnxruntime's native build requirements affecting it.
RUN pip install --no-cache-dir streamlit plotly pandas requests

COPY dashboard/ dashboard/

EXPOSE 8501
CMD ["streamlit", "run", "dashboard/streamlit_app.py", "--server.address=0.0.0.0"]
