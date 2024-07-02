# Real-Time Industrial Monitoring and Optimization System

This project integrates real-time video processing, data analysis, AI-based facial recognition, optimization using a Kalman filter, IoT communication with an ESP32 microcontroller, and data visualization using Streamlit. Designed for industrial applications, this system provides real-time monitoring, data analysis, and optimized communication to enhance operational efficiency and decision-making.

## Project Overview

This project consists of several interconnected components:

1. **Data Analysis using NumPy and Pandas**
2. **AI and Computer Vision using Keras and OpenCV**
3. **Kalman Filter for Optimization**
4. **FreeRTOS on ESP32 with MQTT Communication Protocol**
5. **Data Visualization using Streamlit**


## Getting Started

### Prerequisites

Ensure you have the following installed:
- Python 3.x
- Flask
- OpenCV
- Dlib
- Keras
- NumPy
- Pandas
- Plotly
- Streamlit
- Arduino IDE or ESP-IDF for ESP32 programming

### Installation

1. **Clone the repository:**
    git clone https://github.com/Fouad-Smaoui/Real-Time-Industrial-AI-Monitoring-System.git
    cd Real-Time-Industrial-AI-Monitoring-System

2. **Install Python dependencies:**
    pip install -r requirements.txt


3. **Set up the ESP32:**
- Install Arduino IDE or ESP-IDF.
- Connect your ESP32 to your computer.
- Open `main.cpp` in the Arduino IDE.
- Update the WiFi credentials and MQTT broker address.
- Upload the code to the ESP32.

### Running the Project

1. **Run the Flask application:**
    python app.py

2. **Run the Jupyter notebook:**
    jupyter notebook data_analysis.ipynb


3. **Run the Streamlit application:**
    streamlit run streamlit_app.py


## Project Components

### 1. Data Analysis using NumPy and Pandas

**Jupyter Notebook: `data_analysis.ipynb`**

This notebook demonstrates comprehensive data analysis on industrial sensor data using NumPy for numerical operations, Pandas for data manipulation, and Plotly for interactive visualizations. It includes exploratory data analysis (EDA), statistical experiments, and hypothesis testing to derive insights from sensor readings.

### 2. AI and Computer Vision using Keras and OpenCV

**Flask Application: `app.py`**

The Flask app captures video, detects faces, and recognizes facial features using a pre-trained Keras model. The results are displayed in real-time.

### 3. Kalman Filter for Optimization

**Python Script: `kalman_filter.py`**

The Kalman filter script optimizes face tracking by predicting and correcting face positions.

### 4. FreeRTOS on ESP32 with MQTT Communication Protocol

**ESP32 Code: `main.cpp`**

The ESP32 code configures WiFi, MQTT communication, and runs a FreeRTOS task to handle MQTT operations.

### 5. Data Visualization using Streamlit & Plotly

**Streamlit Application: `streamlit_app.py`**

The Streamlit app provides an interactive interface for data analysis and visualization using Plotly for dynamic and engaging plots.

## Industrial Context

This system is designed for industrial environments where real-time monitoring, data analysis, and optimized communication are essential. Potential applications include:

- **Smart Surveillance:** Real-time facial recognition and tracking for enhanced security.
- **Industrial Automation:** Monitoring and controlling industrial processes through IoT and AI.
- **Predictive Maintenance:** Using data analysis to predict equipment failures and optimize maintenance schedules.
- **Quality Control:** Automated inspection and analysis of products using computer vision.

By integrating these technologies, the system provides a robust solution for enhancing operational efficiency and decision-making in industrial settings.

## Contributing

contributions are welcomed from the community. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.



