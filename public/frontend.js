let data = null;
let filterType = null;
let filterValue = null;
let updateProductId = null;
let firstWarehouse = null;
let articleForUpdate = null;

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

const createProductForm = document.getElementById("create-product-form");
const updateProductForm = document.getElementById("update-product-form");
const updateDeliveryForm = document.getElementById("update-delivery-form");
const updateApiKeyForm = document.getElementById("update-api-key-form");
const updateArticleForm = document.getElementById("update-article-form");
const uploadXlsxForm = document.getElementById("upload-xlsx-form");
const summWarehouseForm = document.getElementById("summ-warehouse-form");

const articulsItog = document.getElementById("articuls-itog");
const countItog = document.getElementById("count-itog");
const volumeItog = document.getElementById("volume-itog");

const firstSelect = document.getElementById("first-step");
const secondSelect = document.getElementById("second-step");
const articleForUpdateSelect = document.getElementById("article-for-update");
const mainWarehouseSelect = document.getElementById("main-warehouse");
const secondWarehousesSelect = document.getElementById("second-warehouses");

const buttonsBlock = document.querySelector(".buttons");
const getXlsxBtn = document.getElementById("get-xlsx");

const volumeInputs = document.querySelectorAll('input[name="volume"]');

const arrayRender = (array, templateCallback) => {
  return array.map(templateCallback).join("");
};

const filterData = () => {
  const filterType = localStorage.getItem("filterType");
  const filterValue = localStorage.getItem("filterValue");

  if (filterType && filterType !== "empty" && filterValue !== "empty") {
    if (filterType === "checked") {
      return data.filter((i) => i[filterType] === true);
    } else {
      firstSelect.value = filterType;
      secondSelect.value = filterValue;
      let returnData = data.filter((i) => i[filterType] === filterValue);

      if (filterType === "warehouse" || filterType === "provider")
        return returnData.sort((a) => {
          if (a.checked) return -1;
          else return 1;
        });
      else return returnData;
    }
  }
  return data;
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

const calculate = (array) => {
  const atricleItems = array.filter((elem) => elem.checked);
  const articles = new Set(atricleItems.map((elem) => elem.articleNumberOzon));
  const count = atricleItems.reduce((summ, elem) => summ + +elem.delivery, 0);
  const volume = atricleItems.reduce((summ, elem) => elem.delivery * elem.volume + summ, 0);

  return { articles: [...articles].length, count, volume };
};

const renderCalculateData = (array) => {
  const { articles, count, volume } = calculate(array);

  articulsItog.textContent = articles;
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
            ${i.img ? `<img src="${i.img}" alt="${i.articleNumberOzon}" width="49" height="49">` : "-"}
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

const getUniqueOptions = (value) => {
  const allOptions = data.map((i) => i[value]);

  const options = new Set(allOptions);

  return arrayRender([...options], (o) => `<option value="${o}">${o}</option>`);
};

const renderOptions = (value) => {
  secondSelect.innerHTML = `
    <option selected disabled>Выберите фильтр</option>
    <option value="empty">Без фильтра</option>
  `;

  const optionsList = getUniqueOptions(value);

  secondSelect.insertAdjacentHTML("beforeend", optionsList);
};

const renderSelectOptions = (select, value, without) => {
  let options;
  select.innerHTML = "<option selected disabled>Выберите значение</option>";
  const allOptions = data.map((i) => i[value]);
  options = new Set(allOptions);

  if (without) options = [...options].filter((i) => i !== firstWarehouse);

  select.insertAdjacentHTML(
    "beforeend",
    arrayRender([...options], (o) => `<option value="${o}">${o}</option>`)
  );
};

const renderMainWarehouseOptions = () => {
  renderSelectOptions(mainWarehouseSelect, "warehouse");
};

const renderSecondWarehouseOptions = (firstWarehouse) => {
  const allOptions = data.map((i) => i["warehouse"]);
  const uniqueOptions = new Set(allOptions);
  const options = [...uniqueOptions].filter((i) => i !== firstWarehouse);

  secondWarehousesSelect.innerHTML = `<p style="margin-bottom: 10px">Выберите склады, из которых хотите добавить товары</p>`;
  secondWarehousesSelect.insertAdjacentHTML(
    "beforeend",
    arrayRender(
      [...options],
      (o) => `<label>
              <input type="checkbox" value="${o}"/>
              ${o}
            </label>`
    )
  );
};

const render = () => {
  const filteredData = filterData();
  renderTableBody(filteredData);
  renderCalculateData(filteredData);
  renderMainWarehouseOptions();
  renderSelectOptions(articleForUpdateSelect, "articleNumberOzon");
};

const resetAll = () => {
  localStorage.removeItem("filterType");
  localStorage.removeItem("filterType");
  getXlsxBtn.style.display = "none";
  secondSelect.style.display = "none";
  firstSelect.value = "empty";
};

const start = async () => {
  resetAll();
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

const uploadProductsFromOzon = async () => {
  await getData("upload-from-ozon");
  render();
};

const openPopup = (form) => {
  form.style.display = "flex";
  popup.classList.add("active");
};

const closePopup = () => {
  [...document.querySelectorAll(".form")].forEach((elem) => (elem.style.display = "none"));
  popup.classList.remove("active");
};

buttonsBlock.addEventListener("click", async (e) => {
  if (e.target.closest("#create-product")) openPopup(createProductForm);
  if (e.target.closest("#upload-xlsx")) openPopup(uploadXlsxForm);
  if (e.target.closest("#update-api-key")) openPopup(updateApiKeyForm);
  if (e.target.closest("#summ-warehouse")) openPopup(summWarehouseForm);
  if (e.target.closest("#update-article")) openPopup(updateArticleForm);
  if (e.target.closest("#upload-products")) uploadProductsFromOzon();
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

    openPopup(updateProductForm);
  }
  if (e.target.closest(".delivery ")) {
    updateProductId = +e.target.dataset.id;
    openPopup(updateDeliveryForm);
  }
  if (e.target.closest(`input[type="checkbox"]`)) {
    const id = e.target.dataset.id;
    const checked = e.target.checked;
    try {
      const response = await fetch(`${config.API_URL}/update-checked/${id}?checked=${checked}`);

      data = await response.json();

      render();
    } catch (error) {
      return alert(`Что-то пошло не так, ${error.message}`);
    }
  }
});

popup.addEventListener("click", (e) => {
  if (!e.target.closest(".form")) closePopup();
});

const deleteSpaces = (form) => {
  const inputs = form.querySelectorAll("input[type='text']");

  [...inputs].forEach((i) => {
    i.value = i.value.trim();
  });
};

const clearInputs = (form) => {
  const inputElems = form.querySelectorAll("input");

  [...inputElems].forEach((i) => (i.value = ""));
};

const postData = async (e, address, addDataArray) => {
  e.preventDefault();

  deleteSpaces(e.target);

  const body = new FormData(e.target);

  if (addDataArray) {
    addDataArray.forEach((data) => {
      body.append("second-warehouses", data);
    });
  }

  closePopup();
  try {
    loading.classList.add("active");

    const response = await fetch(`${config.API_URL}/${address}`, {
      method: "POST",
      body,
    });

    if (response.status === 400) return alert(`Что-то пошло не так, ${error.message}`);

    data = await response.json();

    clearInputs(e.target);

    loading.classList.remove("active");

    return;
  } catch (error) {
    loading.classList.remove("active");
    return alert(`Что-то пошло не так, ${error.message}`);
  }
};

const getData = async (address) => {
  closePopup();

  try {
    loading.classList.add("active");

    const response = await fetch(`${config.API_URL}/${address}`);

    const json = await response.json();

    if (response.status === 400) return alert(`Что-то пошло не так, ${error.message}`);

    if (response.status !== 400 && typeof json === "object") data = json;

    loading.classList.remove("active");
  } catch (error) {
    loading.classList.remove("active");
    return alert(`Что-то пошло не так, ${error.message}`);
  }
};

createProductForm.addEventListener("submit", async (e) => {
  await postData(e, "create-product");
  resetAll();
  render();
});

updateProductForm.addEventListener("submit", async (e) => {
  await postData(e, `update-product/${updateProductId}`);
  render();
});

updateDeliveryForm.addEventListener("submit", async (e) => {
  await postData(e, `update-delivery/${updateProductId}`);
  render();
});

updateApiKeyForm.addEventListener("submit", async (e) => {
  await postData(e, "update-api-key");
});

uploadXlsxForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const ext = formData.get("xlsx").name.split(".").pop();

  if (ext !== "xlsx") alert("Неверное расширение файла");
  else {
    await postData(e, "upload-xlsx");
    resetAll();
    render();
  }
});

summWarehouseForm.addEventListener("submit", async (e) => {
  const checkboxes = secondWarehousesSelect.querySelectorAll("input");
  const checkboxesValues = [...checkboxes].filter((c) => c.checked).map((c) => c.value);

  await postData(e, "summ-warehouses", checkboxesValues);
  secondWarehousesSelect.style.display = "none";
  resetAll();
  render();
});

updateArticleForm.addEventListener("submit", async (e) => {
  await postData(e, "update-articles");
  resetAll();
  render();
});

getXlsxBtn.addEventListener("click", async () => {
  await getData(`create-book?filterType=${filterType}&filterValue=${filterValue}`);

  window.open(`${config.URL}/${createDate()}-${filterValue.trim()}.xlsx`, "_blank");

  setTimeout(() => getData(`delete-book?name=${createDate()}-${filterValue.trim()}.xlsx`), 10000);

  render();
});

firstSelect.addEventListener("change", (e) => {
  filterType = e.target.value;

  localStorage.setItem("filterType", filterType);

  if (filterType === "empty") {
    getXlsxBtn.style.display = "none";
    secondSelect.style.display = "none";
    render();
    return;
  }

  if (filterType === "checked") {
    getXlsxBtn.style.display = "none";
    secondSelect.style.display = "none";
    localStorage.setItem("filterValue", true);

    render();
    return;
  }

  getXlsxBtn.style.display = "none";
  secondSelect.style.display = "";
  renderOptions(filterType);
});

secondSelect.addEventListener("change", (e) => {
  filterValue = e.target.value;

  localStorage.setItem("filterValue", filterValue);

  if (filterValue === "empty") {
    getXlsxBtn.style.display = "none";
    return render();
  }

  const filteredData = filterData(filterType, filterValue);

  if (filterType === "productTitleProvider" || filterType === "articleNumberOzon" || !filteredData.length)
    getXlsxBtn.style.display = "none";
  else getXlsxBtn.style.display = "";
  render();
});

mainWarehouseSelect.addEventListener("change", (e) => {
  firstWarehouse = e.target.value;
  renderSecondWarehouseOptions(firstWarehouse);
  secondWarehousesSelect.style.display = "flex";
});

volumeInputs.forEach((i) => {
  i.addEventListener("change", (e) => {
    i.value = e.target.value.replace(/\,/, ".");
  });
});

articleForUpdateSelect.addEventListener("change", (e) => {
  const value = e.target.value;
  const valuesObject = data.filter((elem) => elem.articleNumberOzon === value)[0];

  updateArticleForm.querySelector('input[name="productTitleProvider"]').value = valuesObject.productTitleProvider;
  updateArticleForm.querySelector('input[name="articleNumberProvider"]').value = valuesObject.articleNumberProvider;
  updateArticleForm.querySelector('input[name="provider"]').value = valuesObject.provider;
  updateArticleForm.querySelector('input[name="numberInBox"]').value = valuesObject.numberInBox;
  updateArticleForm.querySelector('input[name="volume"]').value = valuesObject.volume;
});

start();
