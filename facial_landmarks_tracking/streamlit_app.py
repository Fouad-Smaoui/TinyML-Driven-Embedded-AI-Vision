import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.io as pio

# Set the title of the Streamlit app
st.title('Industrial Sensor Data Analysis')

# Load processed data
data = pd.read_csv('data/processed_data.csv')

# Display the dataframe
st.write("Processed Data:")
st.write(data)

# Load and display summary statistics from another CSV file
st.write("Summary statistics:")
summary_statistics = pd.read_csv('data/results/summary_statistics.csv')
st.write(summary_statistics)

# Create and display a scatter plot using Plotly
st.write("Scatter plot of Sensor Data:")
fig_scatter = px.scatter(data, x='sensor_1', y='sensor_2', title='Scatter Plot of Sensor Data')
st.plotly_chart(fig_scatter)

# Histogram of Sensor 1 Data
st.write("Histogram of Sensor 1 Data:")
fig_histogram = px.histogram(data, x='sensor_1', title='Histogram of Sensor 1 Data')
st.plotly_chart(fig_histogram)

# Additional Statistical Insights

# Box plot to detect outliers in Sensor 1 readings
st.write("Box Plot of Sensor 1 Data:")
fig_boxplot = px.box(data, y='sensor_1', title='Box Plot of Sensor 1 Data')
st.plotly_chart(fig_boxplot)

# Hypothesis Testing Results
st.write("Hypothesis Testing Results:")
# Replace with actual hypothesis testing results from your analysis, if applicable
st.write("Placeholder for hypothesis testing results")

# Model Predictions (if applicable)
# Load and display model predictions from another CSV file
st.write("Model Predictions:")
model_predictions = pd.read_csv('data/results/model_predictions.csv')
st.write(model_predictions)
