
open Graphics

exception End

let skel f_init f_end f_key f_mouse f_except = 
    f_init();
    try 
        while true do 
            try 
                let s= Graphics.wait_next_event
                    [Graphics.Button_down; Graphics.Key_pressed]
            in if s.Graphics.keypressed then f_key s.Graphics.key
            else if s.Graphics.button then f_mouse s.Graphics.mouse_x s.Graphics.mouse_y
            with
                End -> raise End
                | e-> f_except e
        done
    with
        End -> f_end()


let next_line () = 
    let (x,y) = Graphics.current_point()
    in if y>12 then Graphics.moveto 0 (y-12)
        else Graphics.moveto 0 y

let handle_char c = 
    match c with
    '&' -> raise End
    | '\n' -> next_line ()
    | '\r' -> next_line ()
    | _ -> Graphics.draw_char c

let go () = skel 
    (fun () -> Graphics.clear_graph () ;Graphics.moveto 0 (Graphics.size_y () -12) )
    (fun () -> Graphics.clear_graph ())
    handle_char
    (fun x y -> Graphics.moveto x y)
    (fun e -> ())
    

type state = {
    maxx:int; maxy:int; mutable x:int; mutable y:int; scale:int; 
    bc:Graphics.color; fc:Graphics.color; pc:Graphics.color
}
let draw_point x y s c = 
    Graphics.set_color c;
    Graphics.fill_rect (s*x) (s*y) s s

let t_init s () = 
    Graphics.open_graph (" " ^ (string_of_int (s.scale*s.maxx)) ^"x" 
    ^(string_of_int (s.scale*s.maxy)));
    Graphics.set_color s.bc;
    Graphics.fill_rect 0 0 (s.scale*s.maxx+1) (s.scale*s.maxy+1);
    draw_point s.x s.y s.scale s.pc

let t_end s () =
    Graphics.close_graph () ;
    print_string "Good bye..."; print_newline ()

let t_mouse s x y = ()
let t_except s ex = ()

let t_key info c =
    draw_point info.x info.y info.scale info.fc;
    (match c with 
        '8' -> if info.y < info.maxy then 
                info.y <- info.y + 1;
        | '2' -> if info.y > 0 then info.y <- info.y - 1
        | '4' -> if info.x > 0 then info.x <- info.x - 1
        | '6' -> if info.x < info.maxx then info.x <- info.x + 1
        | 'c' -> Graphics.set_color info.bc;
                Graphics.fill_rect 0 0 (info.scale*info.maxx+1) (info.scale*info.maxy+1);
                Graphics.clear_graph ()| 'e' -> raise End| _ -> () );
                draw_point info.x info.y info.scale info.pc

let stel = {
    maxx=120; 
    maxy=120; 
    x=60; 
    y=60;
    scale=4; 
    bc=Graphics.rgb 130 130 130;
    fc=Graphics.black; 
    pc=Graphics.red
}

let slate () = skel (t_init stel) (t_end stel) (t_key stel)
(t_mouse stel) (t_except stel)

let () =
  (* open_graph " 640x480";
  set_window_title "My Graphics";

  go() *)
  slate()
  (* draw a circle *)
  (* let cx = 320 and cy = 240 and r = 100 in
  draw_circle cx cy r; *)

  (* wait so window doesnt close immediately *)
  (* ignore (read_key ()) *)

(* type key = Plus | Minus | Times | Divide
type tree = Empty | Operator of tree*key*tree | Value of int

let rec insert op x = function
| Empty -> Operator(Value(x),op,Empty)
| Value(a) -> Operator(Value(a),op,Value(x))
| Operator(lb,r,rb) -> (
    match r with 
    | Plus|Minus -> Operator(lb, r, insert op x rb) 
    |Times|Divide -> Operator(lb, op, insert r x rb)
)

let rec evaluate= function
| Empty -> 0
| Value(a) -> print_endline (string_of_int a);a
| Operator(lb,r,rb) -> (
    match r with 
    | Plus -> print_endline " + ";evaluate lb + evaluate rb;
    | Minus -> print_endline " - ";evaluate lb - evaluate rb
    |Times -> print_endline " X ";evaluate lb * evaluate rb
    |Divide -> print_endline " / ";evaluate lb / evaluate rb
)


let rec print_all= function
| Empty -> ""
|Value x -> " , "^(string_of_int x)
| Operator(lb, r, rb) -> " "^(match r with Plus->"+"|Minus->"-"|Times->"X"|Divide->"/")^"\n  "^(print_all lb)^(print_all rb)


let p1 = insert Plus 5 (Value 6)
let p1 = insert Plus 7 p1
let p1 = insert Times 7 p1

let () = print_endline (print_all p1); print_int (evaluate p1); print_endline "\n" *)