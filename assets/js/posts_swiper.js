var swiper = new Swiper('.swiper-container', {
  pagination: '.swiper-pagination',
  effect: 'coverflow',
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 'auto',
  coverflowEffect: {
    rotate:10,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows : true
  },
  loop: true,
  autoplay: {
    delay: 1500,//slides shifting time
    disableOnInteraction: false
  },
});