const navOptiesMobile = document.getElementById("navOptiesMobile");
const menuToggle = document.getElementById("menuToggle");
const logoheader = document.getElementById("logoheader");
const menuOverlay = document.getElementById("menuOverlay");
const uren = document.getElementById("openingUren_nav")

menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();

  const isOpen = navOptiesMobile.classList.toggle("show");
  logoheader.classList.toggle("open", isOpen);
  menuToggle.classList.toggle("open", isOpen);
  menuOverlay.classList.toggle("show", isOpen);
  uren.classList.remove("hidden", isOpen);
});

menuOverlay.addEventListener("click", () => {
  navOptiesMobile.classList.remove("show");
  logoheader.classList.remove("open");
  menuToggle.classList.remove("open");
  menuOverlay.classList.remove("show");
  uren.classList.toggle("hidden", isOpen);
});

document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('.aside-toggle');
    const aside = document.querySelector('main aside');
    const overlay = document.querySelector('.aside-overlay');
    const closeBtn = document.querySelector('.close-aside');
    
    if (toggleBtn && aside) {
        toggleBtn.addEventListener('click', function() {
            aside.classList.toggle('show');
            overlay.classList.toggle('show');
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                aside.classList.remove('show');
                overlay.classList.remove('show');
            });
        }
        
        overlay.addEventListener('click', function() {
            aside.classList.remove('show');
            overlay.classList.remove('show');
        });
    }
});

// Popup review
document.addEventListener('DOMContentLoaded', function() {
    const viewAllBtn = document.querySelector('.view-all-btn');
    const popup = document.getElementById('allReviewsPopup');
    const closeBtn = document.querySelector('.close-btn');
    
    viewAllBtn.addEventListener('click', function() {
        popup.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', function() {
        popup.style.display = 'none';
    });
    
    // Sluit popup wanneer er buiten geklikt wordt
    window.addEventListener('click', function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
});

// Popup functionaliteit
document.addEventListener('DOMContentLoaded', function() {
    // Elementen
    const addReviewBtn = document.querySelector('.add-btn');
    const viewAllBtn = document.querySelector('.view-all-btn');
    const addReviewPopup = document.getElementById('addReviewPopup');
    const allReviewsPopup = document.getElementById('allReviewsPopup');
    const closeButtons = document.querySelectorAll('.close-btn');
    const addReviewForm = document.getElementById('addReviewForm');
    
    // Open popup voor review toevoegen
    addReviewBtn.addEventListener('click', function() {
        addReviewPopup.style.display = 'block';
    });
    
    // Open popup voor alle reviews
    viewAllBtn.addEventListener('click', function() {
        allReviewsPopup.style.display = 'block';
    });
    
    // Sluit popups
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            addReviewPopup.style.display = 'none';
            allReviewsPopup.style.display = 'none';
        });
    });
    
    // Sluit popup wanneer er buiten geklikt wordt
    window.addEventListener('click', function(event) {
        if (event.target === addReviewPopup) {
            addReviewPopup.style.display = 'none';
        }
        if (event.target === allReviewsPopup) {
            allReviewsPopup.style.display = 'none';
        }
    });
    
    // Form submit handler
    addReviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('reviewName').value;
        const reviewText = document.getElementById('reviewText').value;
        
        try {
            const response = await fetch('/reviews/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    naam: name,
                    review: reviewText,
                    profielfoto: 'default-user.png' // default profielfoto
                })
            });
            
            if (response.ok) {
                // Success - herlaad de pagina om nieuwe review te tonen
                window.location.reload();
            } else {
                alert('Er ging iets mis bij het toevoegen van de review');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Er ging iets mis bij het toevoegen van de review');
        }
    });
});