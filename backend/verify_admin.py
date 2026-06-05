from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['digiequb_db']

# Update admin verification
result = db['users'].update_one(
    {'email': 'metizomawa@gmail.com'},
    {'$set': {'email_verified': True}}
)
print(f'Updated: {result.modified_count} admin record(s)')

# Verify
admin = db['users'].find_one({'email': 'metizomawa@gmail.com'})
print(f'Admin email verified: {admin.get("email_verified")}')
print(f'Admin is_admin: {admin.get("is_admin")}')
