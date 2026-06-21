def test_metrics_exposes_prometheus_text_format(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")
    assert "edgevision_http_requests_total" in response.text


def test_metrics_request_counter_increments_with_real_traffic(client):
    client.get("/health")
    client.get("/health")

    body = client.get("/metrics").text

    matching_lines = [
        line
        for line in body.splitlines()
        if line.startswith("edgevision_http_requests_total") and 'path="/health"' in line
    ]
    assert matching_lines, "expected a counter sample for the /health route"

    value = float(matching_lines[0].rsplit(" ", 1)[-1])
    assert value >= 2


def test_metrics_ping_histogram_observes_real_values(client):
    client.post(
        "/ping", json={"fps": 42.0, "inference_ms": 7.5, "tracking_ms": 0.2, "delegate": "CPU"}
    )

    body = client.get("/metrics").text
    assert 'edgevision_ping_total{delegate="CPU"}' in body
    assert "edgevision_ping_fps_bucket" in body
