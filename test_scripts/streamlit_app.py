import streamlit as st

def run():
    uploaded_file = st.file_uploader("Choose a file")

if __name__ == "__main__":
    run()