module list;

import std.stdio : writeln, write;

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
	int length = 0;
  
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
		this.length++;
  }

	void addmany(int[] args...){
		foreach (arg; args) {
	  	this.add(arg);
	  }
	}

	Node* getAt(int index){
		auto current = head;
		
		if (head is null) {
			return null;
		} else {
		  while (current !is null && index != 0) {
			  current = current.next;
				index--;
		  }
  	}

		if(current is null) return null;
		
		return new Node(current.val);
	}

	Node* getAt_ptr(int index){
		auto current = head;
		
		if (head is null) {
			return null;
		} else {
		  while (current !is null && index != 0) {
			  current = current.next;
				index--;
		  }
  	}

		if(current is null) return null;
		
		return current;
	}
  
  void print(){
	  if (head is null) {
		  writeln("Nothing yet");
		} else {
		  auto current = head;
		  while (current !is null) {
			  write(current.val," ,");
			  current = current.next;
		  }
			writeln();
  	}
  }

	struct ListRange {
		Node* current;

		@property bool empty() const {
			return current is null;
		}

  	@property int front() const {
			return current.val;
  	}

  	void popFront() {
	  	current = current.next;
  	}
  }

  // Required by foreach — returns a range
  ListRange opSlice() {
   return ListRange(head);
  }
}

version (listmain) {
	void main() {
	  auto l1 = new List();
	  l1.addmany(5,5,6,7,9);
			l1.print();
	}
}
