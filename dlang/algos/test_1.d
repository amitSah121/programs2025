
import std.stdio : writeln;

void main() {
    int[] arr = [1, 3, 5, 7, 9];  // Must be sorted!
    auto result = arr.binarySearch(5);
    
    if (!result.empty) {
        writeln("Found at index: ", arr.countUntil(result.front));  // Output: 2
    } else {
        writeln("Not found");
    }
}
