import uvicorn
import logging
import io
import cv2
import os
import uuid
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import BlipProcessor, BlipForConditionalGeneration, AutoTokenizer, AutoModelForSeq2SeqLM

# --- 1. SETUP ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. LOAD MODELS ---
logger.info("⏳ Loading Vision Model (BLIP)...")
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
vision_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

logger.info("⏳ Loading Text Brain (Flan-T5)...")
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
writer_model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")
logger.info("✅ Models Loaded! Ready for Magic.")

# --- 3. HELPER FUNCTIONS ---
def load_image(file_bytes):
    return Image.open(io.BytesIO(file_bytes)).convert('RGB')

def extract_frame(video_path):
    cam = cv2.VideoCapture(video_path)
    total = int(cam.get(cv2.CAP_PROP_FRAME_COUNT))
    cam.set(cv2.CAP_PROP_POS_FRAMES, total * 0.25) # 25% mark
    ret, frame = cam.read()
    cam.release()
    if not ret: raise ValueError("Video Error")
    return Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

# --- 4. THE PROMPT ENGINEER (THE FIX) ---
def generate_catchy_text(base_desc, style):
    """
    Forces the AI to generate TITLES and CAPTIONS, not sentences.
    """
    if style == "short_title":
        # Force a 3-5 word punchy title
        prompt = f"Write a cool, short 4-word title for this: {base_desc}"
    elif style == "funny":
        # Force a joke or witty comment
        prompt = f"Write a funny, witty caption for this image: {base_desc}"
    elif style == "question":
        # Engagement bait
        prompt = f"Write an engaging question for Instagram about this: {base_desc}"
    else:
        prompt = f"Write a short social media caption: {base_desc}"

    input_ids = tokenizer(prompt, return_tensors="pt").input_ids

    # STRICT PARAMETERS FOR SHORT, CATCHY TEXT
    outputs = writer_model.generate(
        input_ids, 
        max_length=30,       # Keep it short!
        min_length=3,
        do_sample=True,      # Be creative
        temperature=0.85,    # Not too crazy, not too boring
        repetition_penalty=1.5
    )
    
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Clean up artifacts if the AI puts quotes around text
    return result.replace('"', '').replace("'", "").strip()

# --- 5. MAIN ENDPOINT ---
@app.post("/generate")
async def generate(file: UploadFile = File(...), language: str = Form("en")):
    temp_name = f"temp_{uuid.uuid4()}.mp4"
    try:
        logger.info(f"📂 Processing: {file.filename}")

        # 1. Get Image
        if file.content_type.startswith("video"):
            with open(temp_name, "wb") as f: f.write(await file.read())
            image = extract_frame(temp_name)
        else:
            image = load_image(await file.read())

        # 2. Vision Model: See the image
        inputs = processor(image, return_tensors="pt")
        out = vision_model.generate(**inputs, max_new_tokens=50)
        base_desc = processor.decode(out[0], skip_special_tokens=True)
        logger.info(f"👀 AI Saw: {base_desc}")

        # 3. Brain Model: Generate Catchy Hooks (Not Descriptions)
        
        # Hook 1: The One-Liner (Title)
        title = generate_catchy_text(base_desc, "short_title")
        # Ensure it has an emoji
        title = f"{title.title()} 🔥"

        # Hook 2: The Engagement Question
        question = generate_catchy_text(base_desc, "question")
        
        # Hook 3: The Witty/Funny Caption
        witty = generate_catchy_text(base_desc, "funny")

        # 4. Smart Hashtags (Keywords only)
        keywords = [w for w in base_desc.split() if len(w) > 4]
        hashtags = " ".join([f"#{k}" for k in keywords]) + " #Vibes #Trending"

        return {
            "captions": [title, question, witty],
            "hashtags": hashtags
        }

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_name): os.remove(temp_name)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)