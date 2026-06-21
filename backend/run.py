import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"Launching TRINETRA Command Engine on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
