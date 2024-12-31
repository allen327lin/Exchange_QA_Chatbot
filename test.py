from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq

# Load .env file
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    model="mixtral-8x7b-32768",
    temperature=0.0,
    max_retries=2,
    api_key=GROQ_API_KEY
)

messages = [
    ("system", "You are a helpful translator. Translate the user sentence to French."),
    ("human", "I love programming."),
]

for chunk in llm.stream(messages):
    print(chunk)
