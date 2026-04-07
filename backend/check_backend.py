import urllib.request

try:
    with urllib.request.urlopen('http://127.0.0.1:8001/api/v1/health', timeout=5) as resp:
        print(resp.status)
        print(resp.read().decode('utf-8'))
except Exception as e:
    print('ERROR', type(e).__name__, e)
