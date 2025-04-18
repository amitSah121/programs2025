module mergesort;

import std:writeln;
import list: Node, List;

List MergeSort(ref List l, int min, int max){
	List output = new List();
	int n = max-min;

	if(min >= max){
		output.add(l.getAt(min).val);
		return output;
	}

	//writeln(min,n/2,max);
	List left = MergeSort(l, min, min+n/2);
	List right = MergeSort(l, min+n/2+1, max);

	int i=0, j=0;
	while(true){
		Node* a = left.getAt(i);
		Node* b = right.getAt(j);
		if(!(a is null || b is null) && a.val<b.val){
			output.add(a.val);
			i++;
		}else if(!(a is null || b is null) && a.val>b.val){
			output.add(b.val);
			j++;
		}else if(a is null && !(b is null)){
			output.add(b.val);
			j++;
		}else if(b is null && !(a is null)){
			output.add(a.val);
			i++;
		}else{
			break;
		}
	}

	
	return output;
}

version (mergesortmain) {
	void main(){
	  auto l1 = new List();
		l1.addmany(2,5,3,6,9);
		List output = MergeSort(l1,0,l1.length-1);
		output.print();
	}
}
