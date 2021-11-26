var swiper = new Swiper(".mySwiper", {
  slidesPerView: 4, //the number of post cards showing per view
  spaceBetween: 10,
  freeMode: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  loop: true
});
