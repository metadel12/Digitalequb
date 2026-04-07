from typing import Any, Dict
from bson import ObjectId

def convert_object_id_to_str(obj: Any) -> Any:
    """Recursively convert ObjectId to string in nested dict/list structures"""
    if isinstance(obj, dict):
        return {key: convert_object_id_to_str(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_object_id_to_str(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

def serialize_document(document: Dict) -> Dict:
    """Convert MongoDB document to JSON serializable dict"""
    if "_id" in document:
        document["id"] = str(document["_id"])
        del document["_id"]
    return convert_object_id_to_str(document)

def paginate_response(items: list, page: int = 1, limit: int = 10) -> Dict:
    """Create paginated response"""
    total = len(items)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = items[start:end]

    return {
        "items": paginated_items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }