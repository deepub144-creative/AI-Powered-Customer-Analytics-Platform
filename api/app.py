import uvicorn
import gradio as gr
from main import app  # your existing FastAPI app with all routes

# Minimal placeholder UI — required by the Gradio SDK, but your real
# endpoints (churn, segmentation, forecast, etc.) still live on `app`
def _placeholder(x):
    return "API is running. Use the /docs endpoint for API routes."

demo = gr.Interface(fn=_placeholder, inputs="text", outputs="text",
                     title="Customer Intelligence API")

# Mount the Gradio UI onto your FastAPI app at /ui, keep all your
# existing routes exactly where they are
app = gr.mount_gradio_app(app, demo, path="/ui")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)