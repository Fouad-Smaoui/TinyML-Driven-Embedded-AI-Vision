from perception.tracking import FaceTracker


def test_predict_starts_at_origin():
    tracker = FaceTracker()
    x, y = tracker.predict()
    assert x == 0.0
    assert y == 0.0


def test_tracker_converges_to_a_stationary_point():
    tracker = FaceTracker()
    target_x, target_y = 100.0, 200.0

    for _ in range(50):
        tracker.predict()
        smoothed_x, smoothed_y = tracker.correct(target_x, target_y)

    assert abs(smoothed_x - target_x) < 1.0
    assert abs(smoothed_y - target_y) < 1.0


def test_tracker_smooths_noisy_measurements():
    tracker = FaceTracker()
    import random

    random.seed(0)
    target = 50.0
    last_smoothed = None
    for _ in range(100):
        tracker.predict()
        noisy = target + random.uniform(-5, 5)
        last_smoothed, _ = tracker.correct(noisy, noisy)

    assert abs(last_smoothed - target) < 5.0
