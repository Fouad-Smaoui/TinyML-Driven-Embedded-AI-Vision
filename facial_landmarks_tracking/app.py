from flask import Flask, render_template, Response
import cv2
import dlib
import numpy as np
from keras.models import load_model
from keras.preprocessing import image
from kalman_filter import KalmanFilter
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)

# Load the face detector
detector = dlib.get_frontal_face_detector()

# Load the facial landmark predictor
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')

# Load a pre-trained Keras model for face recognition
model = load_model('face_recognition_model.h5')

# Define the lower and upper bounds of the skin color range for skin detection
lower_skin = np.array([0, 20, 70], dtype=np.uint8)
upper_skin = np.array([20, 255, 255], dtype=np.uint8)

# Initialize Kalman Filter for smoothing face tracking
kf = KalmanFilter()

# Initialize scikit-learn StandardScaler and PCA for dimensionality reduction
scaler = StandardScaler()
pca = PCA(n_components=100)  # Number of principal components to retain

# Function to perform face verification using the loaded Keras model
def verify_face(face_img):
    # Preprocess the face image: resize to input size of Keras model, normalize, and perform PCA    face_array = cv2.resize(face_img, (224, 224))  # Assuming input shape required by your model
    face_array = cv2.resize(face_img, (224, 224))  # Resize to match the input shape of the Keras model
    
    # Normalize pixel values and reshape for compatibility with StandardScaler
    face_array = face_array.astype('float32') / 255.0  # Normalize pixel values
    face_array = scaler.fit_transform(face_array.reshape(-1, 1)).reshape(face_array.shape)
    
    # Apply PCA for dimensionality reduction
    face_array = pca.fit_transform(face_array.reshape(face_array.shape[0], -1)).reshape(face_array.shape)
    
    # Add batch dimension for Keras model input   
    face_array = np.expand_dims(face_array, axis=0)  # Add batch dimension

    # Perform prediction using the loaded keras model
    prediction = model.predict(face_array)

    # logic for face verification (adjust as per model output and criteria)
    threshold = 0.5  # Adjust threshold based on model and application requirements
    if prediction[0][0] > threshold:
        return True # Face is verified
    else:
        return False # Face is not verified
    
def get_camera():
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        else:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # Detect faces using dlib's face detector
            faces = detector(gray)
            for face in faces:
                # Predict the new face position using the Kalman filter
                predicted = kf.predict()
                
                # Correct the Kalman filter based on detected face position
                kf.correct(face.left() + (face.width() / 2), face.top() + (face.height() / 2))
                
                # Use the predicted face position for drawing and further processing
                predicted_x, predicted_y = int(predicted[0]), int(predicted[1])
                
                # Detect facial landmarks using dlib's shape predictor
                landmarks = predictor(gray, face)
                # Draw facial landmarks
                for n in range(0, 68):
                    x = landmarks.part(n).x
                    y = landmarks.part(n).y
                    cv2.circle(frame, (x, y), 1, (0, 0, 255), -1)
                # Draw bounding box around detected face using predicted position
                cv2.rectangle(frame, (predicted_x - (face.width() // 2), predicted_y - (face.height() // 2)),
                              (predicted_x + (face.width() // 2), predicted_y + (face.height() // 2)), (0, 255, 0), 2)
                face_region = frame[face.top():face.bottom(), face.left():face.right()]
                '''
                # uncomment for performing virtual try on :  
                face_hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
                skin_mask = cv2.inRange(face_hsv, lower_skin, upper_skin)
                skin_color = cv2.bitwise_and(face_region, face_region, mask=skin_mask)
                cv2.imshow("skin color", skin_color)
                face_img = cv2.resize(face_region, (224, 224))
                face_array = image.img_to_array(face_img)
                face_array = np.expand_dims(face_array, axis=0)
                prediction = model.predict(face_array)
                cv2.putText(frame, f'Prediction: {prediction}', (face.left(), face.top() - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
                '''
                 # Perform face verification
                if verify_face(face_region):
                    cv2.putText(frame, 'Verified', (face.left(), face.top() - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
                else:
                    cv2.putText(frame, 'Not Verified', (face.left(), face.top() - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
            
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