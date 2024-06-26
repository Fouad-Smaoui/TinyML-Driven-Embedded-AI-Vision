import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

st.title('Industrial Sensor Data Analysis')

# Load processed data
data = pd.read_csv('data/processed_data.csv')

# Display the dataframe
st.write(data)

# Display summary statistics
st.write("Summary statistics:")
summary_statistics = pd.read_csv('data/results/summary_statistics.csv')
st.write(summary_statistics)

# Example plot
st.write("Scatter plot of Sensor Data:")
scatter_plot = plt.imread('data/results/scatter_plot.png')
st.image(scatter_plot)

# Example of model predictions
st.write("Model Predictions:")
model_predictions = pd.read_csv('data/results/model_predictions.csv')
st.write(model_predictions)
