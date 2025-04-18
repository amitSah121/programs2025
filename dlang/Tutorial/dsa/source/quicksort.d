module quicksort;


import std:writeln, Random, unpredictableSeed, uniform;
import list: Node, List;

int partition(ref List l, int low, int high){
	auto rnd = Random(unpredictableSeed); 
  int n = uniform(low, high, rnd);

	int i=low;
	int j=high;
	while(i<j){
		//writeln(i,j,l.getAt(i).val, l.getAt(j).val, l.getAt(n).val);
		if(l.getAt(i).val < l.getAt(n).val){
			//writeln(i,j);
			i++;
		}else if(l.getAt(j).val >= l.getAt(n).val){
			j--;
		}else if(l.getAt(i).val >= l.getAt(n).val && l.getAt(j).val <= l.getAt(n).val){
		//	writeln("jj");
		//writeln(i,j,l.getAt(i).val, l.getAt(j).val, l.getAt(n).val);
			int temp = l.getAt_ptr(i).val;
			l.getAt_ptr(i).val = l.getAt_ptr(j).val;
			l.getAt_ptr(j).val = temp;
			i++;
			j--;
		}else{
			i++;
			j--;
		}
	}

	return n;
}

void quicksort(ref List l, int low, int high){

	if(low < high){
		//l.print();
		int p = partition(l, low,high);
		quicksort(l, low, p);
		quicksort(l, p+1, high);
	}
	
}

version (quicksortmain) {
	void main(){
	  auto l1 = new List();
		l1.addmany(2,5,3,1,9);
		quicksort(l1,0,l1.length-1);
		l1.print();
	}
}
