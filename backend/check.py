import os
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

# Load environment variables
load_dotenv()

# Create an instance of the Pinecone class
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Specify the index name
index_name = "rag"

# Delete the index if it exists
if index_name in pc.list_indexes().names():
    pc.delete_index(index_name)
    print(f"Index '{index_name}' deleted successfully.")
else:
    print(f"Index '{index_name}' does not exist.")
