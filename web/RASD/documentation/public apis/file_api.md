### File Api

- set_mount(path) -- user/client provides it, returns path or null
- get_mount() -- gets public path, returns dir handler or error handler
- get_private_mount(key) -- gets private space , key is set by the application when an app is executed, returns dir handler or error handler
- create_file(path, createrecursive) -- creates file in public path returns file handler or error handler
- create_file_private(path, createrecursive) -- creates file in public path, returns file handler or error handler
- get_file(handler/path, new_name, permission=r/rw)
- get_file_private(handler/path, new_name, permission=r/rw)
- rename_file(handler/path, new_name, )
- rename_file_private(handler/path, new_name, )
- delete_file(handler/path, )
- delete_file_private(handler/path, )
- move_file(handler/old_path, new_path, )
- move_file_private(handler/old_path, new_path, )
- copy_file(src_path, dest_path)
- copy_file_private(src_path, dest_path)
- get_file_metadata(handler/path, )
- get_file_metadata_private(handler/path, )
- read_file(handler/path, ) -- read file, return in bytes, return error handler if not satisfied
- read_file_private(handler/path, ) -- return in bytes, return error handler if not satisfied
- write_file(handler/path, ) -- writes file, return error handler if not satisfied
- write_file_private(handler/path, ) -- writes file, return error handler if not satisfied
- get_dir_tree()
- get_dir_tree_private()
- create_dir(path, createrecursive)
- create_dir_private(path, createrecursive)
- delete_dir(handler/path, recursive, )
- delete_dir_private(handler/path, recursive, )
- rename_dir(handler/old_path, new_path, )
- rename_dir_private(handler/old_path, new_path, )
- move_dir(old_path, new_path)

#### Objects

- handler

```
FileHandler
{
    pos:
    path:
    id:
    permission: r/rw
    type: text
}

DirHandler
{
    id:
    path:
}

path_id - it is given by backend by assigning a path a random unique id so that public api cannot be able to know the exact path where things are stored

```

- error

```
ErrorHandler
{
  code: "E_PERMISSION_DENIED"
  message: "Cannot write file"
}
```
