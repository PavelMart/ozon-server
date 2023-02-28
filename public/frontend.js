let data = null;
let filterType = null;
let filterValue = null;

const table = document.getElementById("table");
const tableBody = document.getElementById("table-body");
const popup = document.getElementById("popup");
const loading = document.getElementById("loading");
const createProductBtn = document.getElementById("create-product");
const getDataBtn = document.getElementById("get-data");
const getXlsxBtn = document.getElementById("get-xlsx");
const createProductForm = document.getElementById("create-product-form");
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
  return data.filter((i) => i[type] === value);
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
  volumeItog.textContent = volume;
};

const renderTableBody = (items) => {
  const rows = arrayRender(items, (i) => {
    return `
    <tr class="table-row" data-id="${i.id}">
      <td><input type="checkbox" checked></td>
      <td class="SKU ">${i.SKU}</td>
      <td class="productTitleProvider">${i.productTitleProvider}</td>
      <td class="productTitleOzon ">${i.productTitleOzon}</td>
      <td class="warehouse">${i.warehouse}</td>
      <td class="articleNumberProvider">${i.articleNumberProvider}</td>
      <td class="articleNumberOzon ">${i.articleNumberOzon}</td>
      <td class="provider">${i.provider}</td>
      <td class="numberInBox ">${i.numberInBox}</td>
      <td class="minimum ">${i.minimum}</td>
      <td class="productInTransit">${i.productInTransit}</td>
      <td class="availableToSale">${i.availableToSale}</td>
      <td class="fullCount">${i.fullCount}</td>
      <td class="delivery">${i.delivery}</td>
      <td class="volume ">${i.volume}</td>
      <td class="volume-summ">${i.volume * i.delivery}</td>
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

table.addEventListener("click", (e) => {
  if (e.target.closest('input[type="checkbox"]')) renderCalculateData();
});

createProductBtn.addEventListener("click", () => {
  popup.classList.add("active");
  formFirstInput.focus();
});

popup.addEventListener("click", (e) => {
  if (!e.target.closest(".form")) popup.classList.remove("active");
});

createProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = document.querySelectorAll(".form input[type='text']");

  [...inputs].forEach((i) => {
    i.value = i.value.trim();
  });

  const formData = new FormData(e.target);

  popup.classList.remove("active");
  loading.classList.add("active");

  const response = await fetch("http://141.8.193.46/api/create-product", {
    method: "POST",
    body: formData,
  });

  data = await response.json();

  const inputElems = createProductForm.querySelectorAll("input");

  [...inputElems].forEach((i) => (i.value = ""));

  loading.classList.remove("active");

  render(data);
});

getXlsxBtn.addEventListener("click", async () => {
  await fetch(`http://141.8.193.46/api/create-book?filterType=${filterType}&filterValue=${filterValue}`);
  window.open(`http://141.8.193.46/${createDate()}-${filterValue.trim()}.xlsx`, "_blank");
});

getDataBtn.addEventListener("click", start);

firstSelect.addEventListener("change", (e) => {
  filterType = e.target.value;
  if (filterType === "empty") {
    getXlsxBtn.style.display = "none";
    secondSelect.style.display = "none";
    return renderTableBody(data);
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

  getXlsxBtn.style.display = "";
  renderTableBody(filter(filterType, filterValue));
  renderCalculateData();
});

volumeInput.addEventListener("change", (e) => {
  volumeInput.value = e.target.value.replace(/\,/, ".");
});

start();
