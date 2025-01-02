from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq
from pathlib import Path

# 刪除環境變量
if "GROQ_API_KEY" in os.environ:
    del os.environ["GROQ_API_KEY"]

# 找根目錄
def find_project_root(current_path, marker=".git"):
    current_path = Path(current_path).resolve()
    for parent in current_path.parents:
        if (parent / marker).exists():
            return parent
    return None

current_path = __file__
project_root = find_project_root(current_path, marker=".git")
print("Project root:", project_root)

# Load .env file
print(f"Successfully loaded env variables: {load_dotenv(project_root / ".env")}")

# Load env variables into python variables
print("Loaded env variables:")
print(f"GROQ_API_KEY = {os.getenv("GROQ_API_KEY")}")
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
