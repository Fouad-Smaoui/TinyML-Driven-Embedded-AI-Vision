import time


def test_status_returns_expected_shape(client):
    response = client.get("/status")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "version" in body
    assert body["uptime_seconds"] >= 0
    assert "ping_stats" in body


def test_status_uptime_reflects_real_elapsed_time(client):
    first = client.get("/status").json()["uptime_seconds"]
    time.sleep(0.05)
    second = client.get("/status").json()["uptime_seconds"]

    assert second > first


def test_status_ping_stats_reflect_recorded_pings(client):
    before = client.get("/status").json()["ping_stats"]["total_pings"]

    client.post(
        "/ping", json={"fps": 30.0, "inference_ms": 12.0, "tracking_ms": 0.5, "delegate": "GPU"}
    )

    after = client.get("/status").json()["ping_stats"]["total_pings"]
    assert after == before + 1
