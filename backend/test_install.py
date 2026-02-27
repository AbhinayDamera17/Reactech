#!/usr/bin/env python3
"""
Test script to check if dependencies are installed
"""

import sys
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")

try:
    import fastapi
    print(f"✅ FastAPI installed: {fastapi.__version__}")
except ImportError as e:
    print(f"❌ FastAPI not found: {e}")

try:
    import uvicorn
    print(f"✅ Uvicorn installed: {uvicorn.__version__}")
except ImportError as e:
    print(f"❌ Uvicorn not found: {e}")

try:
    import pydantic
    print(f"✅ Pydantic installed: {pydantic.__version__}")
except ImportError as e:
    print(f"❌ Pydantic not found: {e}")

print("\nInstalled packages:")
import subprocess
result = subprocess.run([sys.executable, "-m", "pip", "list"], capture_output=True, text=True)
print(result.stdout)