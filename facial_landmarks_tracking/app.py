from flask import Flask, render_template, Response
import cv2
import dlib
import numpy as np
from keras.models import load_model
from keras.preprocessing import image
from kalman_filter import KalmanFilter

app = Flask(__name__)

# Load the face detector
detector = dlib.get_frontal_face_detector()

# Load the facial landmark detector
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')

# Load a pre-trained Keras model
model = load_model('your_model.h5')

# Define the lower and upper bounds of the skin color range
lower_skin = np.array([0, 20, 70], dtype=np.uint8)
upper_skin = np.array([20, 255, 255], dtype=np.uint8)

# Initialize Kalman Filter
kf = KalmanFilter()

def get_camera():
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        else:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = detector(gray)
            for face in faces:
                landmarks = predictor(gray, face)
                for n in range(0, 68):
                    x = landmarks.part(n).x
                    y = landmarks.part(n).y
                    cv2.circle(frame, (x, y), 1, (0, 0, 255), -1)
                cv2.rectangle(frame, (face.left(), face.top()), (face.right(), face.bottom()), (0, 255, 0), 2)
                face_region = frame[face.top():face.bottom(), face.left():face.right()]
                face_hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
                skin_mask = cv2.inRange(face_hsv, lower_skin, upper_skin)
                skin_color = cv2.bitwise_and(face_region, face_region, mask=skin_mask)
                cv2.imshow("skin color", skin_color)
                face_img = cv2.resize(face_region, (224, 224))
                face_array = image.img_to_array(face_img)
                face_array = np.expand_dims(face_array, axis=0)
                prediction = model.predict(face_array)
                cv2.putText(frame, f'Prediction: {prediction}', (face.left(), face.top() - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
            ret, jpeg = cv2.imencode('.jpg', frame)
            frame = jpeg.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        if cv2.waitKey(1) == ord('q'):
            break
    cap.release()
    cv2.destroyAllWindows()

@app.route('/video_feed')
def video_feed():
    return Response(get_camera(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
