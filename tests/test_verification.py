import json

import numpy as np
import pytest

from perception.verification import FaceVerifier, cosine_similarity


def test_cosine_similarity_identical_vectors_is_one():
    vec = np.array([1.0, 2.0, 3.0])
    assert cosine_similarity(vec, vec) == pytest.approx(1.0)


def test_cosine_similarity_orthogonal_vectors_is_zero():
    a = np.array([1.0, 0.0])
    b = np.array([0.0, 1.0])
    assert cosine_similarity(a, b) == pytest.approx(0.0)


def test_cosine_similarity_zero_vector_is_zero():
    a = np.zeros(3)
    b = np.array([1.0, 2.0, 3.0])
    assert cosine_similarity(a, b) == 0.0


def test_verify_with_no_enrollments_returns_unknown(tmp_path):
    verifier = FaceVerifier(str(tmp_path / "missing.json"), threshold=0.5)
    name, score = verifier.verify(np.array([1.0, 0.0, 0.0]))
    assert name == "Unknown"
    assert score == 0.0


def test_verify_matches_closest_enrolled_identity_above_threshold(tmp_path):
    path = tmp_path / "enrolled.json"
    path.write_text(
        json.dumps(
            {
                "alice": [1.0, 0.0, 0.0],
                "bob": [0.0, 1.0, 0.0],
            }
        )
    )
    verifier = FaceVerifier(str(path), threshold=0.9)
    name, score = verifier.verify(np.array([0.99, 0.01, 0.0]))
    assert name == "alice"
    assert score > 0.9


def test_verify_below_threshold_returns_unknown(tmp_path):
    path = tmp_path / "enrolled.json"
    path.write_text(json.dumps({"alice": [1.0, 0.0, 0.0]}))
    verifier = FaceVerifier(str(path), threshold=0.95)
    name, _ = verifier.verify(np.array([0.5, 0.5, 0.0]))
    assert name == "Unknown"


def test_save_enrollment_round_trips(tmp_path):
    path = tmp_path / "enrolled.json"
    embedding = np.array([0.1, 0.2, 0.3])
    FaceVerifier.save_enrollment(str(path), "carol", embedding)

    verifier = FaceVerifier(str(path), threshold=0.5)
    assert "carol" in verifier.enrolled
    np.testing.assert_allclose(verifier.enrolled["carol"], embedding, atol=1e-6)
