def read_help_manual():
    """Reads API documentation from an external file."""
    try:
        with open("res/api_help.json", "r") as f:
            return f.read()
    except Exception as e:
        return {"error": "API manual not found."}


def read_file(file_name):
    """Reads API documentation from an external file."""
    try:
        with open("res/"+file_name, "r") as f:
            return f.read()
    except Exception as e:
        return {"error": "API manual not found."}
    

def write_file(data, file_name):
    """Writes content to a file in the 'res' directory."""
    try:
        with open("res/" + file_name, "w") as f:
            f.write(data["content"])
        return {"success": f"File '{file_name}' written successfully."}
    except Exception as e:
        return {"error": str(e)}
    
def append_file(data, file_name):
    """Appends content to a file in the 'res' directory."""
    try:
        with open("res/" + file_name, "a") as f:  # Open in append mode
            f.write("\n"+data["content"])  # Append content with a newline
        return {"success": f"Content appended to '{file_name}' successfully."}
    except Exception as e:
        return {"error": str(e)}



