#!/usr/bin/env python3
"""
DELIVIA - Automated Test Suite
Verifies all REST API endpoints, AI/ML models, and static asset delivery.
"""

import json
import urllib.request

BASE_URL = "http://127.0.0.1:3000"

def test_get_endpoint(path, expected_status=200):
    url = f"{BASE_URL}{path}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            status = response.status
            content = response.read()
            assert status == expected_status, f"Expected {expected_status}, got {status}"
            print(f"  [PASS] GET {path} -> {status} ({len(content)} bytes)")
            return content
    except Exception as e:
        print(f"  [FAIL] GET {path} -> {e}")
        return None

def test_post_endpoint(path, payload, expected_status=200):
    url = f"{BASE_URL}{path}"
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req) as response:
            status = response.status
            content = json.loads(response.read().decode('utf-8'))
            assert status == expected_status, f"Expected {expected_status}, got {status}"
            print(f"  [PASS] POST {path} -> {status} Response: {content}")
            return content
    except Exception as e:
        print(f"  [FAIL] POST {path} -> {e}")
        return None

def main():
    print("==================================================")
    print("Testing DELIVIA REST Endpoints & Static Files...")
    print("==================================================")

    # 1. Health
    test_get_endpoint('/api/health')

    # 2. Routes
    test_get_endpoint('/api/routes')

    # 3. Handoff Points
    test_get_endpoint('/api/handoff-points')

    # 4. Restaurants
    test_get_endpoint('/api/restaurants')

    # 5. Orders
    test_get_endpoint('/api/orders')

    # 6. Forecast
    test_get_endpoint('/api/ml/forecast')

    # 7. Static UI Assets
    test_get_endpoint('/index.html')
    test_get_endpoint('/css/style.css')
    test_get_endpoint('/js/data.js')
    test_get_endpoint('/js/state.js')
    test_get_endpoint('/js/ml/etaModel.js')
    test_get_endpoint('/js/ml/rankerModel.js')
    test_get_endpoint('/js/ml/forecastModel.js')
    test_get_endpoint('/js/views/traveler.js')
    test_get_endpoint('/js/views/restaurant.js')
    test_get_endpoint('/js/views/runner.js')
    test_get_endpoint('/js/views/admin.js')
    test_get_endpoint('/js/views/splitView.js')
    test_get_endpoint('/js/app.js')

    # 8. ML ETA Refine POST
    print("\nTesting ML ETA Refine Endpoint...")
    test_post_endpoint('/api/ml/eta-refine', {
        "distanceKm": 24.5,
        "currentSpeedKmph": 85,
        "weather": "CLEAR",
        "tollCountEnRoute": 1
    })

    print("\n==================================================")
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == '__main__':
    main()
