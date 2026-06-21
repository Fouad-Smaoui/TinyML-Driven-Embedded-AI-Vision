# Model provenance

This project does not commit pretrained model binaries to git. Run
`python models/download_models.py` to fetch them locally (this also happens
automatically inside the Docker image build — see `docker/app.Dockerfile`).

## 1. Facial landmark predictor

- **File**: `shape_predictor_68_face_landmarks.dat`
- **Source**: [davisking/dlib-models](https://github.com/davisking/dlib-models)
- **Trained on**: the iBUG 300-W face landmark dataset
- **License**: see the dlib-models repository for current terms (the model
  itself, distinct from dlib's Boost license, has historically been shared
  for free use including commercial use — verify current terms before
  redistributing).

## 2. Face embedding model

- **File**: `face_embedding.onnx` (downloaded as `arcfaceresnet100-11-int8.onnx`)
- **Source**: [ONNX Model Zoo — ArcFace](https://github.com/onnx/models/tree/main/validated/vision/body_analysis/arcface)
- **Architecture**: ResNet100 trained with the ArcFace loss, int8-quantized
  ONNX export (~63MB; an unquantized fp32 version, `arcfaceresnet100-8.onnx`,
  is also available at the same path if you need higher precision).
- **Input**: 112x112 RGB, aligned face crop (see `perception/embedding.py`
  for the alignment step using eye landmarks)
- **Output**: 512-dimensional embedding vector
- **License**: Apache 2.0

## Why these models

Both are well-known, openly licensed, pretrained artifacts — no training
data or GPU pipeline is required to get a real, working face embedding
model running via ONNX Runtime. This replaces the original project's
`face_recognition_model.h5`, which was referenced by `app.py` but never
actually included in the repository.
