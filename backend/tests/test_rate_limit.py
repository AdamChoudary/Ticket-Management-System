#!/usr/bin/env python3
"""
Rate Limit Test Script

Sends 11 rapid ticket creation requests to verify that the 10/minute
rate limit is properly enforced (should see HTTP 429 on 11th request).
"""

import requests
import time

API_URL = "http://localhost:8000/api/tickets"

def test_rate_limit():
    print("🔒 Testing Rate Limiter (10 requests/min limit)")
    print("-" * 60)
    
    success_count = 0
    rate_limited_count = 0
    
    for i in range(1, 12):  # Send 11 requests
        payload = {"request_content": f"Test ticket #{i} - Rate limit verification"}
        
        try:
            response = requests.post(API_URL, json=payload, timeout=5)
            
            if response.status_code == 201:
                success_count += 1
                print(f"✅ Request {i}: SUCCESS (201)")
            elif response.status_code == 429:
                rate_limited_count += 1
                print(f"🚫 Request {i}: RATE LIMITED (429)")
                print(f"   Headers: {dict(response.headers)}")
            else:
                print(f"⚠️  Request {i}: Unexpected {response.status_code}")
        except Exception as e:
            print(f"❌ Request {i}: Error - {e}")
        
        time.sleep(0.1)  # Small delay to ensure sequential processing
    
    print("-" * 60)
    print(f"📊 Results: {success_count} successful, {rate_limited_count} rate-limited")
    
    if rate_limited_count > 0:
        print("✅ Rate Limiting is ACTIVE and working correctly!")
        return True
    else:
        print("⚠️  Rate Limiting may not be enforced (no 429 errors)")
        return False

if __name__ == "__main__":
    test_rate_limit()
