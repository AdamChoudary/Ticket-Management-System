"""
AI Service for Ticket Triage and Analysis.

This module provides AI-powered ticket analysis using Google Gemini API
with fallback to heuristic analysis for robustness.

Strategies:
1. Primary: Google Gemini (Official SDK)
2. Secondary: OpenAI GPT-4 (if configured)
3. Fallback: Heuristic Keyword Analysis
"""

import json
import logging
import asyncio
from typing import Optional, Dict, Any

from openai import AsyncOpenAI, APIError, APITimeoutError

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

from ..core.config import settings
from ..schemas import AIAnalysisResult

logger = logging.getLogger(__name__)


class AIService:
    """
    Professional AI Service for Ticket Triage.
    
    Strategies:
    1. Primary: Google Gemini (Official SDK)
    2. Secondary: OpenAI GPT-4
    3. Fallback: Heuristic Keyword Analysis
    """
    
    def __init__(self):
        # OpenAI Setup
        self.openai_key = settings.openai_api_key
        self.openai_client = AsyncOpenAI(api_key=self.openai_key) if self.openai_key else None
        self.openai_model = settings.openai_model
        
        # Gemini Setup (Official SDK)
        self.gemini_key = settings.gemini_api_key
        self.gemini_model = settings.gemini_model
        
        if self.gemini_key and genai:
            logger.info(f"Initializing Gemini Client (google-genai) with model: {self.gemini_model}")
            self.gemini_client = genai.Client(api_key=self.gemini_key)
        else:
            if self.gemini_key and not genai:
                logger.error("Gemini API Key present but google-genai library not installed.")
            self.gemini_client = None

    async def analyze_ticket(self, content: str, api_key: Optional[str] = None) -> AIAnalysisResult:
        """
        Main entry point for ticket analysis.
        Prioritizes Gemini -> OpenAI -> Heuristics.
        """
        # Strategy 1: Google Gemini
        # Check if we have a client (either instance-level or ephemeral via api_key)
        has_gemini = self.gemini_client is not None or (api_key is not None and genai is not None)
        
        if has_gemini:
            try:
                logger.info("Analyzing ticket with Google Gemini...")
                return await self._analyze_with_gemini(content, api_key)
            except Exception as e:
                logger.error(f"Gemini Analysis Failed: {e}. Trying next strategy.")
        
        # Strategy 2: OpenAI
        if self.openai_client:
            try:
                logger.info("Analyzing ticket with OpenAI...")
                return await self._analyze_with_openai(content)
            except Exception as e:
                logger.error(f"OpenAI Analysis Failed: {e}. Falling back to heuristics.")

        # Strategy 3: Heuristics (Fallback)
        logger.warning("Using heuristic fallback (No AI available or all failed).")
        return self._heuristic_analysis(content)

    async def _analyze_with_gemini(self, content: str, api_key: Optional[str] = None) -> AIAnalysisResult:
        """Analyze using Google Gemini SDK with JSON Mode."""
        
        # Determine which client to use
        client = self.gemini_client
        
        # If user provided a key, create an ephemeral client
        if api_key:
            if not genai:
                raise ImportError("Google GenAI library not installed.")
            # Ephemeral client for this request only
            client = genai.Client(api_key=api_key)
            
        if not client:
             raise ValueError("No Gemini Client available")

        prompt = """
        You are an expert Senior Support Engineer and Triage Specialist.
        Analyze this support ticket and output STRICT JSON.
        
        Schema:
        {
            "urgency": "High" | "Medium" | "Low",
            "sentiment_score": int (0-10),
            "category": "Billing" | "Technical" | "Feature" | "Other",
            "draft_response": "Professional response in markdown."
        }
        
        Ticket Content:
        """ + content

        try:
            # Use Synchronous Generate Content (Blocking safe in Celery)
            # We avoid .aio to prevent "Event loop is closed" errors
            response = client.models.generate_content(
                model=self.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            # Parse JSON
            text = response.text
            # Clean strict markdown if present
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            data = json.loads(text)
            
            return AIAnalysisResult(
                urgency=data.get("urgency", "Medium"),
                sentiment_score=data.get("sentiment_score", 5),
                category=data.get("category", "Other"),
                draft_response=data.get("draft_response", "Thank you, we are reviewing your request.")
            )
            
        except Exception as e:
            logger.error(f"Gemini Request/Parse Error: {e}")
            raise e

    async def _analyze_with_openai(self, content: str) -> AIAnalysisResult:
        """Analyze using OpenAI GPT-4 with JSON Mode."""
        # ... (Existing OpenAI logic) ...
        system_prompt = """
        You are an expert Senior Support Engineer and Triage Specialist.
        Your task is to analyze incoming support tickets and output structured JSON.
        
        Schema:
        {
            "urgency": "High" | "Medium" | "Low",
            "sentiment_score": int (0-10, where 0 is hostile/furious, 10 is delightful),
            "category": "Billing" | "Technical" | "Feature" | "Other",
            "draft_response": "Professional, empathetic, and concise response in markdown format."
        }
        """
        
        response = await self.openai_client.chat.completions.create(
            model=self.openai_model,
            messages=[
                {"role": "system", "content": system_prompt.strip()},
                {"role": "user", "content": content}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            timeout=15.0
        )
        
        raw_content = response.choices[0].message.content
        data = json.loads(raw_content)
        
        return AIAnalysisResult(
            urgency=data.get("urgency", "Medium"),
            sentiment_score=data.get("sentiment_score", 5),
            category=data.get("category", "Other"),
            draft_response=data.get("draft_response", "Thank you for your message. We are reviewing it.")
        )

    def _heuristic_analysis(self, content: str) -> AIAnalysisResult:
        """
        Robust fallback analysis based on keyword heuristics.
        Used when AI is down or unconfigured.
        """
        content_lower = content.lower()
        
        # Urgency Heuristics
        critical_keywords = ["hacked", "breach", "data loss", "deleted", "outage", "down", "emergency"]
        high_keywords = ["urgent", "asap", "locked", "payment failed", "charged", "billing"]
        
        if any(w in content_lower for w in critical_keywords):
            urgency = "High"  # Mapped to High as Critical is not in Enum
            sentiment_score = 2
        elif any(w in content_lower for w in high_keywords):
            urgency = "High"
            sentiment_score = 4
        elif "bug" in content_lower or "error" in content_lower:
            urgency = "Medium"
            sentiment_score = 5
        else:
            urgency = "Low"
            sentiment_score = 7
            
        # Category Heuristics
        if any(w in content_lower for w in ["invoice", "card", "subscription", "price", "cost", "refund"]):
            category = "Billing"
        elif any(w in content_lower for w in ["api", "500", "404", "bug", "crash", "login", "password"]):
            category = "Technical"
        elif any(w in content_lower for w in ["add", "feature", "suggest", "improve", "would be nice"]):
            category = "Feature"
        else:
            category = "Other"
            
        # Draft Response Generation
        response_templates = {
            "Billing": "We have received your billing inquiry. Our finance team will review your transaction details securely.",
            "Technical": "We are investigating the technical issue you reported. Please provide any error codes or screenshots if immediately available.",
            "Feature": "Thank you for your product suggestion! We have logged this for our product team to review.",
            "Other": "Thank you for contacting us. We have received your request and will get back to you shortly."
        }
        
        base_response = response_templates.get(category, response_templates["Other"])
        full_response = f"Hello,\n\n{base_response}\n\nPriority: {urgency}\n\nBest regards,\nAI Support Hub Team"
        
        return AIAnalysisResult(
            urgency=urgency,
            sentiment_score=sentiment_score,
            category=category,
            draft_response=full_response
        )

# Singleton instance
ai_service = AIService()
