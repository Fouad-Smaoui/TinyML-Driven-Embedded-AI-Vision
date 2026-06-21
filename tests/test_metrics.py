from perception.metrics import MetricsRecorder


def test_snapshot_with_no_data_is_zeroed():
    recorder = MetricsRecorder(window_size=10)
    snapshot = recorder.snapshot()
    assert snapshot["fps"] == 0.0
    assert snapshot["sample_size"] == 0


def test_record_frame_tracks_latency_averages():
    recorder = MetricsRecorder(window_size=10)
    recorder.record_frame(detection_latency_ms=10.0, embedding_latency_ms=20.0)
    recorder.record_frame(detection_latency_ms=30.0, embedding_latency_ms=40.0)

    snapshot = recorder.snapshot()
    assert snapshot["avg_detection_latency_ms"] == 20.0
    assert snapshot["avg_embedding_latency_ms"] == 30.0
    assert snapshot["sample_size"] == 2


def test_record_verification_counts_known_and_unknown():
    recorder = MetricsRecorder(window_size=10)
    recorder.record_verification("alice")
    recorder.record_verification("Unknown")
    recorder.record_verification("alice")

    snapshot = recorder.snapshot()
    assert snapshot["verified_count"] == 2
    assert snapshot["unknown_count"] == 1


def test_window_size_bounds_memory():
    recorder = MetricsRecorder(window_size=3)
    for i in range(10):
        recorder.record_frame(detection_latency_ms=i, embedding_latency_ms=i)

    snapshot = recorder.snapshot()
    assert snapshot["sample_size"] == 3
