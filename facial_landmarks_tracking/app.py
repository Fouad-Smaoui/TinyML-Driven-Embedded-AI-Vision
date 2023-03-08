from flask import Flask, render_template, Response
import cv2
import dlib
import numpy as np

app = Flask(__name__)

# Load the face detector
detector = dlib.get_frontal_face_detector()

# Load the facial landmark detector
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')

# Define the lower and upper bounds of the skin color range
lower_skin = np.array([0, 20, 70], dtype=np.uint8)
upper_skin = np.array([20, 255, 255], dtype=np.uint8)

# Define a function to get the camera feed
def get_camera():
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        else:
            # Convert the frame to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # Detect faces in the grayscale frame
            faces = detector(gray)

            # Iterate over the detected faces
            for face in faces:
                # Detect facial landmarks in the face region
                landmarks = predictor(gray, face)

                # Iterate over the facial landmarks
                for n in range(0, 68):
                    x = landmarks.part(n).x
                    y = landmarks.part(n).y

                    # Draw the facial landmark points on the face region
                    cv2.circle(frame, (x, y), 1, (0, 0, 255), -1)

                # Draw a rectangle around the detected face
                cv2.rectangle(frame, (face.left(), face.top()), (face.right(), face.bottom()), (0, 255, 0), 2)

                # Convert the face region to the HSV color space
                face_region = frame[face.top():face.bottom(), face.left():face.right()]
                face_hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)

                # Threshold the face region to get the skin color
                skin_mask = cv2.inRange(face_hsv, lower_skin, upper_skin)
                skin_color = cv2.bitwise_and(face_region, face_region, mask=skin_mask)

                # Display the skin color in the video feed
                cv2.imshow("skin color", skin_color)

            # Encode the image as JPEG and yield it to the web app
            ret, jpeg = cv2.imencode('.jpg', frame)
            frame = jpeg.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        # Exit the loop when the 'q' key is pressed
        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# Define the route for the video feed
@app.route('/video_feed')
def video_feed():
    return Response(get_camera(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Define the index page route
@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
