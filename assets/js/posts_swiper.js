
var swiper = new Swiper(".mySwiper", {
  speed: 600,
loop: true,
autoplay: {
delay: 1500,//slides shifting time
disableOnInteraction: false
},
slidesPerView: 'auto',
pagination: {
el: '.swiper-pagination',
type: 'bullets',
clickable: true
},
breakpoints: {
  //screen size, when below 320, then show one slide per view
320: {
  slidesPerView: 1,
  spaceBetween: 40
},

// //screen size, when up to 960, then show 2 slides per view
960: {
  slidesPerView: 2,
  spaceBetween: 10,
}
}
});