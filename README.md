# TinyML-Driven-Embedded-AI-Vision

This project integrates TinyML, embedded AI, and computer vision technologies to provide advanced solutions for real-time image processing and analysis on embedded systems. It features AI-based facial recognition, optimization through a Kalman filter, and IoT communication with an ESP32 microcontroller. Additionally, the system includes comprehensive data analysis and visualization capabilities using Streamlit. Designed for industrial applications, this system enhances operational efficiency and decision-making through real-time monitoring, on-device inference, and optimized communication.

## Project Overview

This project consists of several interconnected components:

1. **Data Analysis using NumPy and Pandas**
2. **AI and Computer Vision using Keras and OpenCV**
3. **Kalman Filter for Optimization**
4. **FreeRTOS on ESP32 with MQTT Communication Protocol**
5. **TinyML for On-Device Inference**
6. **Data Visualization using Streamlit**


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
- Scikit Learn
- Tensorflow
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

### 2. AI and Computer Vision using Keras, Scikit and OpenCV

**Flask Application: `app.py`**

The Flask app captures video, detects faces against known identity, recognizes facial features using a pre-trained Keras model and enhances accuracy through Scikit-Learn's PCA module. The results are displayed in real-time.


### 3. Kalman Filter for Optimization

**Python Script: `kalman_filter.py`**

The Kalman filter optimizes face tracking by predicting and smoothing the trajectory of detected faces, improving tracking accuracy and robustness under motion.

### 4. FreeRTOS on ESP32 with MQTT Communication Protocol

**ESP32 Code: `main.cpp`**

The ESP32 code configures WiFi, MQTT communication, and runs a FreeRTOS task to handle MQTT operations.

### 5. TinyML for On-Device Inference
This project includes a TinyML component designed to enable efficient model inference on low-power devices such as the ESP32. By utilizing TensorFlow Lite, we can deploy machine learning models that run directly on the hardware, minimizing latency and reducing the need for cloud-based processing.

Model Training and Conversion:
A simple neural network is trained on the MNIST dataset for digit recognition. The trained model is converted to TensorFlow Lite format for compatibility with embedded devices.

**TinyML Code : `train_and_convert_model.py`**

### 6. Data Visualization using Streamlit & Plotly

**Streamlit Application: `streamlit_app.py`**

The Streamlit app provides an interactive interface for data analysis and visualization using Plotly for dynamic and engaging plots.

## Industrial Context

This system is designed for industrial environments where real-time monitoring, data analysis, and optimized communication are essential. Potential applications include:

- **Smart Surveillance:** Real-time facial recognition and tracking for enhanced security.
- **Industrial Automation:** Monitoring and controlling industrial processes through IoT and AI.
- **Predictive Maintenance:** Using data analysis to predict equipment failures and optimize maintenance schedules.
- **Quality Control:** Automated inspection and analysis of products using computer vision.
- **Edge Computing with TinyML**: Enabling on-device inference using TensorFlow Lite, allowing for low-latency decision-making in environments with limited connectivity, such as remote industrial sites.

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



