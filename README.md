# Facial Landmarks Tracking

This project is a Flask web application that tracks facial landmarks using OpenCV and dlib libraries.

# Requirements
Python 3.6+
Flask
OpenCV
dlib
# Installation
1. Clone the repository to your local machine:
    git clone https://github.com/your-username/facial-landmark-tracking.git
2. Install the required Python packages:
    pip install -r requirements.txt
3. Download the facial landmark predictor model from here and extract the contents to the project directory.

# Usage
1. Run the Flask application:
    flask run
2. Open a web browser and go to http://localhost:5000 to see the facial landmark tracking in action.

# Files
    app.py: The Flask application that tracks facial landmarks.
    templates/index.html: The HTML template for the index page that displays the video feed.
    shape_predictor_68_face_landmarks.dat: The facial landmark predictor model.