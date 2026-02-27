"""
LLM Service Integration
Handles AI-powered analysis, educational content generation, and intelligent responses
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional
import aiohttp
from datetime import datetime

logger = logging.getLogger(__name__)

class LLMService:
    """
    Large Language Model service for advanced AI capabilities
    Supports multiple LLM providers: OpenAI, Gemini, Claude, etc.
    """
    
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "gemini")  # Default to Gemini
        self.api_key = self._get_api_key()
        self.base_url = self._get_base_url()
        self.model = self._get_model_name()
        self.session = None
        
        # Chemistry-specific prompts
        self.system_prompts = {
            "reaction_analysis": """You are an expert chemistry professor analyzing chemical reactions. 
            Provide detailed, accurate, and educational explanations suitable for students. 
            Focus on safety, reaction mechanisms, and real-world applications. 
            Always include safety considerations and proper laboratory procedures.""",
            
            "safety_advisor": """You are a chemistry safety expert. Analyze chemical combinations 
            and provide comprehensive safety guidance. Include PPE requirements, hazard assessments, 
            emergency procedures, and risk mitigation strategies. Prioritize student safety above all.""",
            
            "mistake_guidance": """You are a patient chemistry tutor helping students learn from mistakes. 
            Provide constructive feedback, explain why mistakes occurred, suggest corrections, 
            and offer alternative approaches. Be encouraging while maintaining scientific accuracy.""",
            
            "educational_content": """You are creating educational chemistry content. 
            Explain complex concepts in accessible ways, provide real-world examples, 
            and connect theory to practical applications. Adapt explanations to the student's level."""
        }
    
    def _get_api_key(self) -> Optional[str]:
        """Get API key based on provider"""
        key_map = {
            "openai": "OPENAI_API_KEY",
            "gemini": "GEMINI_API_KEY", 
            "claude": "CLAUDE_API_KEY",
            "huggingface": "HUGGINGFACE_API_KEY"
        }
        return os.getenv(key_map.get(self.provider, "GEMINI_API_KEY"))
    
    def _get_base_url(self) -> str:
        """Get base URL for API calls"""
        url_map = {
            "openai": "https://api.openai.com/v1",
            "gemini": "https://generativelanguage.googleapis.com/v1beta",
            "claude": "https://api.anthropic.com/v1",
            "huggingface": "https://api-inference.huggingface.co/models"
        }
        return url_map.get(self.provider, url_map["gemini"])
    
    def _get_model_name(self) -> str:
        """Get model name based on provider"""
        model_map = {
            "openai": "gpt-4",
            "gemini": "gemini-2.5-flash",
            "claude": "claude-3-sonnet-20240229",
            "huggingface": "microsoft/DialoGPT-large"
        }
        return model_map.get(self.provider, model_map["gemini"])
    
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def _make_api_call(self, prompt: str, system_prompt: str, max_tokens: int = 500) -> str:
        """Make API call to LLM provider"""
        
        if not self.api_key:
            logger.warning(f"No API key found for {self.provider}")
            return self._get_fallback_response(prompt)
        
        try:
            session = await self._get_session()
            
            if self.provider == "gemini":
                return await self._call_gemini(session, prompt, system_prompt, max_tokens)
            elif self.provider == "openai":
                return await self._call_openai(session, prompt, system_prompt, max_tokens)
            elif self.provider == "claude":
                return await self._call_claude(session, prompt, system_prompt, max_tokens)
            else:
                return self._get_fallback_response(prompt)
                
        except Exception as e:
            logger.error(f"LLM API call failed: {str(e)}")
            return self._get_fallback_response(prompt)
    
    async def _call_gemini(self, session, prompt: str, system_prompt: str, max_tokens: int) -> str:
        """Call Google Gemini API"""
        
        url = f"{self.base_url}/models/{self.model}:generateContent"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Combine system prompt and user prompt
        full_prompt = f"{system_prompt}\n\nUser Query: {prompt}\n\nResponse:"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": full_prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": max_tokens,
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH", 
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_ONLY_HIGH"
                }
            ]
        }
        
        async with session.post(f"{url}?key={self.api_key}", 
                               headers=headers, 
                               json=payload) as response:
            
            if response.status == 200:
                data = await response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            else:
                error_text = await response.text()
                logger.error(f"Gemini API error: {response.status} - {error_text}")
                return self._get_fallback_response(prompt)
    
    async def _call_openai(self, session, prompt: str, system_prompt: str, max_tokens: int) -> str:
        """Call OpenAI GPT API"""
        
        url = f"{self.base_url}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": 0.7
        }
        
        async with session.post(url, headers=headers, json=payload) as response:
            if response.status == 200:
                data = await response.json()
                return data["choices"][0]["message"]["content"]
            else:
                error_text = await response.text()
                logger.error(f"OpenAI API error: {response.status} - {error_text}")
                return self._get_fallback_response(prompt)
    
    async def _call_claude(self, session, prompt: str, system_prompt: str, max_tokens: int) -> str:
        """Call Anthropic Claude API"""
        
        url = f"{self.base_url}/messages"
        
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": self.model,
            "max_tokens": max_tokens,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        async with session.post(url, headers=headers, json=payload) as response:
            if response.status == 200:
                data = await response.json()
                return data["content"][0]["text"]
            else:
                error_text = await response.text()
                logger.error(f"Claude API error: {response.status} - {error_text}")
                return self._get_fallback_response(prompt)
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Provide fallback response when API is unavailable"""
        
        fallback_responses = {
            "reaction": "This appears to be a chemical reaction. Please ensure proper safety precautions including wearing safety goggles, gloves, and working in a well-ventilated area. For detailed analysis, please check your API configuration.",
            
            "safety": "⚠️ Safety First: Always wear appropriate PPE (safety goggles, gloves, lab coat) when handling chemicals. Ensure proper ventilation and have emergency procedures ready. For specific safety guidance, please consult your instructor or safety data sheets.",
            
            "mistake": "Learning from mistakes is part of chemistry! Review the reaction conditions, check chemical compatibility, and ensure proper safety measures. Consider consulting reference materials or asking your instructor for guidance.",
            
            "educational": "Chemistry involves the study of matter and its interactions. Understanding chemical reactions helps us explain natural processes and develop new materials. For detailed explanations, please ensure your AI service is properly configured."
        }
        
        # Simple keyword matching for fallback
        prompt_lower = prompt.lower()
        if any(word in prompt_lower for word in ["safety", "danger", "hazard"]):
            return fallback_responses["safety"]
        elif any(word in prompt_lower for word in ["mistake", "error", "wrong"]):
            return fallback_responses["mistake"]
        elif any(word in prompt_lower for word in ["learn", "explain", "understand"]):
            return fallback_responses["educational"]
        else:
            return fallback_responses["reaction"]
    
    async def analyze_reaction(self, reaction_data: Dict, safety_assessment: Dict, user_context: Dict) -> Dict:
        """AI-powered reaction analysis"""
        
        prompt = f"""
        Analyze this chemical reaction:
        
        Reactants: {reaction_data.get('reactants', [])}
        Products: {reaction_data.get('products', [])}
        Reaction Type: {reaction_data.get('reaction_type', 'unknown')}
        Safety Level: {safety_assessment.get('safety_level', 'unknown')}
        
        Thermodynamic Data:
        - Enthalpy Change: {reaction_data.get('thermodynamics', {}).get('enthalpy_change', 'N/A')} kJ/mol
        - Spontaneous: {reaction_data.get('thermodynamics', {}).get('spontaneous', 'unknown')}
        
        User Level: {user_context.get('user_level', 'student')}
        
        Please provide:
        1. A clear explanation of what happens in this reaction
        2. Why this reaction occurs (driving forces)
        3. Safety considerations and precautions
        4. Real-world applications or examples
        5. Key learning points for students
        
        Keep the explanation appropriate for the user level and emphasize safety.
        """
        
        response = await self._make_api_call(
            prompt, 
            self.system_prompts["reaction_analysis"],
            max_tokens=600
        )
        
        return {
            "ai_explanation": response,
            "confidence": 0.85,  # Simulated confidence score
            "analysis_type": "comprehensive_reaction_analysis",
            "generated_at": datetime.now().isoformat()
        }
    
    async def generate_safety_advice(self, chemicals: List[str], safety_report: Dict, user_level: str) -> Dict:
        """Generate AI-powered safety recommendations"""
        
        prompt = f"""
        Provide comprehensive safety guidance for handling these chemicals:
        
        Chemicals: {', '.join(chemicals)}
        Current Safety Level: {safety_report.get('level', 'unknown')}
        Identified Hazards: {safety_report.get('warnings', [])}
        Required PPE: {safety_report.get('ppe', [])}
        
        User Level: {user_level}
        
        Please provide:
        1. Specific safety precautions for these chemicals
        2. Proper handling procedures
        3. Emergency response procedures
        4. Storage requirements
        5. Disposal considerations
        6. Signs of exposure or accidents to watch for
        
        Tailor the advice to the user's experience level while maintaining safety standards.
        """
        
        response = await self._make_api_call(
            prompt,
            self.system_prompts["safety_advisor"],
            max_tokens=700
        )
        
        return {
            "safety_advice": response,
            "priority_level": "high" if safety_report.get('level') == 'dangerous' else "medium",
            "generated_at": datetime.now().isoformat()
        }
    
    async def generate_mistake_guidance(self, mistake_type: str, mistake_analysis: Dict, context: Dict) -> Dict:
        """Generate educational guidance for mistakes"""
        
        prompt = f"""
        A student made this mistake in the chemistry lab:
        
        Mistake Type: {mistake_type}
        Mistake Category: {mistake_analysis.get('category', 'unknown')}
        Severity: {mistake_analysis.get('severity', 'unknown')}
        Context: {context}
        
        Explanation of the mistake: {mistake_analysis.get('explanation', 'No explanation available')}
        
        Please provide:
        1. Why this mistake occurred (common causes)
        2. What could have gone wrong (consequences)
        3. How to correct this mistake
        4. How to prevent similar mistakes in the future
        5. Related concepts the student should review
        6. Encouraging words to help the student learn
        
        Be supportive and educational, focusing on learning rather than criticism.
        """
        
        response = await self._make_api_call(
            prompt,
            self.system_prompts["mistake_guidance"],
            max_tokens=600
        )
        
        return {
            "guidance": response,
            "learning_focus": mistake_analysis.get('learning_points', []),
            "encouragement_level": "high",
            "generated_at": datetime.now().isoformat()
        }
    
    async def enhance_prediction(self, prediction: Dict) -> Dict:
        """Enhance ML predictions with AI analysis"""
        
        prompt = f"""
        Analyze this reaction prediction:
        
        Predicted Products: {prediction.get('predicted_products', [])}
        Confidence: {prediction.get('confidence', 0)} 
        Prediction Method: {prediction.get('prediction_method', 'unknown')}
        Uncertainties: {prediction.get('uncertainties', [])}
        
        Please provide:
        1. Assessment of the prediction reliability
        2. Alternative possible outcomes
        3. Factors that could affect the prediction
        4. Experimental considerations for verification
        5. Confidence assessment and reasoning
        
        Focus on scientific accuracy and practical considerations.
        """
        
        response = await self._make_api_call(
            prompt,
            self.system_prompts["reaction_analysis"],
            max_tokens=500
        )
        
        return {
            "enhanced_analysis": response,
            "reliability_assessment": "moderate" if prediction.get('confidence', 0) > 0.7 else "low",
            "generated_at": datetime.now().isoformat()
        }
    
    async def generate_educational_content(self, topic: str, user_level: str, context: Dict = None) -> Dict:
        """Generate educational content on chemistry topics"""
        
        if context is None:
            context = {}
        
        prompt = f"""
        Create educational content about: {topic}
        
        Target Audience: {user_level}
        Additional Context: {context}
        
        Please provide:
        1. Clear explanation of the concept
        2. Key principles and theories involved
        3. Real-world examples and applications
        4. Common misconceptions to avoid
        5. Practice questions or thought exercises
        6. Further reading suggestions
        
        Adapt the complexity and examples to the target audience level.
        """
        
        response = await self._make_api_call(
            prompt,
            self.system_prompts["educational_content"],
            max_tokens=800
        )
        
        return {
            "content": response,
            "topic": topic,
            "target_level": user_level,
            "generated_at": datetime.now().isoformat()
        }
    
    def is_available(self) -> bool:
        """Check if LLM service is available"""
        return self.api_key is not None
    
    def health_check(self) -> Dict:
        """Health check for LLM service"""
        return {
            "status": "healthy" if self.is_available() else "unavailable",
            "provider": self.provider,
            "model": self.model,
            "api_key_configured": self.api_key is not None,
            "last_check": datetime.now().isoformat()
        }
    
    async def close(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
            self.session = None