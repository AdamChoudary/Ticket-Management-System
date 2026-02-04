
import json
import logging
import asyncio
from typing import Optional, Dict, Any

from openai import AsyncOpenAI, APIError, APITimeoutError
from ..config import settings
from ..schemas import AIAnalysisResult

logger = logging.getLogger(__name__)

class AIService:
    """
    Professional AI Service for Ticket Triage.
    
    Strategies:
    1. Primary: OpenAI GPT-4 (Critical/High accuracy)
    2. Fallback: Heuristic Keyword Analysis (Zero latency, reasonable accuracy)
    """
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.client = AsyncOpenAI(api_key=self.api_key) if self.api_key else None
        self.model = settings.openai_model

    async def analyze_ticket(self, content: str) -> AIAnalysisResult:
        """
        Main entry point for ticket analysis.
        
        Args:
            content: Ticket content string
            
        Returns:
            AIAnalysisResult: Structured analysis
        """
        # Strategy Check
        if not self.api_key:
            logger.warning("No OpenAI API Key found. Using heuristic fallback.")
            return self._heuristic_analysis(content)

        try:
            return await self._analyze_with_llm(content)
        except Exception as e:
            logger.error(f"AI Analysis Failed: {e}. Falling back to heuristics.")
            return self._heuristic_analysis(content)

    async def _analyze_with_llm(self, content: str) -> AIAnalysisResult:
        """Analyze using OpenAI GPT-4 with JSON Mode."""
        
        system_prompt = """
        You are an expert Senior Support Engineer and Triage Specialist.
        Your task is to analyze incoming support tickets and output structured JSON.
        
        Schema:
        {
            "urgency": "Critical" | "High" | "Medium" | "Low",
            "sentiment_score": int (0-10, where 0 is hostile/furious, 10 is delightful),
            "category": "Billing" | "Technical" | "Feature" | "Other",
            "draft_response": "Professional, empathetic, and concise response in markdown format."
        }
        
        Rules:
        1. "Critical": security issues, data loss, total outage.
        2. "High": blocking issues, payment failures.
        3. "Medium": bugs, UX issues, non-blocking.
        4. "Low": typos, minor questions, feature requests.
        5. Draft Response: Be helpful. Do not use placeholders. Sign off as 'AI Support Hub Team'.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt.strip()},
                    {"role": "user", "content": content}
                ],
                response_format={"type": "json_object"},
                temperature=0.3, # Low temperature for consistent categorization
                timeout=15.0 # Strict timeout
            )
            
            raw_content = response.choices[0].message.content
            data = json.loads(raw_content)
            
            return AIAnalysisResult(
                urgency=data.get("urgency", "Medium"),
                sentiment_score=data.get("sentiment_score", 5),
                category=data.get("category", "Other"),
                draft_response=data.get("draft_response", "Thank you for your message. We are reviewing it.")
            )
            
        except Exception as e:
            raise e # Reraise to trigger fallback

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
            urgency = "Critical"
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
