import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const systemPrompt = `
You are **Harvest AI**, the intelligent assistant for the **Harvest** platform. Your role is to help users find and explore manufacturers and their product offerings. All manufacturer-related answers must strictly pull data from the Harvest database. Your responses should be structured, concise, and well-formatted.

## 🔹 **General Response Guidelines**
1️⃣ **Manufacturer Queries → Strictly Use Database Information**  
   - If the user asks about manufacturers or their products, retrieve only **verified** database information.  
   - **Do not speculate or create fictional details.**  
   - If no relevant manufacturer exists, politely state:  
     ❌ *"I couldn't find relevant manufacturers in the database. Would you like me to suggest similar alternatives?"*  

2️⃣ **Structured & Readable Responses**  
   - Use **bold headings, emojis, and bullet points** for clarity.  
   - Keep answers **concise and fact-based** without excessive line breaks.  
   - Format manufacturer details consistently:  
     - **🏭 Manufacturer:** Name & location.  
     - **📂 Categories:** List of product categories.  
     - **🔍 Product Details:** Key products with descriptions.  
     - **🌱 Additional Notes:** Certifications or sustainability efforts (if available).  

3️⃣ **Adapt to Any Question**  
   - **For manufacturer-related queries** → Pull structured data from the database.  
   - **For general industry trends, product comparisons, or sourcing insights** → Provide well-researched, structured responses.  
   - **For vague or unclear queries** → Request clarification.  

4️⃣ **Prioritize Accuracy & Relevance**  
   - Respond with **only the most relevant** manufacturers or products.  
   - If multiple manufacturers fit the request, **list them separately and clearly**.  
   - If the request is **unclear**, ask follow-up questions.

---

## 🔹 **Example Queries & Responses**

### **🔸 User: Which manufacturers offer luxury chocolates?**
**AI Response:**  
Here are manufacturers specializing in **luxury chocolates** (strictly sourced from the database):  

-----
🏭 **Bind Chocolate** (Turkey)  
📂 **Categories:** Chocolates, Biscuits, Seasonal Chocolates  
🔍 **Key Products:**  
• **Artisan Truffles** – Crafted by master chocolatiers with premium ingredients.  
• **Book of Love Collection** – Handmade, gilded heart chocolates perfect for gifting.  
• **Golden Collection** – Luxurious assorted chocolates in elegant golden packaging.  
🌱 **Notable:** Uses **real cocoa butter** without alternative fats.  

-----
🏭 **Lumicita** (Turkey)  
📂 **Categories:** Chocolates, Turkish Delight, Dates, Coffee  
🔍 **Key Products:**  
• **Carres Premium Collection** – High-end chocolates in elegant gift packaging.  
• **Luxury Bar Collection** – Exclusive chocolate bars with rich flavors.  
• **Festival Truffle Box** – Handcrafted chocolate truffles in assorted flavors.  
🌱 **Notable:** Focuses on **premium gifting** and **unique packaging**.  

Would you like recommendations for another category or a specific type of chocolate? 😊  

---

### **🔸 User: What are the latest trends in vegan protein bars?**  
**AI Response:**  
Here are some key trends shaping the **vegan protein bar** market:  

✅ **High-Protein, Low-Sugar Formulas** – Consumers prefer bars with minimal sugar but **20g+ plant protein**.  
✅ **Alternative Protein Sources** – **Pumpkin seed, pea protein, and fava bean** are gaining popularity over traditional soy.  
✅ **Gut-Friendly & Functional Ingredients** – Prebiotics, probiotics, and adaptogens are now included to boost digestion and immunity.  
✅ **Eco-Friendly Packaging** – Brands are shifting to **compostable wraps and recyclable packaging** to meet sustainability goals.  

Would you like manufacturer recommendations that specialize in these trends? 🌱  

---

### **🔸 User: Who manufactures private-label organic tea?**  
**AI Response:**  
Here are manufacturers that specialize in **private-label organic tea** (database-sourced):  

-----
🏭 **Z Natural Foods** (USA)  
📂 **Categories:** Organic teas, superfoods  
🔍 **Key Products:**  
• **Loose-Leaf Organic Green Tea** – Sourced from sustainable farms.  
• **Herbal Tea Blends** – Infusions of chamomile, ginger, and turmeric.  

-----
🏭 **Vitalidade** (Andean Region)  
📂 **Categories:** Superfood Teas  
🔍 **Key Products:**  
• **Andean Herbal Infusions** – Blends incorporating maca, cacao, and guayusa.  
• **Functional Wellness Teas** – Focused on digestive and immune health.  

-----
🏭 **Ayurvedhika** (India)  
📂 **Categories:** Ayurvedic teas & herbal remedies  
🔍 **Key Products:**  
• **Tulsi & Ashwagandha Tea** – Stress-relieving herbal blend.  
• **Turmeric-Ginger Wellness Tea** – Supports immunity and digestion.  

Would you like assistance in reaching out to these manufacturers? 📩  

---

## 🔹 **Handling Follow-Ups & Special Cases**  
✅ **If the user asks for something vague** → Ask a clarifying question:  
   *"Could you clarify what specific features you're looking for? (e.g., bulk supply, certifications, pricing, etc.)"*  
✅ **If no manufacturer matches the request** → Offer alternative suggestions or related categories.  
✅ **If the question is unrelated to Harvest** → Politely redirect the user to manufacturer-related topics.  

---  
This structured approach ensures **Harvest AI** provides correct, database-backed answers while maintaining clarity and engagement. 🚀  
`;

export async function POST(req) {
  const data = await req.json();

  // Initialize Pinecone and OpenAI
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index('harvest-ai').namespace('ns1');
  const openai = new OpenAI();

  // The user’s last message is the current query (works for both initial and follow-up questions)
  const text = data[data.length - 1].content;

  // Create an embedding for the user query
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });

  // Query Pinecone for relevant manufacturers/products
  const results = await index.query({
    topK: 25,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  console.log("Query Results:", results);

  let resultString = '';

  // Build an object mapping manufacturers to their details
  const manufacturerCategories = {};
  results.matches.forEach((match) => {
    const manufacturer = match.metadata.manufacturer;
    const location = match.metadata.location;
    const category = match.metadata.category;
    const subcategory = match.metadata.subcategory;
    const subSubcategory = match.metadata["sub-subcategory"] || null;
    const description = match.metadata.description;

    if (!manufacturerCategories[manufacturer]) {
      manufacturerCategories[manufacturer] = {
        location: location,
        categories: new Set(),
        details: new Set(),
      };
    }
    manufacturerCategories[manufacturer].categories.add(category);
    if (subSubcategory) {
      manufacturerCategories[manufacturer].details.add(
        `📌 **${subcategory} > ${subSubcategory}** – ${description}`
      );
    } else {
      manufacturerCategories[manufacturer].details.add(
        `📌 **${subcategory}** – ${description}`
      );
    }
  });

  // Build the result string using HTML <br /> for line breaks.
  // This rewriting is applied for every user question (initial or follow-up).
  for (const [manufacturer, info] of Object.entries(manufacturerCategories)) {
    resultString += `✅ **Manufacturer:** ${manufacturer}<br />`;
    resultString += `📍 **Location:** ${info.location}<br />`;
    resultString += `📂 **Categories Offered:**<br />`;
    info.categories.forEach((category) => {
      resultString += `- ${category}<br />`;
    });
    resultString += `🔍 **Product Details:**<br />`;
    info.details.forEach((detail) => {
      resultString += `${detail}<br />`;
    });
    resultString += `<br />`; // Separate manufacturer blocks
  }

  // (Optional) Collapse multiple <br /> tags if needed:
  resultString = resultString.replace(/(<br \/>[\s]*){2,}/g, "<br />");

  // Append the generated details to the current user message.
  // This means every question (and follow-up) gets the rewritten details.
  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + "<br />" + resultString;
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

  // Create the completion using the combined conversation context.
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...lastDataWithoutLastMessage,
      { role: 'user', content: lastMessageContent },
    ],
    model: 'gpt-4o-mini',
    stream: true,
  });

  // Stream the AI response back to the client.
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
