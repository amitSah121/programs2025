
if [-z "$1"]; then
	echo "Usage: $0 <config-name>"
fi

CONF_NAME="$1"

dub build --config="$CONF_NAME"
./bin/dsa

