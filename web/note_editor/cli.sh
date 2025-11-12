#!/bin/bash

DEFAULT_PROJECT=""
DEFAULT_PORT=3000

LOG_DIR="logs"
PID_PREFIX=".pid_"
RES_DIR="./res"

mkdir -p "$LOG_DIR"

get_pid_file() {
  local project="$1"
  echo "${PID_PREFIX}${project}"
}

start_server() {
  local project="$1"
  local port="$2"
  [ -z "$project" ] && project="$DEFAULT_PROJECT"
  [ -z "$port" ] && port="$DEFAULT_PORT"

  local pid_file
  pid_file=$(get_pid_file "$project")

  if [ -f "$pid_file" ]; then
    echo "❗ Project '$project' already running (PID: $(cat "$pid_file"))"
    return
  fi

  echo "🚀 Starting project '$project' on port $port..."
  nohup node index.js "$project" "$port" > "${LOG_DIR}/${project}.log" 2>&1 &
  echo $! > "$pid_file"

  echo "✅ Started '$project' (PID: $(cat "$pid_file"))"
}

stop_server() {
  local project="$1"
  [ -z "$project" ] && project="$DEFAULT_PROJECT"

  local pid_file
  pid_file=$(get_pid_file "$project")

  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    echo "🛑 Stopping project '$project' (PID: $pid)..."
    kill "$pid"
    rm "$pid_file"
    echo "✅ Stopped '$project'"
  else
    echo "⚠️  No running project '$project' found."
  fi
}

status_server() {
  local project="$1"
  local pid_file
  pid_file=$(get_pid_file "$project")

  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    if ps -p "$pid" > /dev/null; then
      echo "✅ Project '$project' is running (PID: $pid)"
    else
      echo "⚠️  Project '$project' not running, but PID file exists"
    fi
  else
    echo "❌ Project '$project' is not running"
  fi
}

list_projects() {
  echo "📂 Available projects in $RES_DIR:"
  if [ -d "$RES_DIR" ]; then
    ls -1 "$RES_DIR"
  else
    echo "❌ No 'res' directory found."
  fi
}

list_running() {
  echo "🟢 Running Projects:"
  local found=false
  for pid_file in ${PID_PREFIX}*; do
    if [ -f "$pid_file" ]; then
      found=true
      local project=${pid_file#${PID_PREFIX}}
      local pid=$(cat "$pid_file")
      if ps -p "$pid" > /dev/null; then
        local port=$(grep -oE "[0-9]{4,5}" "${LOG_DIR}/${project}.log" | tail -1)
        echo "• $project (PID: $pid, Port: ${port:-unknown})"
      fi
    fi
  done
  if [ "$found" = false ]; then
    echo "No running projects."
  fi
}

interactive_mode() {
  echo "=============================="
  echo " Node Project Server Manager"
  echo "=============================="
  echo "Commands:"
  echo "  start <folder> <port>   - Start server"
  echo "  stop <folder>           - Stop server"
  echo "  status <folder>         - Check status"
  echo "  list                    - List all projects in ./res"
  echo "  list-running            - Show running servers"
  echo "  exit                    - Quit"
  echo "------------------------------"

  while true; do
    echo -n "> "
    read -r cmd arg1 arg2

    case "$cmd" in
      start) start_server "$arg1" "$arg2" ;;
      stop) stop_server "$arg1" ;;
      status) status_server "$arg1" ;;
      list) list_projects ;;
      list-running) list_running ;;
      exit|quit)
        echo "👋 Exiting..."
        break
        ;;
      "" ) ;; # ignore empty
      *) echo "❓ Unknown command: $cmd" ;;
    esac
  done
}

# === Entry Point ===
if [ $# -eq 0 ]; then
  interactive_mode
else
  case "$1" in
    start) start_server "$2" "$3" ;;
    stop) stop_server "$2" ;;
    status) status_server "$2" ;;
    list) list_projects ;;
    list-running) list_running ;;
    *)
      echo "Usage:"
      echo "  ./server.sh start [project] [port]"
      echo "  ./server.sh stop [project]"
      echo "  ./server.sh status [project]"
      echo "  ./server.sh list"
      echo "  ./server.sh list-running"
      echo "  ./server.sh"
      exit 1
      ;;
  esac
fi
