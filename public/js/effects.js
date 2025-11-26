function simpleAutoScroll() {
    if (window.innerWidth > 768) return;
    
    const topItems = document.getElementById('topitems');
    const articles = topItems.querySelectorAll('article');
    let currentIndex = 0;

    
    topItems.scrollTo({ left: 0, behavior: 'auto' });

    setInterval(() => {
        currentIndex = (currentIndex + 1) % articles.length;
        
        
        const articleWidth = articles[0].offsetWidth + 16; 
        const scrollPos = currentIndex * articleWidth;
        
        topItems.scrollTo({
            left: scrollPos,
            behavior: 'smooth'
        });
        
        console.log('Scrolling to index:', currentIndex, 'Position:', scrollPos); 
    }, 3000);
}


document.addEventListener('DOMContentLoaded', function() {
    setTimeout(simpleAutoScroll, 500); 
});