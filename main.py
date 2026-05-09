"""
Genspark OpenAI Proxy API - Development Server

For local development, run:
    python main.py

For production deployment (Vercel), the api/index.py is used directly.
"""

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.index:app",
        host="0.0.0.0",
        port=8009,
        reload=True
    )
