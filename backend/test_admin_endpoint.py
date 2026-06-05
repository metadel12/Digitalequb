#!/usr/bin/env python3
"""Test the admin groups endpoint to verify expected_amount calculation."""
import os
import sys
import requests

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.getcwd())

from app.core.database import get_database_instance

# Get admin token or test directly
db = get_database_instance()

# Use the AdminService directly
from app.services.admin_service import AdminService

service = AdminService(db)
groups = service.get_all_groups()

print("📊 ADMIN GROUPS API RESPONSE:\n")
for g in groups:
    print(f"Group: {g['group_name']}")
    print(f"  Total Members: {g['total_members']}")
    print(f"  Paid Members: {g['paid_members']}")
    print(f"  Total Collected: {g['total_collected']} ETB")
    print(f"  Expected Amount: {g['expected_amount']} ETB")
    print(f"  All Paid: {g['all_paid']}")
    print(f"  Shortfall: {max(0, g['expected_amount'] - g['total_collected']):.2f} ETB")
    print()
