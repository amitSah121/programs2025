import pygame
import sys

# Initialize Pygame
pygame.init()

# Window size
WIDTH, HEIGHT = 640, 480
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Minimal Pygame Example")

# Colors
BLACK = (0, 0, 0)
RED = (255, 0, 0)

# Rectangle setup
rect_x, rect_y = WIDTH // 2, HEIGHT // 2
rect_w, rect_h = 50, 50
rect_speed = 5

# Clock for controlling frame rate
clock = pygame.time.Clock()

# Main loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Key press handling
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:
        rect_x -= rect_speed
    if keys[pygame.K_RIGHT]:
        rect_x += rect_speed
    if keys[pygame.K_UP]:
        rect_y -= rect_speed
    if keys[pygame.K_DOWN]:
        rect_y += rect_speed

    # Clear screen
    screen.fill(BLACK)

    # Draw rectangle
    pygame.draw.rect(screen, RED, (rect_x, rect_y, rect_w, rect_h))

    # Update display
    pygame.display.flip()

    # Limit to 60 FPS
    clock.tick(60)

# Quit Pygame
pygame.quit()
sys.exit()
