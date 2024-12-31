from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq
import asyncio

# Load .env file
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_retries=2,
    api_key=GROQ_API_KEY
)

messages = [
    ("system", "You are a helpful translator. Translate the user sentence to Traditional Chinese."),
    ("human", "I love programming."),
]

stream = llm.stream(messages)

full = next(stream)
print("\nStream response:\n==========")
for chunk in stream:
    full += chunk
    print(chunk.content, end="")

print(f"\n==========\n\nComplete response:\n==========\n{full.content}\n==========\n")
