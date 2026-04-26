// fix_mongo.js
use digiequb
print("Dropping phone_number unique index...");
try {
    db.users.dropIndex("phone_number_1");
    print("Index dropped successfully");
} catch (e) {
    print("Index may not exist: " + e);
}

print("Creating sparse unique index on phone_number...");
db.users.createIndex(
    { phone_number: 1 },
    { unique: true, sparse: true }
);

print("Ensuring email has unique index...");
db.users.createIndex(
    { email: 1 },
    { unique: true }
);

print("Current indexes:");
db.users.getIndexes();

print("Done! Now restart your backend.");