 Phase 1: Core Game Structure & Object Definitions

1) Set up the Project
  
  Initialize a project with P5.js and Matter.js.
  Create an HTML/CSS layout with a canvas and UI elements.

2) Define Core Classes & Structures
  
  Implement BaseBlock, SquareBlock, and CircleBlock.
  Implement AttachmentPoint logic.
  Implement Joint mechanics.
  Implement BaseController and specific controllers (KeyDown, KeyUp, KeyPressed).

3) Global State & Data Management

  Create arrays for squareBlocks, circleBlocks, maskingJoints, nonMaskingJoints, and controllers.
  Implement add/remove functions for blocks, joints, and controllers.
🎨
Phase 2: UI & Building Mode (Snap-to-Grid, Placement, Jointing)

4) Implement Block Placement with Snap-to-Grid
  
  Implement mouse-based block placement.
  Ensure block positions align correctly on a grid.

5) Attachment Point Detection & Highlighting

  Implement nearest attachment point logic.
  Display attachment points visually when selecting/joining blocks.

6) Implement Joint Creation System

  Allow selecting two blocks and joining them at valid attachment points.
  Ensure rigid body behavior in Matter.js for joints.

7) Implement UI for Controller Selection

  UI for choosing keybinds, controller type, and joint assignment.
  Store assigned controllers in the global controllers array.
  
🕹️ Phase 3: Play Mode (Physics & Controls Integration)

8) Implement Physics System Toggle
  
  Disable physics in Building Mode.
  Enable physics in Play Mode when simulation starts.

9) Implement Controller-Based Rotations

  Apply correct rotations when keys are pressed based on controller type.

10) Ensure Blocks Stay Attached in Play Mode
  
  Prevent blocks from separating when joints are applied.
  Ensure masking joints stop block collisions.

💾 Phase 4: Enhancements & Debugging

11) Improve UI & Visual Feedback

  Add UI for switching between modes (Build & Play).
  Show selected joints and blocks clearly.

12) Debugging & Optimization

  Add debugging tools for physics visualization.
  Optimize performance for multiple blocks and joints.

13) (Optional) Implement Local Storage

  Save and load vehicle designs if needed.

14) Final Testing & Refinements

  Ensure smooth UI/UX for adding/removing blocks, joints, and controllers.
  Test physics accuracy and responsiveness.

🚀 Phase 5: Deployment & Future Features

15) Prepare for Deployment

  Optimize performance, clean up the code, and prepare for hosting.

17) Future Enhancements (Optional)

  Add more block types (triangles, etc.).
  Add an export/import system for vehicle designs.
  Add terrain, obstacles, or challenges for the vehicle to navigate.

--------------------------------------------------------------------------------------


BaseBlock.js → Contains BaseBlock, SquareBlock, and CircleBlock classes.
AttachmentPoint.js → Contains AttachmentPoint class.
Joint.js → Contains Joint class.
BaseController.js → Contains BaseController class.
Controllers.js → Contains KeyDownControllerRotationClockwise, KeyDownControllerRotationAntiClockwise, KeyUpControllerRotationClockwise, KeyUpControllerRotationAntiClockwise, KeyPressedControllerRotationClockwise, and KeyPressedControllerRotationAntiClockwise classes.
GameManager.js → Manages game modes (Building Mode, Play Mode).
PhysicsManager.js → Handles physics logic with Matter.js.
UIManager.js → Manages UI interactions like selecting blocks, joints, and controllers.
InputHandler.js → Listens for keyboard and mouse inputs.
MathUtils.js → Helper functions for attachment point calculations.
Renderer.js → Handles rendering of blocks and joints using p5.js.
index.js → The main entry file that initializes the game, loads assets, and manages setup.