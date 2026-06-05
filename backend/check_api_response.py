#!/usr/bin/env python3
"""Test the admin API endpoint."""
import os
import sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.getcwd())

from app.services.admin_service import AdminService
from app.core.database import get_database_instance
import json

db = get_database_instance()
service = AdminService(db)
groups = service.get_all_groups()

# Find markos group
for g in groups:
    if 'markos' in g['group_name'].lower():
        print(json.dumps(g, indent=2))
        break
