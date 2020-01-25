const hideForOneSec = function () {
  const wateringCan = document.querySelector('#watering-can');
  wateringCan.style.visibility = "hidden";
  setTimeout(() => wateringCan.style.visibility = "visible", 1000);
}