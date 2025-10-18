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