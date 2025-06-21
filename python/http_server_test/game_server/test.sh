#!/bin/bash

SERVER_URL="http://127.0.0.1:8000/update"
PLAYER_NAME="TestPlayer"
NUM_REQUESTS=100  # Total number of requests to send
CONCURRENT=10     # Number of concurrent requests
SUCCESS=0
FAIL=0

echo "Starting performance test with $NUM_REQUESTS requests..."

# Function to send a single request
send_request() {
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SERVER_URL" \
        -H "Content-Type: application/json" \
        -d "{\"player_name\":\"$PLAYER_NAME\", \"action\":\"score\", \"value\":10}")
    
    if [[ "$RESPONSE" == "200" ]]; then
        ((SUCCESS++))
    else
        ((FAIL++))
    fi
}

# Run requests in parallel
start_time=$(date +%s%N)
for ((i = 1; i <= NUM_REQUESTS; i++)); do
    send_request &
    if ((i % CONCURRENT == 0)); then
        wait  # Wait after every batch of CONCURRENT requests
    fi
done
wait
end_time=$(date +%s%N)

# Calculate elapsed time
elapsed_time=$(( (end_time - start_time) / 1000000 ))

echo "Test completed."
echo "Success: $SUCCESS"
echo "Failures: $FAIL"
echo "Total Time: ${elapsed_time}ms"
echo "Average Time per Request: $((elapsed_time / NUM_REQUESTS))ms"
