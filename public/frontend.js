let data = null;
let filterType = null;
let filterValue = null;
let updateProductId = null;

const table = document.getElementById("table");
const tableBody = document.getElementById("table-body");
const popup = document.getElementById("popup");
const popupUpload = document.getElementById("popup-upload");
const popupUpdateDelivery = document.getElementById("popup-update-delivery");
const loading = document.getElementById("loading");
const getXlsxBtn = document.getElementById("get-xlsx");
const updateProductForm = document.getElementById("update-product-form");
const updateDeliveryForm = document.getElementById("update-delivery-form");
const uploadXlsxBtn = document.getElementById("upload-xlsx");
const uploadXlsxForm = document.getElementById("upload-xlsx-form");
const articulsItog = document.getElementById("articuls-itog");
const countItog = document.getElementById("count-itog");
const volumeItog = document.getElementById("volume-itog");
const firstSelect = document.getElementById("first-step");
const secondSelect = document.getElementById("second-step");

const volumeInput = document.querySelector('input[name="volume"]');
const formFirstInput = document.querySelector('input[name="productTitleProvider"]');

const arrayRender = (array, templateCallback) => {
  return array.map(templateCallback).join("");
};

const filter = (type, value) => {
  return data.filter((i) => i[type] === value && i.checked === true);
};

const createDate = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();

  const createText = (number) => (number < 10 ? `0${number}` : `${number}`);

  const dayText = createText(day);
  const monthText = createText(month + 1);

  return `${dayText}-${monthText}`;
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
      <td class="delivery ${+i.delivery === 0 ? "" : "highlighted c-pointer"}" data-id=${i.id}>${i.delivery}</td>
      <td class="volume">${i.volume}</td>
      <td class="volume-summ">${(i.volume * i.delivery).toFixed(3)}</td>
      <td class="update"><button id="update-product" data-id="${i.id}">Редактировать</button></td>
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
  loading.classList.add("active");

  const response = await fetch("http://141.8.193.46/api");

  data = await response.json();

  loading.classList.remove("active");

  render(data);
};

uploadXlsxBtn.addEventListener("click", () => {
  popupUpload.classList.add("active");
});

tableBody.addEventListener("click", async (e) => {
  if (e.target.closest("#update-product")) {
    updateProductId = +e.target.dataset.id;
    popup.classList.add("active");
    formFirstInput.focus();
  }
  if (e.target.closest(".delivery.highlighted ")) {
    updateProductId = +e.target.dataset.id;
    popupUpdateDelivery.classList.add("active");
  }
  if (e.target.closest(`input[type="checkbox"]`)) {
    const id = e.target.dataset.id;
    const checked = e.target.checked;
    const response = await fetch(`http://141.8.193.46/api/update-checked/${id}?checked=${checked}`);
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

updateProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = document.querySelectorAll(".form input[type='text']");

  [...inputs].forEach((i) => {
    i.value = i.value.trim();
  });

  const formData = new FormData(e.target);

  popup.classList.remove("active");
  loading.classList.add("active");

  const response = await fetch(`http://141.8.193.46/api/update-product/${updateProductId}`, {
    method: "POST",
    body: formData,
  });

  data = await response.json();

  const inputElems = updateProductForm.querySelectorAll("input");

  [...inputElems].forEach((i) => (i.value = ""));

  loading.classList.remove("active");

  render(data);
});

updateDeliveryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const delivery = formData.get("update-delivery");

  popupUpdateDelivery.classList.remove("active");
  loading.classList.add("active");

  const response = await fetch(`http://141.8.193.46/api/update-delivery/${updateProductId}?delivery=${delivery}`);

  data = await response.json();

  loading.classList.remove("active");

  render(data);
});

uploadXlsxForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  popupUpload.classList.remove("active");
  loading.classList.add("active");

  const response = await fetch("http://141.8.193.46/api/upload-xlsx", {
    method: "POST",
    body: formData,
  });

  data = await response.json();

  loading.classList.remove("active");

  render(data);
});

getXlsxBtn.addEventListener("click", async () => {
  await fetch(`http://141.8.193.46/api/create-book?filterType=${filterType}&filterValue=${filterValue}`);
  window.open(`http://141.8.193.46/${createDate()}-${filterValue.trim()}.xlsx`, "_blank");
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

  if (filterType === "productTitleProvider" || !filteredData.length) getXlsxBtn.style.display = "none";
  else getXlsxBtn.style.display = "";
  renderTableBody(filteredData);
  renderCalculateData();
});

volumeInput.addEventListener("change", (e) => {
  volumeInput.value = e.target.value.replace(/\,/, ".");
});

start();
