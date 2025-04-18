module test_2;

import std.stdio;
import std.format;
import std.string;

import raylib;
import raymath;

void main() {
  writeln("Starting a raylib example.");
	int x = 200;
	int y = 300;

  SetTargetFPS(60);
  InitWindow(800, 640, "Hello, World!");
  scope (exit)
    CloseWindow(); // see https://dlang.org/spec/statement.html#scope-guard-statement

  while (!WindowShouldClose()) {
    BeginDrawing();
    ClearBackground(Colors.RAYWHITE);
    DrawText("Fello, World!", x, y, 28, Colors.BLACK);
    auto vec1 = Vector2(0, 0);
    auto vec2 = Vector2(100, 100);
    auto sum = Vector2Add(vec1, vec2);
    DrawText(format("Vector2Add: %s + %s = %s", vec1, vec2, sum).toStringz, 20, 20, 20, Colors.BLACK);
    EndDrawing();
		x+=1;
		y+=1;
  }

  writeln("Ending a raylib example.");
}
