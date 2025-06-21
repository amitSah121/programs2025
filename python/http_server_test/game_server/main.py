from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Data model for requests
class GameRequest(BaseModel):
    player_name: str
    action: str
    value: int

# Simple in-memory game state
game_state = {
    "players": {}
}

@app.get("/")
def root():
    return {"message": "Game server is running!"}

@app.post("/update")
def update_state(request: GameRequest):
    player = request.player_name
    action = request.action
    value = request.value

    if player not in game_state["players"]:
        game_state["players"][player] = {"score": 0, "actions": []}

    if action == "score":
        game_state["players"][player]["score"] += value
    else:
        game_state["players"][player]["actions"].append({"action": action, "value": value})

    return {"message": "State updated", "state": game_state["players"][player]}

@app.get("/state/{player_name}")
def get_player_state(player_name: str):
    return game_state["players"].get(player_name, {"message": "Player not found"})

# Run the server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
