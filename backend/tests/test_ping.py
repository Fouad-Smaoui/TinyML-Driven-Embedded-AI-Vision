VALID_PAYLOAD = {"fps": 30.0, "inference_ms": 12.5, "tracking_ms": 0.4, "delegate": "GPU"}


def test_valid_ping_is_accepted(client):
    response = client.post("/ping", json=VALID_PAYLOAD)
    assert response.status_code == 204
    assert response.content == b""


def test_missing_field_is_rejected(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "delegate"}
    response = client.post("/ping", json=payload)
    assert response.status_code == 422


def test_invalid_delegate_value_is_rejected(client):
    response = client.post("/ping", json={**VALID_PAYLOAD, "delegate": "TPU"})
    assert response.status_code == 422


def test_out_of_range_fps_is_rejected(client):
    response = client.post("/ping", json={**VALID_PAYLOAD, "fps": -1})
    assert response.status_code == 422


def test_schema_structurally_cannot_accept_face_or_video_data(client):
    """The privacy claim ("no biometric data ever leaves the browser") is
    enforced here, not just stated in the README: any extra field — a face
    embedding, a frame, anything — is rejected outright."""
    response = client.post("/ping", json={**VALID_PAYLOAD, "face_embedding": [0.1, 0.2, 0.3]})
    assert response.status_code == 422
