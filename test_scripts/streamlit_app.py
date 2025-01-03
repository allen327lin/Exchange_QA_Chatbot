import streamlit as st
import streamlit.components.v1 as components

def run():
    uploaded_file = st.file_uploader("Choose a file")

if __name__ == "__main__":
    run()