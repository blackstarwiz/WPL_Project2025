const active = document.querySelector(".activeForm"); /* css toggle */

const reg = document.querySelector("#aanmeldform"); /* span--inlog */
const log = document.querySelector("#inlogForm"); /* span--reg */

const log_div = document.querySelector("#login-div");
const reg_div = document.querySelector("#registreer-div");

function showLogin(){
  
  if(log_div) log_div.classList.remove("hiddenLog");
  if(reg_div) reg_div.classList.add("hiddenLog"); 
}

function showRegister(){
  
  if(reg_div) reg_div.classList.remove("hiddenLog");
  if(log_div) log_div.classList.add("hiddenLog");  
}


if (reg && log && log_div && reg_div){
  showLogin();

  reg.addEventListener("click", (e) =>{
    e.preventDefault();
    showRegister();
  })

  log.addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
  })
}

