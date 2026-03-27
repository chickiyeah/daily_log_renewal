// 햄버거 메뉴 클릭시
let toggleBT = document.querySelector(".nav_toogleBT");
let menu = document.querySelector(".navbar_menu");

toggleBT.addEventListener("click", () => {
  console.log(1);
  menu.classList.toggle("active");
});
