#!/bin/bash

DEFAULT_PROJECT=""
DEFAULT_PORT=

get_pid_file() {
  local project="$1"
  echo ".pid_${project}"
}

start_server() {
  local project="$1"
  local port="$2"
  [ -z "$project" ] && project="$DEFAULT_PROJECT"
  [ -z "$port" ] && port="$DEFAULT_PORT"

  local pid_file
  pid_file=$(get_pid_file "$project")

  echo "Starting project '$project' on port $port..."

  nohup node index.js "$project" "$port" > "logs/${project}.log" 2>&1 &
  echo $! > "$pid_file"

  echo "Started '$project' (PID: $(cat "$pid_file"))"
}

stop_server() {
  local project="$1"
  [ -z "$project" ] && project="$DEFAULT_PROJECT"

  local pid_file
  pid_file=$(get_pid_file "$project")

  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    echo "Stopping project '$project' (PID: $pid)..."
    kill "$pid"
    rm "$pid_file"
  else
    echo "No running project '$project' found."
  fi
}

status_server() {
  local project="$1"
  [ -z "$project" ] && project="$DEFAULT_PROJECT"

  local pid_file
  pid_file=$(get_pid_file "$project")

  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    if ps -p "$pid" > /dev/null; then
      echo "Project '$project' is running (PID: $pid)"
    else
      echo "Project '$project' not running, but PID file exists"
    fi
  else
    echo "Project '$project' is not running"
  fi
}

# === Entry Point ===
case "$1" in
  start)
    start_server "$2" "$3"
    ;;
  stop)
    stop_server "$2"
    ;;
  status)
    status_server "$2"
    ;;
  *)
    echo "Usage:"
    echo "  ./server.sh start [project] [port]"
    echo "  ./server.sh stop [project]"
    echo "  ./server.sh status [project]"
    exit 1
    ;;
esac
