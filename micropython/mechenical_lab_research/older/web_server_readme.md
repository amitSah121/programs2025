server.router.get("/api/user/:id", lambda id: {"user_id": id})
curl -X GET http://localhost:8000/api/user/123

server.router.get("/api/user/:id/order/:pid", lambda id,pid: {"user_id": id,"hg":pid})
curl -X GET http://localhost:8000/api/user/123/group/11


server.router.post("/api/data/:type", lambda data, type: {"received": data["score"], "type": type})
curl -X POST http://localhost:8000/api/data/sports -H "Content-Type: application/json" -d '{"score": 100}'

