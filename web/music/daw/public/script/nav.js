const nav_menu = (name) => {
  w3.toggleClass(`#nav-${name} #options`, "w3-show");
};

const openMainTab = (name) => {
  if (name == "timeline") {
    w3.addClass("#noteMatrixView", "w3-hide");
    w3.removeClass("#nav-notematrix", "w3-aqua");
    w3.addClass("#nav-notematrix", "w3-white");

    w3.removeClass("#timelineView", "w3-hide");
    w3.addClass("#nav-timeline", "w3-aqua");
    w3.removeClass("#nav-timeline", "w3-white");

    w3.hide("#noteMatrixMenubar");
    w3.show("#timelineMenubar");
  } else {
    w3.removeClass("#noteMatrixView", "w3-hide");
    w3.addClass("#nav-notematrix", "w3-aqua");
    w3.removeClass("#nav-notematrix", "w3-white");

    w3.addClass("#timelineView", "w3-hide");
    w3.removeClass("#nav-timeline", "w3-aqua");
    w3.addClass("#nav-timeline", "w3-white");

    w3.show("#noteMatrixMenubar");
    w3.hide("#timelineMenubar");
  }
};
