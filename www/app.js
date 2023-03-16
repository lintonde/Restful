(function () {  
  let items = []; 
  if (items.length <= 0) {
    let isLive = true;
    let path = (isLive) ? 'https://food-express.onrender.com/api/products' : 'http://localhost/api/products';
    const top = document.querySelector('.item--top');
    top.classList.add('hidden');
    fetch(path)
      .then(response => response.json())
      .then(data => {     
        for (var i = data.length - 1; i >= 0; i--) {
          if (data[i]["images"].length > 0) {
            items.push(data[i]);
          }
        }
        init();
        document.querySelector('.loader').style.display = 'none';
      }).catch(error => {
        console.log(error)
      });
  }
  const dataProvider = (function* () {
    while (true) {
      yield* items;
    }
  })();

  function adjustSwipeItems() {
    const top = document.querySelector('.item--top');
    const next = document.querySelector('.item--next');
    next.classList.add('hidden');
    top.style.cssText = '';
    top.style.position = 'relative';
    const topR = top.getBoundingClientRect();
    top.style.position = '';    
    next.classList.remove('hidden');
    top.style.top = next.style.top = `${topR.top}px`;
    top.style.width = next.style.width = `${topR.width}px`;
    top.style.height = next.style.height = `${topR.height}px`;
    top.onResize();
    next.onResize();
  }

  function updateCards(event) {
    const top = document.querySelector('.item--top');
    window.ga && ga('send', 'event', `item-${top.data.id}`, event.detail);
    const next = document.querySelector('.item--next');
    top.style.transform = '';
    top.selected = 0;
    top.data = next.data;
    next.data = dataProvider.next().value;
  }

  function installServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js');
  }

  function init() {
    const top = document.querySelector('.item--top');
    top.classList.remove('hidden');
    top.data = dataProvider.next().value;
    top.addEventListener('swipe', updateCards);    
    const next = document.querySelector('.item--next');
    next.data = dataProvider.next().value;
    adjustSwipeItems();
    window.addEventListener('resize', adjustSwipeItems);
    installServiceWorker();      
  }
})();
