const fields = [
  "title",
  "author",
  "year",
  "publisher",
  "country",
  "language of publication",
  "publications in Catalan",
  "publications in Spain (Spanish)",
  "publications in English",
  "publications in German",
  "publications in Russian",
  "publications in French",
  "publications in Italian"
];

let originalData = [];
let filteredData = [];

const tableHeadRow = document.getElementById("tableHeadRow");
const tableBody = document.getElementById("tableBody");
const resultsCount = document.getElementById("resultsCount");
const resetFiltersBtn = document.getElementById("resetFilters");

function buildTableHead() {
  tableHeadRow.innerHTML = "";
  fields.forEach(field => {
    const th = document.createElement("th");
    th.textContent = field;
    tableHeadRow.appendChild(th);
  });
}

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim().toLowerCase();
}

function getFilters() {
  const filters = {};
  fields.forEach(field => {
    const input = document.getElementById(field);
    filters[field] = input ? normalizeValue(input.value) : "";
  });
  return filters;
}

function applyFilters() {
  const filters = getFilters();

  filteredData = originalData.filter(item => {
    return fields.every(field => {
      const filterValue = filters[field];
      if (!filterValue) return true;

      const itemValue = normalizeValue(item[field]);
      return itemValue.includes(filterValue);
    });
  });

  renderTable(filteredData);
}

function renderTable(data) {
  tableBody.innerHTML = "";

  if (!data.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";

    const td = document.createElement("td");
    td.colSpan = fields.length;
    td.textContent = "Nessun risultato trovato.";

    tr.appendChild(td);
    tableBody.appendChild(tr);
    resultsCount.textContent = "0 results";
    return;
  }

  data.forEach(item => {
    const tr = document.createElement("tr");

    fields.forEach(field => {
      const td = document.createElement("td");
      td.textContent = item[field] ?? "";
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });

  resultsCount.textContent = `${data.length} results`;
}

function attachFilterEvents() {
  fields.forEach(field => {
    const input = document.getElementById(field);
    if (input) {
      input.addEventListener("input", applyFilters);
    }
  });
}

function resetFilters() {
  fields.forEach(field => {
    const input = document.getElementById(field);
    if (input) input.value = "";
  });

  filteredData = [...originalData];
  renderTable(filteredData);
}

async function loadData() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) {
      throw new Error("Impossibile caricare data.json");
    }

    originalData = await response.json();
    filteredData = [...originalData];
    renderTable(filteredData);
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="${fields.length}">Errore nel caricamento del file data.json</td>
      </tr>
    `;
    resultsCount.textContent = "0 risultati";
  }
}

buildTableHead();
attachFilterEvents();
resetFiltersBtn.addEventListener("click", resetFilters);
loadData();
