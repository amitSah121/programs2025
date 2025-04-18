import std.stdio : writeln;

struct Node{
    int val;
    Node* next;
    
    this(int v){
      val = v;
      next = null;
    }
   
}

class List{
    Node* head;
    
    this(){
      head = null;  
    }
    
    void add(int val){
        auto newNode = new Node(val);

        if (head is null) {
            head = newNode;
        } else {
            auto current = head;
            while (current.next !is null) {
                current = current.next;
            }
            current.next = newNode;
        }
    }
    
    void print(){
        if (head is null) {
            writeln("Nothing yet");
        } else {
            auto current = head;
            while (current !is null) {
                writeln(current.val);
                current = current.next;
            }
        }
    }
}


void main() {
    auto l1 = new List();
    l1.add(5);
    l1.add(7);
    l1.add(9);
    l1.add(21);
    l1.print();
    writeln("Hello");
}
