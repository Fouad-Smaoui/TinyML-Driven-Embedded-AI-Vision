FROM python:3.11-slim

# dlib needs a compiler toolchain + cmake + BLAS/LAPACK to build from source.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        libopenblas-dev \
        liblapack-dev \
        libx11-dev \
        libgtk-3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY perception/ perception/
COPY models/ models/
COPY templates/ templates/
COPY app.py enroll.py ./

# Fetch the dlib landmark + ONNX embedding models at build time so the
# container is immediately runnable without a manual setup step.
RUN python models/download_models.py

EXPOSE 5000
CMD ["python", "app.py"]
