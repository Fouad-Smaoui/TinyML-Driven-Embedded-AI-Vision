from flask import Flask, render_template, Response
import cv2
import dlib
import numpy as np

app = Flask(__name__)

# Load face detector and landmark detector
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')
lipstick = cv2.imread('static/js/images/lipstick.jpg')

# Open video capture device
cap = cv2.VideoCapture(0)

def generate_frames():
    while True:
        # Read frame from video capture device
        ret, frame = cap.read()

        # Convert frame to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect faces in the grayscale frame
        faces = detector(gray)

        # Iterate over detected faces
        for face in faces:
            # Detect facial landmarks in face region
            landmarks = predictor(gray, face)

            # Extract lip landmark points
            lip_points = []
            for i in range(48, 60):
                x = landmarks.part(i).x
                y = landmarks.part(i).y
                lip_points.append((x, y))

            # Calculate lip bounding box
            min_x, min_y = min(lip_points, key=lambda p: p[0])[0], min(lip_points, key=lambda p: p[1])[1]
            max_x, max_y = max(lip_points, key=lambda p: p[0])[0], max(lip_points, key=lambda p: p[1])[1]

            # Overlay lipstick image onto lip area
            lipstick_resized = cv2.resize(lipstick, (max_x - min_x, max_y - min_y))
            face_lip = frame[min_y:max_y, min_x:max_x]
            face_lip = cv2.addWeighted(face_lip, 1, lipstick_resized, 0.8, 0)
            frame[min_y:max_y, min_x:max_x] = face_lip

            # Draw lip landmark points for debugging
            for (x, y) in lip_points:
                cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)

            # Draw lip bounding box for debugging
            cv2.rectangle(frame, (min_x, min_y), (max_x, max_y), (0, 0, 255), 2)

            # Draw face bounding box for debugging
            cv2.rectangle(frame, (face.left(), face.top()), (face.right(), face.bottom()), (255, 0, 0), 2)

        # Convert frame to JPEG and send to web app
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# Define the route for the video feed
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


# Define the index page route
@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    # Load lipstick image

    app.run(debug=True)



if __name__ == '__main__':
    # Load lipstick image

    app.run(debug=True)
