from dotenv import load_dotenv
import os
from pathlib import Path

from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
from groq import Groq

import chromadb

import base64
import json
import asyncio

# =======================================================
# =======================================================

# 刪除環境變數
if "GROQ_API_KEY" in os.environ:
    del os.environ["GROQ_API_KEY"]

# 找根目錄
def find_project_root(current_path, marker=".git"):
    current_path = Path(current_path).resolve()
    if (current_path / marker).exists():
        return current_path
    for parent in current_path.parents:
        if (parent / marker).exists():
            return parent
    return None

current_path = os.getcwd()
project_root = find_project_root(current_path, marker=".git")
print("Project root:", project_root)

# Load .env file
print(f"Successfully loaded env variables: {load_dotenv(project_root / ".env")}")

# Load env variables into python variables
print("Loaded env variables:")
print(f"GROQ_API_KEY = {os.getenv("GROQ_API_KEY")}")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# =======================================================
# =======================================================

chroma_client = chromadb.PersistentClient(path="vector_db")

# get_or_create_collection
documents = chroma_client.get_or_create_collection(name="documents")

# =======================================================
# =======================================================

@tool
def image_interpreting(image_path: str) -> str:
    """Interpret, explain, analyse or describe the content and underlying logic of any given image and return in JSON format.

    Args:
        image_path: the image file path
    """
    # Encode the image
    def encode_image(image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    base64_image = encode_image(image_path)
    request_text = "You are an assistant skilled at interpreting the content and underlying logic in images. Texts in this image are in Traditional Chinese. List what you observe in this image in JSON format."
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    chat_completion = client.chat.completions.create(
        model="llama-3.2-90b-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {   
                        "type": "text",
                        "text": request_text
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                        },
                    },
                ],
            }
        ],
        temperature=0.0,
        top_p=1,
        stream=False,
        response_format={"type": "json_object"},
        stop=None,
    )
    return str(json.loads(chat_completion.choices[0].message.content))

@tool
def document_retrieval(string: str) -> str:
    """A Traditional Chinese, powerful tool designed to retrieve relevant information from the robust document database using natural language questions or key phrases.

    Args:
        string: a Traditional Chinese sentence or a Traditional Chinese key phrase to retrieve relevant information from the database
    """
    result = documents.query(
        query_texts=[string],
        n_results=10
    )
    return str(result["documents"][0])

tools = [image_interpreting, document_retrieval]

# =======================================================
# =======================================================

llm = ChatGroq(
    model="llama-3.1-70b-versatile",
    temperature=0.5,
    max_retries=2,
    api_key=GROQ_API_KEY
)

prompt = hub.pull("hwchase17/openai-tools-agent")

# Show prompt
# prompt.pretty_print()

# Construct the tool calling agent
agent = create_tool_calling_agent(llm, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False, max_iterations=10)

# =======================================================
# =======================================================

async def agent(prompt: str) -> str:
    response = ""
    print(f"\nStart streaming response:\n=====\n")
    async for event in agent_executor.astream_events(
        {"input": prompt}, version="v1"
    ):
        kind = event["event"]
        if kind == "on_chain_start":
            if (event["name"] == "Agent"):  # Was assigned when creating the agent with `.with_config({"run_name": "Agent"})`
                # print(f"Starting agent: {event['name']} with input: {event['data'].get('input')}")
                pass
        elif kind == "on_chain_end":
            if (event["name"] == "Agent"):  # Was assigned when creating the agent with `.with_config({"run_name": "Agent"})`
                # print()
                # print("--")
                # print(
                #     f"Done agent: {event['name']} with output: {event['data'].get('output')['output']}"
                # )
                pass
        if kind == "on_chat_model_stream":
            content = event["data"]["chunk"].content
            if content:
                # Empty content in the context of OpenAI means
                # that the model is asking for a tool to be invoked.
                # So we only print non-empty content
                print(content, end="")
                response += content
                # yield content
                pass
        elif kind == "on_tool_start":
            # print("--")
            print(f"Starting tool: {event['name']} with inputs: {event['data'].get('input')}")
            pass
        elif kind == "on_tool_end":
            # print(f"Done tool: {event['name']}")
            # print(f"Tool output was: {event['data'].get('output')}")
            # print("--")
            pass
    print(f"\n=====\nResponse ends.\n")
    return response

# =======================================================
# =======================================================

if __name__ == "__main__":
    user_prompt = f"""
IMPORTANT: Use the powerful "document_retrieval" tool to search for information STRICTLY ONLY TWICE, NO MORE, and then respond to the human's message in Traditional Chinese or English.

Human's message:
校內媒合公告預計會在何時公布？
"""
    response = asyncio.run(agent(user_prompt))
    print(f"\nFinal response:\n{response}\n")


# 校內媒合公告預計會在何時公布？(0.5)
# 國際處什麼時候會提名？(0.5)
# 交換及獎學金申請文件有哪些？(0.5)
# 交換申請開放時間在什麼時候？(0.2)
# 交換學生的承辦信箱是什麼？(0.5)

# 出國交換生一般需繳文件有哪些？


