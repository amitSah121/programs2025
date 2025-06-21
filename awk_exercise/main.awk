#!/usr/bin/awk -f


NR == 1 {
 print $0;
 next;
}
$3 >= 8 {
 printf "%s\t%s\n", $0, "**";
  next;
}
$3 >= 5 {
 printf "%s\t%s\n", $0, "*";
 next;
}
$3 < 5 {
 print $0;
}