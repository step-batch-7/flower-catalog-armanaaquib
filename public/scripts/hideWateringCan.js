const hideWateringCan = function () {
  const wateringCan = document.querySelector('#watering-can');
  wateringCan.style.visibility = 'hidden';

  const oneSecond = 1000;
  setTimeout(() => {
    wateringCan.style.visibility = 'visible';
  }, oneSecond);
};
