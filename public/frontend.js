let data = null;
let filterType = null;
let filterValue = null;
let updateProductId = null;

const config = {
  URL: "http://141.8.193.46",
  API_URL: `http://141.8.193.46/api`,
};

// const config = {
//   URL: "http://localhost:3000",
//   API_URL: `http://localhost:3000/api`,
// };

const loading = document.getElementById("loading");

const table = document.getElementById("table");
const tableBody = document.getElementById("table-body");

const popup = document.getElementById("popup");
const popupCreate = document.getElementById("popup-create-product");
const popupUpload = document.getElementById("popup-upload");
const popupUpdateDelivery = document.getElementById("popup-update-delivery");

const createProductForm = document.getElementById("create-product-form");
const updateProductForm = document.getElementById("update-product-form");
const updateDeliveryForm = document.getElementById("update-delivery-form");
const uploadXlsxForm = document.getElementById("upload-xlsx-form");

const articulsItog = document.getElementById("articuls-itog");
const countItog = document.getElementById("count-itog");
const volumeItog = document.getElementById("volume-itog");

const firstSelect = document.getElementById("first-step");
const secondSelect = document.getElementById("second-step");

const uploadProductsBtn = document.getElementById("upload-products");
const createProductBtn = document.getElementById("create-product");
const getXlsxBtn = document.getElementById("get-xlsx");
const uploadXlsxBtn = document.getElementById("upload-xlsx");

const volumeInputs = document.querySelectorAll('input[name="volume"]');

const arrayRender = (array, templateCallback) => {
  return array.map(templateCallback).join("");
};

const filter = (type, value) => {
  return data.filter((i) => i[type] === value);
};

const createDate = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const createText = (number) => (number < 10 ? `0${number}` : `${number}`);

  const dayText = createText(day);
  const monthText = createText(month + 1);

  return `${dayText}${monthText}${year}`;
};

const calculate = () => {
  let articuls = 0,
    count = 0,
    volume = 0;
  const rows = document.querySelectorAll(".table-row");

  [...rows].forEach((row) => {
    const checkedInput = row.querySelector('input[type="checkbox"]');
    if (!checkedInput.checked) return;
    articuls++;
    const deliveryData = row.querySelector(".delivery");
    count += +deliveryData.textContent;

    const volumeData = row.querySelector(".volume-summ");
    volume += +volumeData.textContent;
  });

  return { articuls, count, volume };
};

const renderCalculateData = () => {
  const { articuls, count, volume } = calculate();

  articulsItog.textContent = articuls;
  countItog.textContent = count;
  volumeItog.textContent = volume.toFixed(3);
};

const renderTableBody = (items) => {
  const rows = arrayRender(items, (i) => {
    return `
    <tr class="table-row" >
      <td><input type="checkbox" ${i.checked ? "checked" : ""} data-id=${i.id}></td>
      <td class="SKU d-none">${i.SKU}</td>
      <td class="product-img">
            ${i.img ? `<img src="${i.img}" alt="${i.articleNumberOzon}" width="50" height="50">` : "Нет изображения"}
      </td>
      <td class="productTitleProvider">${i.productTitleProvider}</td>
      <td class="productTitleOzon d-none">${i.productTitleOzon}</td>
      <td class="warehouse">${i.warehouse}</td>
      <td class="articleNumberProvider">${i.articleNumberProvider}</td>
      <td class="articleNumberOzon ">${i.articleNumberOzon}</td>
      <td class="provider">${i.provider}</td>
      <td class="numberInBox ">${i.numberInBox}</td>
      <td class="minimum ">${i.minimum}</td>
      <td class="productInTransit">${i.productInTransit}</td>
      <td class="availableToSale">${i.availableToSale}</td>
      <td class="fullCount">${i.fullCount}</td>
      <td class="delivery c-pointer ${+i.delivery === 0 ? "" : "highlighted"}" data-id=${i.id}>${i.delivery}</td>
      <td class="volume">${i.volume}</td>
      <td class="volume-summ">${(i.volume * i.delivery).toFixed(3)}</td>
      <td class="update"><button id="update-product" data-id="${i.id}">Ред</button></td>
    </tr>
  `;
  });
  tableBody.innerHTML = rows;
};

const renderOptions = (value) => {
  secondSelect.innerHTML = `
    <option selected disabled>Выберите фильтр</option>
    <option value="empty">Без фильтра</option>
  `;

  const allOptions = data.map((i) => i[value]);

  const options = new Set(allOptions);

  const optionsList = arrayRender([...options], (o) => `<option value="${o}">${o}</option>`);

  secondSelect.insertAdjacentHTML("beforeend", optionsList);
};

const render = (data) => {
  renderTableBody(data);
  renderCalculateData();
};

const start = async () => {
  try {
    loading.classList.add("active");

    const response = await fetch(`${config.API_URL}`);

    data = await response.json();

    loading.classList.remove("active");

    render(data);
  } catch (error) {
    loading.classList.remove("active");
    return alert(`Что-то пошло не так, ${error.message}`);
  }
};

createProductBtn.addEventListener("click", () => {
  popupCreate.classList.add("active");
});

uploadXlsxBtn.addEventListener("click", () => {
  popupUpload.classList.add("active");
});

tableBody.addEventListener("click", async (e) => {
  if (e.target.closest("#update-product")) {
    updateProductId = +e.target.dataset.id;
    const updatingData = data.filter((elem) => elem.id === updateProductId)[0];

    updateProductForm.querySelector('input[name="productTitleProvider"]').value = updatingData.productTitleProvider;
    updateProductForm.querySelector('input[name="articleNumberProvider"]').value = updatingData.articleNumberProvider;
    updateProductForm.querySelector('input[name="provider"]').value = updatingData.provider;
    updateProductForm.querySelector('input[name="numberInBox"]').value = updatingData.numberInBox;
    updateProductForm.querySelector('input[name="volume"]').value = updatingData.volume;
    updateProductForm.querySelector('input[name="minimum"]').value = updatingData.minimum;

    popup.classList.add("active");
  }
  if (e.target.closest(".delivery ")) {
    updateProductId = +e.target.dataset.id;
    popupUpdateDelivery.classList.add("active");
  }
  if (e.target.closest(`input[type="checkbox"]`)) {
    const id = e.target.dataset.id;
    const checked = e.target.checked;
    const response = await fetch(`${config.API_URL}/update-checked/${id}?checked=${checked}`);
    data = await response.json();
    render(data);
  }
});

popup.addEventListener("click", (e) => {
  if (!e.target.closest(".form")) popup.classList.remove("active");
});

popupUpload.addEventListener("click", (e) => {
  if (!e.target.closest(".form")) popupUpload.classList.remove("active");
});

popupUpdateDelivery.addEventListener("click", (e) => {
  if (!e.target.closest(".form")) popupUpdateDelivery.classList.remove("active");
});

popupCreate.addEventListener("click", (e) => {
  if (!e.target.closest(".form")) popupCreate.classList.remove("active");
});

createProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = document.querySelectorAll(".form input[type='text']");

  [...inputs].forEach((i) => {
    i.value = i.value.trim();
  });

  const formData = new FormData(e.target);

  popupCreate.classList.remove("active");

  try {
    loading.classList.add("active");

    const response = await fetch(`${config.API_URL}/create-product`, {
      method: "POST",
      body: formData,
    });

    data = await response.json();

    const inputElems = createProductForm.querySelectorAll("input");

    [...inputElems].forEach((i) => (i.value = ""));

    loading.classList.remove("active");

    render(data);
  } catch (error) {
    loading.classList.remove("active");
    return alert(`Что-то пошло не так, ${error.message}`);
  }
});

updateProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = document.querySelectorAll(".form input[type='text']");

  [...inputs].forEach((i) => {
    i.value = i.value.trim();
  });

  const formData = new FormData(e.target);

  popup.classList.remove("active");
  try {
    loading.classList.add("active");

    const response = await fetch(`${config.API_URL}/update-product/${updateProductId}`, {
      method: "POST",
      body: formData,
    });

    data = await response.json();

    const inputElems = updateProductForm.querySelectorAll("input");

    [...inputElems].forEach((i) => (i.value = ""));

    loading.classList.remove("active");

    render(data);
  } catch (error) {
    loading.classList.remove("active");
    return alert(`Что-то пошло не так, ${error.message}`);
  }
});

updateDeliveryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const delivery = formData.get("update-delivery");

  popupUpdateDelivery.classList.remove("active");
  try {
    loading.classList.add("active");

    const response = await fetch(`${config.API_URL}/update-delivery/${updateProductId}?delivery=${delivery}`);

    data = await response.json();

    loading.classList.remove("active");

    render(data);
  } catch (error) {
    loading.classList.remove("active");
    return alert(`Что-то пошло не так, ${error.message}`);
  }
});

uploadXlsxForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    const ext = formData.get("xlsx").name.split(".").pop();

    if (ext !== "xlsx") return alert("Неверное расширение файла");

    popupUpload.classList.remove("active");
    loading.classList.add("active");

    const response = await fetch(`${config.API_URL}/upload-xlsx`, {
      method: "POST",
      body: formData,
    });

    data = await response.json();

    loading.classList.remove("active");

    render(data);
  } catch (error) {
    loading.classList.remove("active");
    return alert(`Файл не был загружен, ${error.message}`);
  }
});

getXlsxBtn.addEventListener("click", async () => {
  try {
    loading.classList.add("active");
    await fetch(`${config.API_URL}/create-book?filterType=${filterType}&filterValue=${filterValue}`);
    window.open(`${config.URL}/${createDate()}-${filterValue.trim()}.xlsx`, "_blank");
    loading.classList.remove("active");
  } catch (error) {
    loading.classList.remove("active");
    return alert(`Что-то пошло не так, ${error.message}`);
  }
});

uploadProductsBtn.addEventListener("click", async () => {
  try {
    loading.classList.add("active");

    const response = await fetch(`${config.API_URL}/upload-from-ozon`);

    data = await response.json();

    loading.classList.remove("active");

    render(data);
  } catch (error) {
    loading.classList.remove("active");
    return alert(`Что-то пошло не так, ${error.message}`);
  }
});

firstSelect.addEventListener("change", (e) => {
  filterType = e.target.value;
  if (filterType === "empty") {
    getXlsxBtn.style.display = "none";
    secondSelect.style.display = "none";
    renderTableBody(data);
    renderCalculateData();
    return;
  }

  if (filterType === "checked") {
    getXlsxBtn.style.display = "none";
    secondSelect.style.display = "none";
    renderTableBody(filter(filterType, true));
    renderCalculateData();
    return;
  }

  getXlsxBtn.style.display = "none";
  secondSelect.style.display = "";
  renderOptions(filterType);
});

secondSelect.addEventListener("change", (e) => {
  filterValue = e.target.value;

  if (filterValue === "empty") {
    getXlsxBtn.style.display = "none";
    return renderTableBody(data);
  }

  const filteredData = filter(filterType, filterValue);

  if (filterType === "productTitleProvider" || filterType === "articleNumberOzon" || !filteredData.length)
    getXlsxBtn.style.display = "none";
  else getXlsxBtn.style.display = "";
  renderTableBody(filteredData);
  renderCalculateData();
});

volumeInputs.forEach((i) => {
  i.addEventListener("change", (e) => {
    i.value = e.target.value.replace(/\,/, ".");
  });
});

start();
