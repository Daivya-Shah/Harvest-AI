from dotenv import load_dotenv
load_dotenv()
import os
import json
import re
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Define index name
index_name = "harvest-ai"

# Check if the index already exists, if not, create it
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )

# Connect to the index
index = pc.Index(index_name)

# Load manufacturer data safely
script_dir = os.path.dirname(os.path.abspath(__file__))  # Get the script's directory
file_path = os.path.join(script_dir, "manufacturers.json")  # Locate the file

try:
    with open(file_path, "r") as f:
        data = json.load(f)
except FileNotFoundError:
    print(f"Error: manufacturers.json not found at {file_path}")
    exit(1)

processed_data = []
client = OpenAI()

# Function to sanitize IDs (Ensures ASCII, removes special characters, replaces spaces with dashes)
def clean_ascii(text):
    text = text.replace("’", "'")  # Convert curly apostrophes
    text = text.encode("ascii", "ignore").decode()  # Remove non-ASCII characters
    text = re.sub(r"[^a-zA-Z0-9\- ]", "", text)  # Remove unwanted symbols
    text = text.replace(" ", "-")  # Replace spaces with dashes
    return text

# Create embeddings for each category, subcategory, and sub-subcategory
for manufacturer in data["manufacturers"]:
    manufacturer_name = manufacturer["name"]
    manufacturer_location = manufacturer["location"]
    manufacturer_description = manufacturer["description"]

    for category in manufacturer["categories"]:
        category_name = category["name"]

        for subcategory in category.get("subcategories", []):  
            subcategory_name = subcategory["name"]
            subcategory_description = subcategory.get("description", "")

            # If subcategories exist within subcategories (sub-subcategories)
            if "subcategories" in subcategory and subcategory["subcategories"]:
                for sub_subcategory in subcategory["subcategories"]:
                    sub_subcategory_name = sub_subcategory["name"]
                    sub_subcategory_description = sub_subcategory.get("description", "")

                    # Generate an embedding for sub-subcategory
                    response = client.embeddings.create(
                        input=f"{manufacturer_name} - {category_name} - {subcategory_name} - {sub_subcategory_name}: {sub_subcategory_description}",
                        model="text-embedding-3-small"
                    )
                    embedding = response.data[0].embedding

                    # Sanitize vector ID
                    vector_id = clean_ascii(f"{manufacturer_name}-{category_name}-{subcategory_name}-{sub_subcategory_name}")

                    processed_data.append(
                        {
                            "values": embedding,
                            "id": vector_id,
                            "metadata": {
                                "manufacturer": manufacturer_name,
                                "location": manufacturer_location,
                                "category": category_name,
                                "subcategory": subcategory_name,
                                "sub-subcategory": sub_subcategory_name,
                                "description": sub_subcategory_description,
                            }
                        }
                    )
            else:
                # Generate an embedding for subcategory (if no sub-subcategories exist)
                response = client.embeddings.create(
                    input=f"{manufacturer_name} - {category_name} - {subcategory_name}: {subcategory_description}",
                    model="text-embedding-3-small"
                )
                embedding = response.data[0].embedding

                # Sanitize vector ID
                vector_id = clean_ascii(f"{manufacturer_name}-{category_name}-{subcategory_name}")

                processed_data.append(
                    {
                        "values": embedding,
                        "id": vector_id,
                        "metadata": {
                            "manufacturer": manufacturer_name,
                            "location": manufacturer_location,
                            "category": category_name,
                            "subcategory": subcategory_name,
                            "description": subcategory_description,
                        }
                    }
                )

# Insert the embeddings into Pinecone
upsert_response = index.upsert(
    vectors=processed_data,
    namespace="ns1",
)

print(f"Upserted count: {upsert_response['upserted_count']}")
print(index.describe_index_stats())
