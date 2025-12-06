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
document.addEventListener('DOMContentLoaded', function() {
  // Zoek de lijst met bestellingen in de aside
  var orderList = document.querySelector('.order-list');
  if (!orderList) return;

  // Alle formulieren die de hoeveelheid updaten
  var updateForms = orderList.querySelectorAll('form[action="/bestel/update"]');

  updateForms.forEach(function(form) {
    var select = form.querySelector('select[name="amount"]');
    if (!select) return;

    // 🔧 Oude inline handler uitschakelen (onchange="this.form.submit()")
    select.onchange = null;

    select.addEventListener('change', function (event) {
      event.preventDefault();

      var formData = new FormData(form);
      var body = new URLSearchParams();
      formData.forEach(function(value, key) {
        body.append(key, value.toString());
      });

      fetch(form.action, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: body
      })
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Netwerkfout bij updaten winkelmand');
          }
          return response.json();
        })
        .then(function(data) {
          if (!data || !data.success) {
            return;
          }

          // ✅ Totaalprijs in de aside updaten
          var totalEl = document.querySelector('.total h2');
          if (totalEl && typeof data.totalPrice === 'number') {
            totalEl.textContent = 'Totaal: €' + data.totalPrice.toFixed(2);
          }

          // ✅ Aantal items bij het winkelmand-icoon updaten
          var countEl = document.querySelector('.cart-count');
          if (countEl && typeof data.totalItems === 'number') {
            countEl.textContent = data.totalItems;
          }
        })
        .catch(function(error) {
          console.error(error);
        });
    });
  });
});
