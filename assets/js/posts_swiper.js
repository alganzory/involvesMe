var swiper = new Swiper(".mySwiper", {
  slidesPerView: 2, //the number of post cards showing per view
  spaceBetween: 10,
  freeMode: true,
  pagination: {
    el: ".swiper-pagination",
    type: 'bullets',
    clickable: true,
  },
  
  autoplay: {
    delay: 3000,//slides shifting time
    disableOnInteraction: false
  },
  loop: true,
});