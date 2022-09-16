const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");

const output = document.querySelector(".output");
const outputBox = output.querySelector(".output-com");

validKeys = /[a-zA-Z0-9\/]/g;
function removeInvalidChars(string, chars) {
  return [...string].filter((elem) => elem.match(chars)).join("");
}

async function sendRequest() {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${inputBox.value}&per_page=5`
  );
  if (response.ok) {
    return response.json();
  }
  const error = await response.json().then((error) => {
    suggBox.innerHTML = "";
    searchWrapper.classList.add("active");
    suggBox.insertAdjacentHTML(
      "afterbegin",
      `
        <div class="error">${error.message}...</div>
        `
    );
  });
  setTimeout(() => {
    suggBox.innerHTML = "";
  }, 3000);
  const e = new Error("Ошибка запроса");
  e.data = error;
  throw e;
}

const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  };
};

function searchData(userData) {
  return sendRequest(userData)
    .then((responce) => responce.items)
    .then((data) => {
      if (!data) return;
      suggBox.innerHTML = "";
      const li = data.map((item) => {
        return `<li title="Click to add ${item.name}">${item.full_name}</li>`;
      });
      suggBox.insertAdjacentHTML(
        "afterbegin",
        `
      ${li.join("")}
      `
      );
      searchWrapper.classList.add("active");
      return data;
    })
    .then((data) => {
      let allList = suggBox.querySelectorAll("li");
      for (let i = 0; i < allList.length; i++) {
        allList[i].addEventListener("click", function (event) {
          suggBox.innerHTML = "";
          searchWrapper.classList.remove("active");
          output.classList.add("active");
          if (event.target) {
            data.forEach((item) => {
              if (event.target.textContent == item.full_name) {
                outputBox.insertAdjacentHTML(
                  "beforeend",
                  `<li>
                      <span class="name">Name: ${item.name}</span>
                      <span class="owner">Owner: ${item.owner.login}</span>
                      <span class="stars">Stars: ${item.stargazers_count}</span>
                      <img src="img/close-btn.png" alt="" class="output-img" />
                  </li>`
                );
              }
            });
          }

          const outputImg = outputBox.querySelectorAll("img");

          outputImg.forEach((item) => {
            item.addEventListener("click", function (event) {
              let target = event.target.closest("li");
              target.remove();
            });
          });
        });
      }
      return data;
    })
    .catch((error) => {
      console.error(error);
      return true;
    });
}

function getRepositories(event) {
  while (suggBox.firstChild) {
    suggBox.removeChild(suggBox.lastChild);
  }
  if (event.data !== null && !event.data.match(validKeys)) {
    event.target.value = removeInvalidChars(event.target.value, validKeys);
  }
  if (event.target.value.length !== 0) {
    searchData(event.target.value);
  }
}

getRepositories = debounce(getRepositories, 1000);

inputBox.addEventListener("input", getRepositories);
inputBox.addEventListener("click", (e) => (inputBox.value = ""));
inputBox.addEventListener("keydown", (event) => {
  if (event.keyCode === 8 || event.keyCode === 46) {
    suggBox.innerHTML = "";
  }
});
