import os
import uuid
from typing import List, Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import aiofiles
from pathlib import Path
import json

# Configuration
UPLOAD_DIR = Path("uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
ALLOWED_IMAGE_TYPES = os.getenv("ALLOWED_IMAGE_TYPES", "image/jpeg,image/jpg,image/png,image/gif").split(",")
ALLOWED_DOCUMENT_TYPES = os.getenv("ALLOWED_DOCUMENT_TYPES", "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document").split(",")

# Create upload directories
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "unit_images").mkdir(exist_ok=True)
(UPLOAD_DIR / "documents").mkdir(exist_ok=True)
(UPLOAD_DIR / "maintenance_images").mkdir(exist_ok=True)

class FileUploadService:
    def __init__(self):
        self.max_file_size = MAX_FILE_SIZE
        self.allowed_image_types = ALLOWED_IMAGE_TYPES
        self.allowed_document_types = ALLOWED_DOCUMENT_TYPES
    
    async def validate_file(self, file: UploadFile, file_type: str = "image") -> bool:
        """Validate uploaded file."""
        # Check file size
        if file.size and file.size > self.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds {self.max_file_size} bytes"
            )
        
        # Check file type
        if file_type == "image":
            if file.content_type not in self.allowed_image_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File type {file.content_type} not allowed for images"
                )
        elif file_type == "document":
            if file.content_type not in self.allowed_document_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File type {file.content_type} not allowed for documents"
                )
        
        return True
    
    async def save_image(self, file: UploadFile, subfolder: str = "unit_images") -> str:
        """Save uploaded image and return file path."""
        await self.validate_file(file, "image")
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / subfolder / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Optimize image if it's an image file
        if file.content_type.startswith("image/"):
            await self.optimize_image(file_path)
        
        return str(file_path)
    
    async def save_document(self, file: UploadFile, subfolder: str = "documents") -> str:
        """Save uploaded document and return file path."""
        await self.validate_file(file, "document")
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / subfolder / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return str(file_path)
    
    async def optimize_image(self, file_path: Path, max_width: int = 1920, max_height: int = 1080, quality: int = 85):
        """Optimize image file."""
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                # Resize if too large
                if img.width > max_width or img.height > max_height:
                    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(file_path, "JPEG", quality=quality, optimize=True)
        except Exception as e:
            print(f"Error optimizing image {file_path}: {e}")
    
    async def save_multiple_images(self, files: List[UploadFile], subfolder: str = "unit_images") -> List[str]:
        """Save multiple images and return list of file paths."""
        file_paths = []
        for file in files:
            file_path = await self.save_image(file, subfolder)
            file_paths.append(file_path)
        return file_paths
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file."""
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
                return True
            return False
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """Get URL for accessing a file."""
        return f"/uploads/{Path(file_path).name}"
    
    def update_unit_images(self, unit_id: int, new_images: List[str]) -> str:
        """Update unit images JSON string."""
        images_data = {
            "unit_id": unit_id,
            "images": new_images,
            "updated_at": str(uuid.uuid4())
        }
        return json.dumps(images_data)
    
    def parse_unit_images(self, images_json: str) -> List[str]:
        """Parse unit images JSON string."""
        try:
            data = json.loads(images_json)
            return data.get("images", [])
        except (json.JSONDecodeError, TypeError):
            return []

file_upload_service = FileUploadService()

