#!/usr/bin/env python
"""
Test script to verify document upload configuration and functionality.
Run this from the backend directory: python test_documents_config.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def test_configuration():
    """Test if Supabase configuration is correct."""
    print("=" * 60)
    print("DOCUMENT UPLOAD CONFIGURATION TEST")
    print("=" * 60)
    
    # Test SUPABASE_URL
    print("\n1. Testing SUPABASE_URL:")
    if settings.SUPABASE_URL:
        print(f"   ✅ URL is set: {settings.SUPABASE_URL}")
        if settings.SUPABASE_URL.startswith("https://"):
            print(f"   ✅ URL format is correct (starts with https://)")
        else:
            print(f"   ❌ URL format is wrong (should start with https://)")
    else:
        print(f"   ❌ URL is NOT set")
    
    # Test SUPABASE_KEY
    print("\n2. Testing SUPABASE_KEY:")
    if settings.SUPABASE_KEY:
        key_length = len(settings.SUPABASE_KEY)
        key_preview = settings.SUPABASE_KEY[:20] + "..." + settings.SUPABASE_KEY[-5:]
        print(f"   ✅ Key is set (length: {key_length})")
        print(f"   Key preview: {key_preview}")
        
        if key_length > 100:
            print(f"   ✅ Key length looks valid (JWT tokens are typically 200+ chars)")
        else:
            print(f"   ⚠️  Key length seems short for a JWT token")
            
        if settings.SUPABASE_KEY.startswith("eyJ"):
            print(f"   ✅ Key format looks like JWT (starts with eyJ)")
        elif settings.SUPABASE_KEY.startswith("sb_"):
            print(f"   ⚠️  This looks like a legacy Supabase key")
        else:
            print(f"   ⚠️  Key format is unusual")
    else:
        print(f"   ❌ Key is NOT set")
    
    # Test bucket name
    print("\n3. Testing SUPABASE_DOCUMENTS_BUCKET:")
    print(f"   Bucket name: {settings.SUPABASE_DOCUMENTS_BUCKET}")
    if settings.SUPABASE_DOCUMENTS_BUCKET == "digiequb":
        print(f"   ✅ Bucket name is 'digiequb'")
    else:
        print(f"   ⚠️  Bucket name is '{settings.SUPABASE_DOCUMENTS_BUCKET}' (expected 'digiequb')")
    
    # Test file size limit
    print("\n4. Testing MAX_FILE_SIZE_MB:")
    print(f"   Max file size: {settings.MAX_FILE_SIZE_MB} MB")
    if settings.MAX_FILE_SIZE_MB == 2:
        print(f"   ✅ File size limit is 2 MB")
    else:
        print(f"   ⚠️  File size limit is {settings.MAX_FILE_SIZE_MB} MB (expected 2 MB)")
    
    # Test Supabase client creation
    print("\n5. Testing Supabase Client Creation:")
    try:
        from supabase import create_client
        
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            print(f"   ❌ Cannot create client - missing credentials")
            return False
        
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print(f"   ✅ Supabase client created successfully")
        
        # Try to access the bucket
        try:
            bucket_info = client.storage.get_bucket(settings.SUPABASE_DOCUMENTS_BUCKET)
            print(f"   ✅ Bucket '{settings.SUPABASE_DOCUMENTS_BUCKET}' exists")
        except Exception as e:
            print(f"   ❌ Error accessing bucket: {e}")
            print(f"   ℹ️  Bucket might not exist or you don't have permissions")
            return False
        
        return True
        
    except ImportError:
        print(f"   ❌ Supabase package not installed")
        print(f"   Run: pip install supabase")
        return False
    except Exception as e:
        print(f"   ❌ Error creating Supabase client: {e}")
        return False

def main():
    print("\nRunning document upload configuration test...\n")
    
    success = test_configuration()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ ALL TESTS PASSED - Configuration looks good!")
        print("\nYou can now test the registration endpoint:")
        print("  POST http://localhost:8000/api/v1/auth/register-with-documents")
    else:
        print("❌ CONFIGURATION ISSUES FOUND")
        print("\nPlease fix the issues above and try again.")
        print("\nNeed help? Check:")
        print("  - DEBUG_STEPS.md")
        print("  - DOCUMENT_UPLOAD_DEBUG.md")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
