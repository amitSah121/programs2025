#!/bin/bash

# API_URL="http://192.168.0.192:8000/api/user/10/order/11/pic/12"  # Replace with your actual API URL


API_URL="http://192.168.0.192:80/api/help"  # Replace with your actual API URL
NUM_REQUESTS=100  # Total number of requests
CONCURRENCY=10  # Number of parallel requests

echo "Testing API Performance: $API_URL"
echo "Total Requests: $NUM_REQUESTS | Concurrency: $CONCURRENCY"

# Function to send a request
send_request() {
    START_TIME=$(date +%s%3N)  # Start time in milliseconds
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")
    END_TIME=$(date +%s%3N)  # End time in milliseconds
    DURATION=$((END_TIME - START_TIME))
    
    echo "$RESPONSE, $DURATION ms" >> results.csv
}

# Run requests in parallel
echo "HTTP_CODE, RESPONSE_TIME(ms)" > results.csv
for ((i=1; i<=NUM_REQUESTS; i++)); do
    send_request &
    if (( i % CONCURRENCY == 0 )); then
        wait  # Wait for batch completion
    fi
done
wait

# Calculate average response time
awk -F', ' '{sum+=$2; count++} END {print "Average Response Time: " sum/count " ms"}' results.csv
