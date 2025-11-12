import sys
import sdl2.ext

IMGS = sdl2.ext.Resources(__file__, "res","imgs")

def run():
    sdl2.ext.init()
    window = sdl2.ext.Window("Hello World!", size=(640, 480))
    window.show()

    factory = sdl2.ext.SpriteFactory(sdl2.ext.SOFTWARE)
    sprite = factory.from_image(IMGS.get_path("3.png"))

    spriterenderer = factory.create_sprite_render_system(window)
    

    running = True
    while running:
        events = sdl2.ext.get_events()
        for event in events:
            if event.type == sdl2.SDL_QUIT:
                running = False
                break
            elif event.type == sdl2.SDL_KEYDOWN:
                x,y = sprite.position
                if event.key.keysym.sym == sdl2.SDLK_UP:
                    sprite.position = x,y+5
                elif event.key.keysym.sym == sdl2.SDLK_DOWN:
                    sprite.position = x,y-5
        sdl2.ext.fill(spriterenderer, sdl2.ext.Color(0, 0, 0))
        spriterenderer.render(sprite)

        window.refresh()
    return 0

if __name__ == "__main__":
    sys.exit(run())