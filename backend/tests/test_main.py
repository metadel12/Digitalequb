from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == "DigiEqub"
    assert payload["status"] == "healthy"
    assert payload["docs"] == "/api/docs"

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "healthy"
    assert payload["service"] == "DigiEqub"

def test_platform_metadata():
    response = client.get("/api/v1/platform")
    assert response.status_code == 200
    payload = response.json()
    assert payload["project"] == "DigiEqub"
    assert "groups" in payload["modules"]
