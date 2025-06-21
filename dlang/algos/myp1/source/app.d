import std.stdio;
import std.format;
import std.string;

import raylib;
import raylib : Color;
import raymath;
import rlgl;

import constants.Color : Colors;

void main() {
	// Texture2D[8] textures;
	// foreach (i; 1 .. 9) { 
	// 	string path = format("res/images/%d.png\0", i);
	// 	// Image image = LoadImage(path.ptr); 
	// 	textures[i - 1] = LoadTexture(path.ptr);
	// 	// UnloadImage(image);
	// }

	Image img = LoadImage("res/images/1.png");
    Texture2D tex = LoadTexture("res/images/1.png");
    UnloadImage(img); 

	Grid g = new Grid(14,8,960,960);
	g.pos(20,20);
	g.setCellText(["JNK","JNK","JNK","JNK","JNK","JNK","BRT","BRT",
  				"KTM","","","","","","","BRT",
				"KTM","","","","","","","BRT",
				"KTM","","","","","","","BRT",
				"KTM","","","","","","","BRT",
				"KTM","","","","","","","BRJ",
				"KTM","","","","","","","BRJ",
				"KTM","","","","","","","BRJ",
				"KTM","","","","","","","BRJ",
				"KTM","","","","","","","BRJ",
				"KTM","","","","","","","BRJ",
				"ILM","","","","","","","GRH",
				"ILM","","","","","","","GRH",
				"ILM","ILM","PLP","PLP","PLP","PLP","GRH","GRH"]);
	Grid places1 = new Grid(7,1,250,500);
	places1.setCellText(["Janakpur(JNK)","Biratnagar(BRT)","Birgunj(BRJ)","Gorkha(GHR)","Palpa(PLP)","Kathmandu(KTM)","Illam(ILM)"]);
	places1.setCellTextPos(0.1,0.5);
	places1.pos(150,150);

	Grid places2 = new Grid(7,1,180,500);
	places2.setCellText(["22%-6","22%-6","8%-4","8%-4","8%-4","24%-10","8%-4"]);
	places2.pos(410,150);


	Grid places3 = new Grid(7,1,250,500);
	places3.setCellText(["Plain - 1pt","Hilly - Up(2pt)","Hilly - Up(2pt)","Mountain - Up(2pt)",
						"Mountain - Up(2pt)","Hilly - Up(2pt)","Hilly - Up(2pt)"]);
	places3.setCellTextPos(0.1,0.5);
	places3.pos(600,150);

	Cell c1 = new Cell();
	c1.x = 250;
	c1.y = 670;
	c1.w = 500;
	c1.h = 200;
	c1.s = "Z = PowerUp moves +2 or +3 block up\n\n\nUP = Move 1 block up\n\n\nDown = Move 1 block Down";
	c1.tcenter = false;
	c1.tpx = 0.05;
	c1.tpy = 0.2;
	c1.bcolor = true;

	Cell c2 = new Cell();
	c2.x = 250;
	c2.y = 100;
	c2.w = 500;
	c2.h = 50;
	c2.s = "HOLLOW STADIUM";
	c2.tcenter = false;
	c2.tpx = 0.2;
	c2.tpy = 0.2;
	c2.fs = 36;
	c2.bcolor = true;
  SetTargetFPS(60);
  InitWindow(1000, 1000, "Race Game");
  scope (exit)
    CloseWindow(); 

  while (!WindowShouldClose()) {
    BeginDrawing();
    ClearBackground(Colors.RAYWHITE);
	g.draw();
	places1.draw();
	places2.draw();
	places3.draw();
	c1.draw();
	c2.draw();
	// DrawTexture(textures[0],100,100,Colors.WHITE);
    EndDrawing();
  }

  writeln("Ending a raylib example.");
}


class Cell{
	int x,y,w,h,fs;
	float tpx,tpy;
	Color c, sc, tc;
	string s;
	bool tcenter = false, bcolor = false;

	this(){
		x = y = 0;
		tpx = tpy = 0.5;
		w = h = 100;
		fs = 24;
		c = Colors.WHITE;
		sc = Colors.BLACK;
		tc = Colors.BLACK;
		s = "";
	}

	void draw(){
		rlPushMatrix();                    // Save matrix state
        rlTranslatef(x, y, 0.0f);
		DrawRectangle(0,0,w,h,c);
		if(bcolor)
			DrawRectangleLines(0,0,w,h,sc);
		if(tcenter){
			int p1 =  MeasureText(s.ptr, fs);
			DrawText(s.ptr,(w-p1)/2,(h-fs)/2,fs,tc);
		}else{
			DrawText(s.ptr,cast(int)(w*tpx),cast(int)(h*tpy),fs,tc);
		}
		rlPopMatrix();
	}
}

class Grid{
	int rows;
	int cols;
	int x,y,w,h;
	Cell[][] cells;

	this(int r, int c, int w1, int h1){
		x = y = 0;
		w = w1;
		h = h1;
		this.rows = r;
		this.cols = c;
		this.initcells();
	}

	void pos(int x1, int y1){
		x = x1;
		y = y1;
	}

	void setCellText(string[] map){
		int l = cast(int)map.length;
		foreach(i; 0..l){
			int p1 = i%cols;
			int p2 = i/cols;
			// writeln(p1,p2);
			cells[p2][p1].s = map[i];
			if(map[i] != "")
				cells[p2][p1].bcolor = true;
		}
	}

	void setCellTextPos(float q1, float q2){
		foreach(i; 0..rows*cols){
			int p1 = i%cols;
			int p2 = i/cols;
			cells[p2][p1].tpx = q1;
			cells[p2][p1].tpy = q2;
			cells[p2][p1].tcenter = false;
		}
	}


	void initcells(){
		this.cells = new Cell[][](rows);
		foreach(i;0 .. rows){
			this.cells[i] = new Cell[](cols);
			foreach (j; 0 .. cols) {
				this.cells[i][j] = new Cell();
			}
		}

		int p1 = w/cols;
		int p2 = h/rows;

		int temph=0;
		foreach (i; 0..rows)
		{	int tempw = 0;
			foreach (j; 0..cols)
			{
				Cell key = cells[i][j];
				key.x = tempw;
				key.y = temph;
				key.w = p1;
				key.h = p2;
				tempw += p1;
			}
			temph += p2;
		}
	}

	void draw(){
		rlPushMatrix();
		rlTranslatef(x,y,0f);
		foreach (Cell[] cell; cells)
		{
			foreach (Cell key; cell)
			{
				key.draw();
			}
		}
		rlPopMatrix();
	}

}

