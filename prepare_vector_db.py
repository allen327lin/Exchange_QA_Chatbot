from dotenv import load_dotenv
import os
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader

import chromadb

from uuid import uuid4


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
print("Project root:", project_root)   # Project root: /Users/allen/Documents/code/Exchange_QA_Chatbot

DOCUMENTS_FOLDER = project_root / "data/documents"


# 把 PDF 都轉成 vector 存進 ChromaDB 當 RAG 資料
def prepare_vector_db():
    global DOCUMENTS_FOLDER

    chroma_client = chromadb.PersistentClient(path="vector_db")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=200,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )

    # Delete existing collections first
    current_collections = chroma_client.list_collections()
    for collection in current_collections:
        chroma_client.delete_collection(name="documents")

    # Then create a new collection
    documents = chroma_client.get_or_create_collection(
        name="documents", 
        metadata={"hnsw:space": "cosine", "hnsw:search_ef": 100}
    )

    def embed_pdf(pdf_file_path):
        loader = PyPDFLoader(pdf_file_path)
        pages = []
        pages = loader.load()

        for index in range(len(pages)):
            documents_list = text_splitter.split_text(pages[index].page_content)
            if documents_list != []:
                documents.add(
                    documents=documents_list,
                    ids=[f"id-{str(uuid4())}" for i in range(len(documents_list))],
                    metadatas=[{"source": pages[index].metadata["source"], "page": index+1} for i in range(len(documents_list))]
                )
    
    pdf_files = [f"{DOCUMENTS_FOLDER}/{pdf_file_path}" for pdf_file_path in os.listdir(DOCUMENTS_FOLDER)]

    for pdf_file in pdf_files:
        print(f"\nProcessing: {Path(pdf_file).name}\n")
        embed_pdf(pdf_file)
    
    print("\nAll documents processed and stored in ChromaDB.\n")


if __name__ == "__main__":
    prepare_vector_db()
