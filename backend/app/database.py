import json
import os
import uuid
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from .config import settings

class JSONDatabase:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.lock = asyncio.Lock()
        self._init_db()

    def _init_db(self):
        if not os.path.exists(self.file_path):
            with open(self.file_path, "w") as f:
                json.dump({
                    "users": [],
                    "issues": [],
                    "emergencies": [],
                    "traffic": [],
                    "notifications": []
                }, f, indent=4)

    def _read(self) -> Dict[str, List[Any]]:
        try:
            with open(self.file_path, "r") as f:
                return json.load(f)
        except Exception:
            return {
                "users": [],
                "issues": [],
                "emergencies": [],
                "traffic": [],
                "notifications": []
            }

    def _write(self, data: Dict[str, List[Any]]):
        with open(self.file_path, "w") as f:
            json.dump(data, f, indent=4)

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for key, value in query.items():
            if key not in doc:
                return False
            # Check nested keys or basic matching
            if doc[key] != value:
                return False
        return True

    async def find_many(self, collection: str, query: Dict[str, Any] = None, sort: List[tuple] = None, limit: int = None) -> List[Dict[str, Any]]:
        async with self.lock:
            data = self._read()
            docs = data.get(collection, [])
            results = [doc for doc in docs if self._matches(doc, query)]
            
            if sort:
                # Custom sort implementation (e.g. [("createdAt", -1)])
                for key, direction in reversed(sort):
                    results.sort(key=lambda x: x.get(key, ""), reverse=(direction == -1))
            
            if limit:
                results = results[:limit]
            return results

    async def find_one(self, collection: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self.lock:
            data = self._read()
            docs = data.get(collection, [])
            for doc in docs:
                if self._matches(doc, query):
                    return doc
            return None

    async def insert_one(self, collection: str, document: Dict[str, Any]) -> Dict[str, Any]:
        async with self.lock:
            data = self._read()
            if collection not in data:
                data[collection] = []
            
            doc = dict(document)
            if "id" not in doc and "_id" not in doc:
                doc["id"] = str(uuid.uuid4())
            elif "_id" in doc and "id" not in doc:
                doc["id"] = str(doc["_id"])

            data[collection].append(doc)
            self._write(data)
            return doc

    async def update_one(self, collection: str, query: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        async with self.lock:
            data = self._read()
            docs = data.get(collection, [])
            updated = False
            for doc in docs:
                if self._matches(doc, query):
                    # Handle MongoDB-like $set operators or raw updates
                    if "$set" in update_data:
                        for k, v in update_data["$set"].items():
                            doc[k] = v
                    else:
                        for k, v in update_data.items():
                            doc[k] = v
                    updated = True
                    break
            if updated:
                self._write(data)
            return updated

    async def delete_one(self, collection: str, query: Dict[str, Any]) -> bool:
        async with self.lock:
            data = self._read()
            docs = data.get(collection, [])
            initial_len = len(docs)
            data[collection] = [doc for doc in docs if not self._matches(doc, query)]
            deleted = len(data[collection]) < initial_len
            if deleted:
                self._write(data)
            return deleted

    async def count(self, collection: str, query: Dict[str, Any] = None) -> int:
        async with self.lock:
            data = self._read()
            docs = data.get(collection, [])
            return len([doc for doc in docs if self._matches(doc, query)])

# Abstract DB client wrapper
class DBClient:
    def __init__(self):
        self.use_mongo = bool(settings.MONGO_URI)
        if self.use_mongo:
            from motor.motor_asyncio import AsyncIOMotorClient
            self.mongo_client = AsyncIOMotorClient(settings.MONGO_URI)
            self.mongo_db = self.mongo_client[settings.DATABASE_NAME]
        else:
            db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db_storage.json")
            self.json_db = JSONDatabase(db_path)

    async def find_many(self, collection: str, query: Dict[str, Any] = None, sort: List[tuple] = None, limit: int = None) -> List[Dict[str, Any]]:
        if self.use_mongo:
            cursor = self.mongo_db[collection].find(query or {})
            if sort:
                cursor = cursor.sort(sort)
            if limit:
                cursor = cursor.limit(limit)
            results = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                if "_id" in doc:
                    del doc["_id"]
                results.append(doc)
            return results
        else:
            return await self.json_db.find_many(collection, query, sort, limit)

    async def find_one(self, collection: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.use_mongo:
            # Map query ID if searching for 'id'
            mongo_query = dict(query)
            if "id" in mongo_query:
                from bson.objectid import ObjectId
                try:
                    mongo_query["_id"] = ObjectId(mongo_query["id"])
                    del mongo_query["id"]
                except Exception:
                    pass
            doc = await self.mongo_db[collection].find_one(mongo_query)
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                if "_id" in doc:
                    del doc["_id"]
                return doc
            return None
        else:
            return await self.json_db.find_one(collection, query)

    async def insert_one(self, collection: str, document: Dict[str, Any]) -> Dict[str, Any]:
        if self.use_mongo:
            doc = dict(document)
            result = await self.mongo_db[collection].insert_one(doc)
            doc["id"] = str(result.inserted_id)
            if "_id" in doc:
                del doc["_id"]
            return doc
        else:
            return await self.json_db.insert_one(collection, document)

    async def update_one(self, collection: str, query: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        if self.use_mongo:
            mongo_query = dict(query)
            if "id" in mongo_query:
                from bson.objectid import ObjectId
                try:
                    mongo_query["_id"] = ObjectId(mongo_query["id"])
                    del mongo_query["id"]
                except Exception:
                    pass
            # standard check: if update_data has $set, use it; otherwise wrap it
            if not any(k.startswith("$") for k in update_data.keys()):
                update_data = {"$set": update_data}
            result = await self.mongo_db[collection].update_one(mongo_query, update_data)
            return result.modified_count > 0
        else:
            return await self.json_db.update_one(collection, query, update_data)

    async def delete_one(self, collection: str, query: Dict[str, Any]) -> bool:
        if self.use_mongo:
            mongo_query = dict(query)
            if "id" in mongo_query:
                from bson.objectid import ObjectId
                try:
                    mongo_query["_id"] = ObjectId(mongo_query["id"])
                    del mongo_query["id"]
                except Exception:
                    pass
            result = await self.mongo_db[collection].delete_one(mongo_query)
            return result.deleted_count > 0
        else:
            return await self.json_db.delete_one(collection, query)

    async def count(self, collection: str, query: Dict[str, Any] = None) -> int:
        if self.use_mongo:
            return await self.mongo_db[collection].count_documents(query or {})
        else:
            return await self.json_db.count(collection, query)

# Create db instance
db = DBClient()
