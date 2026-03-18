const textColumns = [
  { key: "title", label: "Title", csv: "title" },
  { key: "author", label: "Author", csv: "author" },
  { key: "year", label: "Year", csv: "year" },
  { key: "publisher", label: "Publisher", csv: "publisher" },
  { key: "country", label: "Country", csv: "country" },
  { key: "languageOfPublication", label: "Language of publication", csv: "language of publication" },
  { key: "publicationsCatalan", label: "Publications in Catalan", csv: "publications in Catalan" },
  { key: "publicationsSpainSpanish", label: "Publications in Spain (Spanish)", csv: "publications in Spain (Spanish)" },
  { key: "publicationsEnglish", label: "Publications in English", csv: "publications in English" },
  { key: "publicationsGerman", label: "Publications in German", csv: "publications in German" },
  { key: "publicationsRussian", label: "Publications in Russian", csv: "publications in Russian" },
  { key: "publicationsFrench", label: "Publications in French", csv: "publications in French" },
  { key: "publicationsItalian", label: "Publications in Italian", csv: "publications in Italian" }
];

const extraColumns = [
  { key: "themes", label: "Themes", csv: "Themes" },
  { key: "genre", label: "Genre", csv: "Genre" }
];

const allColumns = [...textColumns, ...extraColumns];

// Temporary options — replace these later with your real ones
const themeOptions = ["Love", "War", "Identity", "Memory", "Exile"];
const genreOptions = ["Novel", "Poetry", "Essay", "Drama", "Short Story"];

let originalData = [];
let filteredData = [];

const state = {
  activeThemes: new Set(),
  activeGenres: new Set()
};

const textFiltersGrid = document.getElementById("textFiltersGrid");
const themesButtons = document.getElementById("themesButtons");
const genreButtons = document.getElementById("genreButtons");
const tableHeadRow = document.getElementById("tableHeadRow");
const tableBody = document.getElementById("tableBody");
const resultsCount = document.getElementById("resultsCount");
const resetFiltersBtn = document.getElementById("resetFilters");

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim().toLowerCase();
}

function parseMultiValueCell(value) {
  if (!value) return [];
  return String(value)
    .split(/[;,|]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function buildTextFilters() {
  textFiltersGrid.innerHTML = "";

  textColumns.forEach(col => {
    const wrapper = document.createElement("div");
    wrapper.className = "filter-group";

    const label = document.createElement("label");
    label.setAttribute("for", `filter-${col.key}`);
    label.textContent = col.label;

    const input = document.createElement("input");
    input.type = "text";
    input.id = `filter-${col.key}`;
    input.placeholder = `Search by ${col.label}`;
    input.addEventListener("input", applyFilters);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    textFiltersGrid.appendChild(wrapper);
  });
}

function buildChipButtons(container, options, type) {
  container.innerHTML = "";

  options.forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.textContent = option;
    button.dataset.value = option;
    button.dataset.type = type;
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      const normalized = normalizeValue(option);

      if (type === "theme") {
        if (state.activeThemes.has(normalized)) {
          state.activeThemes.delete(normalized);
        } else {
          state.activeThemes.add(normalized);
        }
      }

      if (type === "genre") {
        if (state.activeGenres.has(normalized)) {
          state.activeGenres.delete(normalized);
        } else {
          state.activeGenres.add(normalized);
        }
      }

      updateChipStates();
      applyFilters();
    });

    container.appendChild(button);
  });
}

function updateChipStates() {
  document.querySelectorAll(".filter-chip").forEach(button => {
    const value = normalizeValue(button.dataset.value);
    const type = button.dataset.type;

    let isActive = false;

    if (type === "theme") {
      isActive = state.activeThemes.has(value);
    }

    if (type === "genre") {
      isActive = state.activeGenres.has(value);
    }

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function buildTableHead() {
  tableHeadRow.innerHTML = "";

  allColumns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col.label;
    tableHeadRow.appendChild(th);
  });
}

function getTextFilters() {
  const filters = {};

  textColumns.forEach(col => {
    const input = document.getElementById(`filter-${col.key}`);
    filters[col.csv] = input ? normalizeValue(input.value) : "";
  });

  return filters;
}

function applyFilters() {
  const textFilters = getTextFilters();

  filteredData = originalData.filter(row => {
    const matchesTextFilters = textColumns.every(col => {
      const filterValue = textFilters[col.csv];
      if (!filterValue) return true;

      const rowValue = normalizeValue(row[col.csv]);
      return rowValue.includes(filterValue);
    });

    if (!matchesTextFilters) return false;

    const rowThemes = parseMultiValueCell(row["Themes"]).map(normalizeValue);
    const rowGenres = parseMultiValueCell(row["Genre"]).map(normalizeValue);

    const matchesThemes =
      state.activeThemes.size === 0 ||
      [...state.activeThemes].some(theme => rowThemes.includes(theme));

    const matchesGenres =
      state.activeGenres.size === 0 ||
      [...state.activeGenres].some(genre => rowGenres.includes(genre));

    return matchesThemes && matchesGenres;
  });

  renderTable(filteredData);
}

function renderTable(data) {
  tableBody.innerHTML = "";

  if (!data.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";

    const td = document.createElement("td");
    td.colSpan = allColumns.length;
    td.textContent = "No results found.";

    tr.appendChild(td);
    tableBody.appendChild(tr);
    resultsCount.textContent = "0 results";
    return;
  }

  data.forEach(row => {
    const tr = document.createElement("tr");

    allColumns.forEach(col => {
      const td = document.createElement("td");
      td.textContent = row[col.csv] ?? "";
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });

  resultsCount.textContent = `${data.length} ${data.length === 1 ? "result" : "results"}`;
}

function resetFilters() {
  textColumns.forEach(col => {
    const input = document.getElementById(`filter-${col.key}`);
    if (input) input.value = "";
  });

  state.activeThemes.clear();
  state.activeGenres.clear();
  updateChipStates();

  filteredData = [...originalData];
  renderTable(filteredData);
}

function loadCsv() {
  Papa.parse("./name.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      originalData = results.data.filter(row =>
        Object.values(row).some(value => normalizeValue(value) !== "")
      );

      filteredData = [...originalData];
      renderTable(filteredData);
    },
    error: function(error) {
      console.error("CSV loading error:", error);
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="${allColumns.length}">Error loading name.csv</td>
        </tr>
      `;
      resultsCount.textContent = "0 results";
    }
  });
}

buildTextFilters();
buildChipButtons(themesButtons, themeOptions, "theme");
buildChipButtons(genreButtons, genreOptions, "genre");
buildTableHead();

resetFiltersBtn.addEventListener("click", resetFilters);

loadCsv();
