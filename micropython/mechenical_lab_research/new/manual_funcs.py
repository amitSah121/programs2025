def read_help_manual():
    """Reads API documentation from an external file."""
    try:
        with open("res/api_help.json", "r") as f:
            return f.read()
    except Exception as e:
        return {"error": "API manual not found."}

