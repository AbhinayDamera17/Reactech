# Reactech Backend - Python FastAPI Server

Advanced chemistry logic engine with AI-powered analysis for the Reactech virtual chemistry lab.

## Features

- **Chemistry Engine**: Advanced chemical calculations and reaction predictions
- **Safety Validator**: Comprehensive chemical safety assessment system
- **LLM Service**: AI-powered analysis and educational content generation
- **Reaction Analyzer**: Intelligent mistake detection and guidance

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   # Copy the example env file
   cp ../.env.example .env
   
   # Edit .env and add your API keys:
   # LLM_PROVIDER=gemini
   # GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Run the server:**
   ```bash
   python app.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check and service status
- `POST /api/analyze-reaction` - Advanced reaction analysis
- `POST /api/validate-safety` - Comprehensive safety validation
- `POST /api/analyze-mistake` - AI-powered mistake analysis
- `GET /api/chemical-database` - Enhanced chemical database
- `POST /api/predict-reaction` - AI-powered reaction prediction
- `GET /api/health` - Comprehensive health check

## API Documentation

Once the server is running, visit:
- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc

## Development

### Running in Development Mode

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The `--reload` flag enables auto-restart when code changes.

### Testing the API

You can test the API using the interactive docs at `/docs` or with curl:

```bash
# Health check
curl http://localhost:8000/

# Test reaction analysis
curl -X POST "http://localhost:8000/api/analyze-reaction" \
     -H "Content-Type: application/json" \
     -d '{
       "chemicals": {
         "chemical_a": "HCl",
         "chemical_b": "NaOH"
       }
     }'
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# LLM Service Configuration
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Other LLM providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key

# Logging
LOG_LEVEL=INFO
```

## Architecture

```
FastAPI Server (app.py)
├── Chemistry Engine (chemistry_engine.py)
├── LLM Service (llm_service.py)
├── Reaction Analyzer (reaction_analyzer.py)
└── Safety Validator (safety_validator.py)
```

## Troubleshooting

### Common Issues

1. **Port 8000 already in use:**
   ```bash
   uvicorn app:app --reload --port 8001
   ```

2. **Module import errors:**
   Make sure you're in the backend directory and virtual environment is activated.

3. **API key errors:**
   Check your `.env` file and ensure API keys are properly set.

### Logs

The server logs important information. Check the console output for:
- Service initialization status
- API request/response details
- Error messages and stack traces

## Production Deployment

For production deployment, consider:

1. **Use a production WSGI server:**
   ```bash
   pip install gunicorn
   gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Set environment variables:**
   ```bash
   export LOG_LEVEL=WARNING
   export LLM_PROVIDER=gemini
   export GEMINI_API_KEY=your_production_key
   ```

3. **Use a reverse proxy** (nginx, Apache) for SSL and load balancing.

## Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Include docstrings for classes and methods
4. Write tests for new features
5. Update this README for new endpoints or features