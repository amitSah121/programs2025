import bindbc.sdl;
import bindbc.loader;
import core.stdc.stdlib : exit;
import std.stdio;

void main() {
    // Load SDL library dynamically
    // SDLSupport ret = loadSDL();
    // if (ret != sdlSupport) {
    //     if (ret == SDLSupport.noLibrary) {
    //         writeln("SDL library not found");
    //         exit(1);
    //     } else if (ret == SDLSupport.badLibrary) {
    //         writeln("Bad SDL library version");
    //         exit(1);
    //     }
    // }

    SDL_Window* window = null;
    SDL_Renderer* renderer = null;

    // Initialize SDL
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        writeln("SDL initialization failed");
        exit(1);
    }

    // Create window and renderer first
    if (SDL_CreateWindowAndRenderer("New Game",640*4, 480*4, 0, &window, &renderer) < 0) {
        writeln("Window/Renderer creation failed");
        SDL_Quit();
        exit(1);
    }

    // Set window title
    SDL_SetWindowTitle(window, "New Game");

    // Clear screen with black
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
    SDL_RenderClear(renderer);

    // Draw white point
    SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
    SDL_RenderDrawPoint(renderer, 640*2, 480*2);

    // Present the rendered frame
    SDL_RenderPresent(renderer);
    
    // Wait for 3 seconds
    SDL_Delay(3000);

    // Cleanup
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();
}