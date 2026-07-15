from fastapi import FastAPI
from fastapi.responses import HTMLResponse, PlainTextResponse  # ✅ PlainTextResponse ን ያክሉ
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DigiEqub API", version="1.0.0")

# CORS ማዋቀር
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================================
# 🆕 የGoogle ማረጋገጫ ፋይል መስመር (GOOGLE VERIFICATION)
# ================================================
@app.get("/google466a7f19e0c88aa9.html", response_class=PlainTextResponse)
async def google_verification():
    # ⚠️ ይህ በትክክል ይህ መሆን አለበት - ከGoogle ያወረዱትን ፋይል ይዘት ይቅዱ
    return "google-site-verification: google466a7f19e0c88aa9.html"

# ============ የቤት ገጽ (Homepage) ============
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html lang="am">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DigiEqub - ደህንነቱ የተጠበቀ የOTP እና የኢሜል አገልግሎት</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f5f7fa;
                padding: 20px;
            }
            .container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                padding: 50px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #1a73e8;
                border-bottom: 3px solid #1a73e8;
                padding-bottom: 15px;
                margin-bottom: 20px;
                font-size: 2.5em;
            }
            h2 {
                color: #1a73e8;
                margin-top: 30px;
                margin-bottom: 15px;
            }
            .subtitle {
                font-size: 1.2em;
                color: #555;
                margin-bottom: 25px;
            }
            ul {
                padding-left: 25px;
                margin: 15px 0;
            }
            li {
                margin: 10px 0;
            }
            .links {
                margin: 30px 0;
                padding: 20px;
                background: #f0f4fa;
                border-radius: 8px;
            }
            .links a {
                color: #1a73e8;
                text-decoration: none;
                font-weight: 500;
                margin-right: 20px;
                padding: 8px 16px;
                background: white;
                border-radius: 6px;
                border: 1px solid #ddd;
                transition: all 0.3s;
            }
            .links a:hover {
                background: #1a73e8;
                color: white;
                border-color: #1a73e8;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #eee;
                color: #666;
                font-size: 14px;
                text-align: center;
            }
            .badge {
                display: inline-block;
                background: #e8f5e9;
                color: #2e7d32;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 DigiEqub</h1>
            <p class="subtitle">ደህንነቱ የተጠበቀ የOTP እና የኢሜል ማሳወቂያ አገልግሎት</p>
            
            <p><span class="badge">✅ በGoogle የተረጋገጠ</span></p>
            
            <h2>📌 ስለ መተግበሪያው</h2>
            <p><strong>DigiEqub</strong> ለመተግበሪያዎች ደህንነቱ የተጠበቀ የኢሜል ማረጋገጫ እና ማሳወቂያ አገልግሎት ይሰጣል።</p>
            
            <h3>🔑 ዋና ዋና ባህሪያት</h3>
            <ul>
                <li><strong>OTP ማረጋገጫ፦</strong> በኢሜል አንድ ጊዜ ፓስዎርዶችን (OTP) በደህና ይላኩ</li>
                <li><strong>የኢሜል ማሳወቂያዎች፦</strong> ለተጠቃሚዎችዎ ራስ-ሰር ማሳወቂያዎችን ይላኩ</li>
                <li><strong>የGoogle ማረጋገጫ፦</strong> በGoogle አካውንት ቀላል እና ደህንነቱ የተጠበቀ መግቢያ</li>
                <li><strong>የAPI አገልግሎት፦</strong> ለገንቢዎች ሙሉ የAPI ድጋፍ</li>
            </ul>
            
            <h3>👥 ለማን ነው?</h3>
            <ul>
                <li>የሞባይል እና የድር መተግበሪያዎች ገንቢዎች</li>
                <li>የተጠቃሚ ማረጋገጫ የሚፈልጉ ስርዓቶች</li>
                <li>ራስ-ሰር የኢሜል ማሳወቂያ የሚፈልጉ ንግዶች</li>
            </ul>
            
            <div class="links">
                <h3>🔗 አስፈላጊ አገናኞች</h3>
                <p>
                    <a href="/privacy">🔒 የግላዊነት ፖሊሲ</a>
                    <a href="/terms">📋 የአገልግሎት ውል</a>
                    <a href="/api/docs">📚 የAPI ሰነዶች</a>
                </p>
            </div>
            
            <div class="footer">
                <p>© 2026 DigiEqub. All rights reserved.</p>
                <p style="margin-top: 10px; font-size: 12px; color: #999;">
                    Made with ❤️ for secure email verification
                </p>
            </div>
        </div>
    </body>
    </html>
    """

# ============ የግላዊነት ፖሊሲ ============
@app.get("/privacy", response_class=HTMLResponse)
async def privacy_policy():
    return """
    <!DOCTYPE html>
    <html lang="am">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>የግላዊነት ፖሊሲ - DigiEqub</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: #f9f9f9;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #1a73e8;
                border-bottom: 3px solid #1a73e8;
                padding-bottom: 10px;
            }
            h2 {
                color: #1a73e8;
                margin-top: 25px;
            }
            ul { padding-left: 25px; }
            li { margin: 8px 0; }
            .date {
                color: #666;
                font-style: italic;
                margin-bottom: 20px;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 14px;
                color: #666;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔒 የግላዊነት ፖሊሲ</h1>
            <p class="date">የመጨረሻ ማሻሻያ፦ ጁላይ 2026</p>
            
            <p>DigiEqub የእርስዎን የግላዊነት መብቶች በከፍተኛ ጥንቃቄ ይጠብቃል። ይህ ፖሊሲ ምን አይነት መረጃ እንደምንሰበስብ እና እንዴት እንደምንጠቀመው ያብራራል።</p>
            
            <h2>📧 የምንሰበስበው መረጃ</h2>
            <ul>
                <li><strong>የኢሜል አድራሻ፦</strong> የOTP ኮዶችን እና ማሳወቂያዎችን ለመላክ</li>
                <li><strong>የGoogle አካውንት መረጃ፦</strong> በGoogle OAuth በኩል ለማረጋገጥ</li>
                <li><strong>የአገልግሎት አጠቃቀም መረጃ፦</strong> አገልግሎታችንን ለማሻሻል</li>
            </ul>
            
            <h2>🔧 መረጃውን እንዴት እንጠቀማለን</h2>
            <ul>
                <li>የተጠቃሚ ማረጋገጫ እና ማጣራት</li>
                <li>ለመለያ ማረጋገጫ OTP ኮዶች መላክ</li>
                <li>የመተግበሪያ ማሳወቂያዎች መላክ</li>
            </ul>
            
            <h2>🔐 የመረጃ ደህንነት</h2>
            <ul>
                <li>መረጃዎን በደህንነት እና በኢንክሪፕሽን እናከማቻለን</li>
                <li>መረጃዎን ከሶስተኛ ወገኖች ጋር አንጋራም ወይም አንሸጥም</li>
            </ul>
            
            <h2>📱 የእርስዎ መብቶች</h2>
            <ul>
                <li>የእርስዎን መረጃ የማግኘት መብት</li>
                <li>የእርስዎን መረጃ የማረም መብት</li>
                <li>የእርስዎን መረጃ የመሰረዝ መብት</li>
            </ul>
            
            <h2>📬 እኛን ያግኙ</h2>
            <p><strong>ኢሜይል፦</strong> your-email@gmail.com</p>
            
            <div class="footer">
                <p>© 2026 DigiEqub. All rights reserved.</p>
                <p><a href="/">🏠 ወደ ቤት ገጽ</a></p>
            </div>
        </div>
    </body>
    </html>
    """

# ============ የአገልግሎት ውል ============
@app.get("/terms", response_class=HTMLResponse)
async def terms_of_service():
    return """
    <!DOCTYPE html>
    <html lang="am">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>የአገልግሎት ውል - DigiEqub</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: #f9f9f9;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #1a73e8;
                border-bottom: 3px solid #1a73e8;
                padding-bottom: 10px;
            }
            h2 {
                color: #1a73e8;
                margin-top: 25px;
            }
            ul { padding-left: 25px; }
            li { margin: 8px 0; }
            .date {
                color: #666;
                font-style: italic;
                margin-bottom: 20px;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 14px;
                color: #666;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📋 የአገልግሎት ውል</h1>
            <p class="date">የመጨረሻ ማሻሻያ፦ ጁላይ 2026</p>
            
            <h2>✅ ውሉን መቀበል</h2>
            <p>DigiEqub ን በመጠቀም እነዚህን የአገልግሎት ውሎች ተቀብለዋል ማለት ነው።</p>
            
            <h2>📌 የአገልግሎት መግለጫ</h2>
            <ul>
                <li>በኢሜል የOTP ማረጋገጫ</li>
                <li>የኢሜል ማሳወቂያዎች</li>
                <li>በGoogle OAuth የተጠቃሚ ማረጋገጫ</li>
            </ul>
            
            <h2>👤 የተጠቃሚ ኃላፊነቶች</h2>
            <ul>
                <li>ትክክለኛ የኢሜል አድራሻ መስጠት</li>
                <li>የመለያዎን ደህንነት መጠበቅ</li>
                <li>አገልግሎቱን በአግባቡ መጠቀም</li>
            </ul>
            
            <h2>📬 እኛን ያግኙ</h2>
            <p><strong>ኢሜይል፦</strong> your-email@gmail.com</p>
            
            <div class="footer">
                <p>© 2026 DigiEqub. All rights reserved.</p>
                <p><a href="/">🏠 ወደ ቤት ገጽ</a></p>
            </div>
        </div>
    </body>
    </html>
    """

# ============ የAPI ሰነዶች ============
@app.get("/api/docs")
async def api_docs():
    return {"message": "API documentation available at /docs"}

# የነባር JSON መስመር ቢኖር ያስወግዱት!