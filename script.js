// Efek angka online random
const onlineUser = document.getElementById('onlineUser');

setInterval(() => {
  const randomUser = Math.floor(Math.random() * 900 + 100);
  onlineUser.innerHTML = `● ${randomUser} Online`;
}, 3000);

// Efek animasi card saat scroll
const cards = document.querySelectorAll('.feature-card');

window.addEventListener('scroll', () => {
  cards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;

    if(cardTop < window.innerHeight - 50){
      card.style.transform = 'translateY(0px)';
      card.style.opacity = '1';
    }
  });
});

cards.forEach(card => {
  card.style.transform = 'translateY(50px)';
  card.style.opacity = '0';
  card.style.transition = '0.5s';
});
