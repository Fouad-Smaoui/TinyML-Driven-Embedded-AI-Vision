import numpy as np
import cv2

class KalmanFilter:
    def __init__(self):
        self.kalman = cv2.KalmanFilter(4, 2)
        self.kalman.measurementMatrix = np.array([[1, 0, 0, 0], 
                                                  [0, 1, 0, 0]], np.float32)
        self.kalman.transitionMatrix = np.array([[1, 0, 1, 0], 
                                                 [0, 1, 0, 1], 
                                                 [0, 0, 1, 0], 
                                                 [0, 0, 0, 1]], np.float32)
        
        # Process noise covariance
        self.kalman.processNoiseCov = np.array([[1, 0, 0, 0], 
                                                [0, 1, 0, 0], 
                                                [0, 0, 1, 0], 
                                                [0, 0, 0, 1]], np.float32) * 0.03
        # Measurement noise covariance
        self.kalman.measurementNoiseCov = np.array([[1, 0], 
                                                    [0, 1]], np.float32) * 1
        
        # Error covariance matrix
        self.kalman.errorCovPost = np.eye(4, dtype=np.float32)
        
        # Initial state (location and velocity)
        self.kalman.statePost = np.array([[0], 
                                          [0], 
                                          [0], 
                                          [0]], np.float32)
    def predict(self):
        return self.kalman.predict()

    def correct(self, x, y):
        return self.kalman.correct(np.array([[np.float32(x)], [np.float32(y)]]))