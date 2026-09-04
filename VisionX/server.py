#!/usr/bin/env python3
"""
DELIVIA - On-Road Food Delivery & Route Intelligence Platform Backend Server
SIH Problem Statement ID: 26205 | Team VisionX
Serves static frontend assets and exposes REST API & AI/ML endpoints.
"""

import json
import mimetypes
import os
import sys
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# Set working directory to project root
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

# Ensure standard MIME types on all OS platforms
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('application/json', '.json')

# In-Memory DB Store for Prototype
DB = {
    "orders": [
        {
            "id": "DLV-9842",
            "travelerName": "Yumna Abidi (VisionX)",
            "travelerPhone": "+91 98765-12345",
            "vehiclePlate": "UP-16-BX-4090",
            "restaurantId": "rest_shiva_dhaba",
            "handoffId": "hp_yamuna_2",
            "items": [
                {"id": "m1", "name": "Special Paneer Butter Masala + 2 Tandoori Roti combo", "price": 280, "quantity": 1},
                {"id": "m4", "name": "Chilled Punjabi Sweet Lassi in Earthen Matka", "price": 90, "quantity": 2}
            ],
            "totalAmount": 460,
            "status": "PLACED",
            "prepTimeMinutes": 14,
            "runnerId": "runner_1",
            "otp": "7492",
            "created_at": "2026-09-01T22:00:00Z"
        }
    ]
}

class DeliviaRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # API Routes
        if path == '/api/routes':
            self.send_json(self.get_routes_data())
            return
        elif path == '/api/handoff-points':
            self.send_json(self.get_handoff_points_data())
            return
        elif path == '/api/restaurants':
            self.send_json(self.get_restaurants_data())
            return
        elif path == '/api/orders':
            self.send_json({"orders": DB["orders"]})
            return
        elif path.startswith('/api/orders/'):
            order_id = path.rstrip('/').split('/')[-1]
            order = next((o for o in DB["orders"] if o["id"] == order_id), None)
            if order:
                self.send_json(order)
            else:
                self.send_error(404, "Order not found")
            return
        elif path == '/api/ml/forecast':
            self.send_json(self.compute_demand_forecast())
            return
        elif path == '/api/health':
            self.send_json({"status": "ONLINE", "platform": "DELIVIA v1.0", "sih_ps": 26205})
            return

        # Static files fallback
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception:
            body = {}

        if path == '/api/orders':
            new_id = f"DLV-{len(DB['orders']) + 1000}"
            order = {
                "id": new_id,
                "travelerName": body.get("travelerName", "Highway Traveler"),
                "travelerPhone": body.get("travelerPhone", "+91 98000-00000"),
                "vehiclePlate": body.get("vehiclePlate", "DL-01-AB-1234"),
                "restaurantId": body.get("restaurantId", "rest_shiva_dhaba"),
                "handoffId": body.get("handoffId", "hp_yamuna_2"),
                "items": body.get("items", []),
                "totalAmount": body.get("totalAmount", 350),
                "status": "PLACED",
                "prepTimeMinutes": body.get("prepTimeMinutes", 12),
                "runnerId": body.get("runnerId", "runner_1"),
                "otp": body.get("otp", "7492"),
                "created_at": "2026-09-01T23:00:00Z"
            }
            DB["orders"].insert(0, order)
            self.send_json(order, status=201)
            return
        elif path == '/api/ml/eta-refine':
            distance = float(body.get("distanceKm", 20))
            speed = float(body.get("currentSpeedKmph", 80))
            weather = body.get("weather", "CLEAR")
            tolls = int(body.get("tollCountEnRoute", 1))

            # Heuristic regression model
            raw_eta = (distance / max(30, speed)) * 60
            weather_mult = 1.2 if weather == "RAIN" else 1.0
            toll_delay = tolls * 2.2
            layby_decel = 1.2
            refined_eta = (raw_eta * 1.05 * weather_mult) + toll_delay + layby_decel

            self.send_json({
                "distanceKm": distance,
                "rawEtaMinutes": round(raw_eta, 1),
                "refinedEtaMinutes": round(refined_eta, 1),
                "confidenceScore": 0.94,
                "factors": {
                    "tollDelay": toll_delay,
                    "weatherMultiplier": weather_mult,
                    "laybyDecelOverhead": layby_decel
                }
            })
            return

        self.send_error(404, "Endpoint not found")

    def do_PATCH(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith('/api/orders/') and path.endswith('/status'):
            parts = path.split('/')
            order_id = parts[3]
            content_length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))
            new_status = body.get('status', 'PLACED')

            order = next((o for o in DB["orders"] if o["id"] == order_id), None)
            if order:
                order["status"] = new_status
                self.send_json(order)
            else:
                self.send_error(404, "Order not found")
            return

        self.send_error(404, "Endpoint not found")

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def send_json(self, data, status=200):
        response_bytes = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def get_routes_data(self):
        return {
            "routes": [
                {
                    "id": "yamuna_exp",
                    "name": "Yamuna Expressway (Delhi to Agra)",
                    "highway": "NH-19 / Taj Expressway",
                    "totalDistanceKm": 165
                },
                {
                    "id": "mumbai_pune",
                    "name": "Mumbai–Pune Expressway",
                    "highway": "Yashwantrao Chavan Expressway",
                    "totalDistanceKm": 94
                },
                {
                    "id": "blr_mysuru",
                    "name": "Bengaluru–Mysuru Expressway",
                    "highway": "NH-275 Expressway",
                    "totalDistanceKm": 118
                }
            ]
        }

    def get_handoff_points_data(self):
        return {
            "handoffPoints": [
                {"id": "hp_yamuna_1", "name": "HP Safe Lay-by Bay #2 (Jewar Cut, Km 42)", "safeSpeedLimit": 5},
                {"id": "hp_yamuna_2", "name": "IndianOil Highway Oasis (Tappal Interchange, Km 70)", "safeSpeedLimit": 5},
                {"id": "hp_yamuna_3", "name": "Mathura Bypass Safe Pull-Over (Km 124)", "safeSpeedLimit": 5}
            ]
        }

    def get_restaurants_data(self):
        return {
            "restaurants": [
                {"id": "rest_shiva_dhaba", "name": "Shiva Tourist Dhaba", "rating": 4.8, "avgPrepMin": 14},
                {"id": "rest_highway_king", "name": "Grand Highway King Plaza", "rating": 4.6, "avgPrepMin": 9},
                {"id": "rest_mathura_pedha_hub", "name": "Brijwasi Sweets Highway", "rating": 4.9, "avgPrepMin": 6}
            ]
        }

    def compute_demand_forecast(self):
        return {
            "peakHour": "13:00",
            "forecastTotalDailyOrders": 348,
            "avgRunnerUtilization": "82%",
            "busiestHandoffPoint": "IndianOil Highway Oasis (Tappal Interchange)"
        }

def run_server(port=3000):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, DeliviaRequestHandler)
    print("============================================================")
    print(f"[DELIVIA] Platform Server running at http://localhost:{port}")
    print(f"   * Traveler App:   http://localhost:{port}")
    print(f"   * Restaurant KDS: http://localhost:{port}")
    print(f"   * Runner App:     http://localhost:{port}")
    print(f"   * Admin Command:  http://localhost:{port}")
    print(f"   * 3-in-1 Sync:    http://localhost:{port}")
    print("============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[DELIVIA] Shutting down server.")
        httpd.server_close()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    run_server(port)
