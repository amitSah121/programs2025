### File api

File & Folder API Documentation

Base URL: http://localhost:4000

---

1. Get File Handler
   Public: GET /api/file/get
   Private: GET /api/private/file/get
   Parameters:

- name - is path actually (string, required)
- id (string, optional)
  Description: Returns the file handler object including id, path, and type.

```
Example Response:
{
  "id": "file_1698732543321_123456",
  "path": "notes.txt",
  "type": "file"
}
```

2. Read File
   Public: GET /api/file/read
   Private: GET /api/private/file/read
   Parameters:

- name - is path actually (string, required)
- id (string, optional)
  Description: Returns the file content as a string.

```
Example Response:
{
  "data": "This is the content of the file."
}
```

3. Write File
   Public: POST /api/file/write
   Private: POST /api/private/file/write
   Parameters (JSON body):

- name - is path actually (string, required)
- id (string, optional)
- content (string, required)
  Description: Writes content to the file.

```
Example Request:
{
  "name - is path actually": "notes.txt",
  "content": "Hello world"
}
Example Response:
{
  "success": true
}
```

4. Rename File
   Public: POST /api/file/rename
   Private: POST /api/private/file/rename
   Parameters (JSON body):

- name - is path actually (string, required)
- id (string, optional)
- new_name (string, required)
  Description: Renames a file in the same directory.

```
Example Request:
{
  "name - is path actually": "notes.txt",
  "new_name": "todo.txt"
}
```

5. Delete File
   Public: POST /api/file/delete
   Private: POST /api/private/file/delete
   Parameters (JSON body):

- name - is path actually (string, required)
- id (string, optional)
  Description: Deletes the specified file.

6. Move File
   Public: POST /api/file/move
   Private: POST /api/private/file/move
   Parameters (JSON body):

- name - is path actually (string, required)
- id (string, optional)
- new_path (string, required)
  Description: Moves or renames a file.

```
Example Request:
{
  "name - is path actually": "notes.txt",
  "new_path": "archive/notes.txt"
}
```

7. Copy File
   Public: POST /api/file/copy
   Private: POST /api/private/file/copy
   Parameters (JSON body):

- name - is path actually (string, required)
- id (string, optional)
- dest_path (string, required)
  Description: Copies the file to the destination.

```
Example Request:
{
  "name - is path actually": "notes.txt",
  "dest_path": "backup/notes.txt"
}
```

---

FOLDER APIs

1. Create Folder
   Public: POST /api/folder/create
   Private: POST /api/private/folder/create
   Parameters (JSON body):

- name - is path actually (string, required)
- id (string, optional)
- recursive (boolean, optional, default true)
  Description: Creates a new folder. Can create nested folders.

2. Delete Folder
   Public: POST /api/folder/delete
   Private: POST /api/private/folder/delete
   Parameters (JSON body):

- name - is path actually (string, required)
- id (string, optional)
  Description: Deletes folder recursively.

3. Move Folder
   Public: POST /api/folder/move
   Private: POST /api/private/folder/move
   Parameters (JSON body):

- old_path (string, required)
- new_path (string, required)
  Description: Moves or renames a folder.

4. Get Folder Handler
   Public: GET /api/folder/get
   Private: GET /api/private/folder/get
   Parameters:

- name - is path actually (string, required)
- id (string, optional)
  Description: Returns folder handler object including id, path, type.

5. Get Folder Tree
   Public: GET /api/folder/tree
   Private: GET /api/private/folder/tree
   Parameters (query):

- name - is path actually (string, optional, default ".")
- level (number, optional, default 3)
  Description: Returns folder/file tree recursively up to level.

```
Example Response:
{
  "success": true,
  "tree": [
    {
      "name": "notes.txt",
      "type": "file"
    },
    {
      "name": "archive",
      "type": "directory",
      "children": [
        { "name": "old_notes.txt", "type": "file" }
      ]
    }
  ]
}
```

---

Notes:

- All APIs return JSON.
- Private APIs use app_private_dir as base folder.
- id is optional; if not provided, path-based lookup is used.
- deny(res, code, message) is used for error responses consistently.
