"""
Reactech Backend - Python FastAPI Server
Provides advanced chemistry logic engine and LLM integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
import json
import logging

# Import our custom modules
from chemistry_engine_simple import ChemistryEngine
from llm_service_simple import LLMService
from reaction_analyzer_simple import ReactionAnalyzer
from safety_validator import SafetyValidator

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Reactech Chemistry API",
    description="Advanced chemistry logic engine with AI-powered analysis",
    version="2.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
chemistry_engine = ChemistryEngine()
llm_service = LLMService()
reaction_analyzer = ReactionAnalyzer()
safety_validator = SafetyValidator()

# Pydantic models for request/response
class ChemicalPair(BaseModel):
    chemical_a: str
    chemical_b: str
    conditions: Optional[Dict] = {}

class ReactionRequest(BaseModel):
    chemicals: ChemicalPair
    user_context: Optional[Dict] = {}

class ReactionResponse(BaseModel):
    success: bool
    reaction_data: Dict
    ai_analysis: Dict
    safety_assessment: Dict
    educational_content: Dict

class MistakeAnalysisRequest(BaseModel):
    mistake_type: str
    chemicals: List[str]
    context: Dict

class SafetyCheckRequest(BaseModel):
    chemicals: List[str]
    reaction_conditions: Dict
    user_level: str = "student"  # student, teacher, advanced

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Reactech Chemistry API is running",
        "version": "2.0.0",
        "services": {
            "chemistry_engine": "active",
            "llm_service": "active" if llm_service.is_available() else "offline",
            "reaction_analyzer": "active",
            "safety_validator": "active"
        }
    }

@app.post("/api/analyze-reaction", response_model=ReactionResponse)
async def analyze_reaction(request: ReactionRequest):
    """
    Advanced reaction analysis using Python chemistry engine
    """
    try:
        logger.info(f"Analyzing reaction: {request.chemicals.chemical_a} + {request.chemicals.chemical_b}")
        
        # 1. Chemistry Engine Analysis
        reaction_data = chemistry_engine.analyze_reaction(
            request.chemicals.chemical_a,
            request.chemicals.chemical_b,
            request.chemicals.conditions
        )
        
        # 2. Safety Assessment
        safety_assessment = safety_validator.assess_safety(
            [request.chemicals.chemical_a, request.chemicals.chemical_b],
            reaction_data.get("reaction_type", "unknown"),
            request.chemicals.conditions
        )
        
        # 3. AI-Powered Analysis
        ai_analysis = await llm_service.analyze_reaction(
            reaction_data,
            safety_assessment,
            request.user_context
        )
        
        # 4. Educational Content Generation
        educational_content = chemistry_engine.generate_educational_content(
            reaction_data,
            request.user_context.get("user_level", "student")
        )
        
        return ReactionResponse(
            success=True,
            reaction_data=reaction_data,
            ai_analysis=ai_analysis,
            safety_assessment=safety_assessment,
            educational_content=educational_content
        )
        
    except Exception as e:
        logger.error(f"Error analyzing reaction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/validate-safety")
async def validate_safety(request: SafetyCheckRequest):
    """
    Comprehensive safety validation using Python logic
    """
    try:
        # Advanced safety analysis
        safety_report = safety_validator.comprehensive_check(
            request.chemicals,
            request.reaction_conditions,
            request.user_level
        )
        
        # AI-enhanced safety recommendations
        ai_recommendations = await llm_service.generate_safety_advice(
            request.chemicals,
            safety_report,
            request.user_level
        )
        
        return {
            "safety_level": safety_report["level"],
            "warnings": safety_report["warnings"],
            "required_ppe": safety_report["ppe"],
            "precautions": safety_report["precautions"],
            "ai_recommendations": ai_recommendations,
            "emergency_procedures": safety_report.get("emergency_procedures", [])
        }
        
    except Exception as e:
        logger.error(f"Safety validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Safety check failed: {str(e)}")

@app.post("/api/analyze-mistake")
async def analyze_mistake(request: MistakeAnalysisRequest):
    """
    AI-powered mistake analysis and educational guidance
    """
    try:
        # Analyze the mistake using Python logic
        mistake_analysis = reaction_analyzer.analyze_mistake(
            request.mistake_type,
            request.chemicals,
            request.context
        )
        
        # Generate AI-powered educational response
        ai_guidance = await llm_service.generate_mistake_guidance(
            request.mistake_type,
            mistake_analysis,
            request.context
        )
        
        return {
            "mistake_category": mistake_analysis["category"],
            "severity": mistake_analysis["severity"],
            "explanation": mistake_analysis["explanation"],
            "ai_guidance": ai_guidance,
            "suggested_alternatives": mistake_analysis["alternatives"],
            "learning_objectives": mistake_analysis["learning_points"]
        }
        
    except Exception as e:
        logger.error(f"Mistake analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mistake analysis failed: {str(e)}")

@app.get("/api/chemical-database")
async def get_chemical_database():
    """
    Enhanced chemical database with Python-computed properties
    """
    try:
        database = chemistry_engine.get_enhanced_database()
        return {
            "chemicals": database["chemicals"],
            "reactions": database["reactions"],
            "properties": database["computed_properties"],
            "metadata": {
                "total_chemicals": len(database["chemicals"]),
                "total_reactions": len(database["reactions"]),
                "last_updated": database["last_updated"]
            }
        }
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database access failed: {str(e)}")

@app.post("/api/predict-reaction")
async def predict_reaction(request: ChemicalPair):
    """
    AI-powered reaction prediction for unknown combinations
    """
    try:
        # Use machine learning model to predict reaction
        prediction = chemistry_engine.predict_reaction_outcome(
            request.chemical_a,
            request.chemical_b,
            request.conditions
        )
        
        # Enhance with LLM analysis
        ai_prediction = await llm_service.enhance_prediction(prediction)
        
        return {
            "predicted_reaction": prediction,
            "confidence": prediction["confidence"],
            "ai_analysis": ai_prediction,
            "similar_reactions": prediction["similar_reactions"],
            "uncertainty_factors": prediction["uncertainties"]
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    """
    Comprehensive health check for all services
    """
    return {
        "status": "healthy",
        "services": {
            "chemistry_engine": chemistry_engine.health_check(),
            "llm_service": llm_service.health_check(),
            "reaction_analyzer": reaction_analyzer.health_check(),
            "safety_validator": safety_validator.health_check()
        },
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)