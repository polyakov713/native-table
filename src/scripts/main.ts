interface Address {
  city: string
  street: string
  geo: { lat: string, lng: string }
  suite: string
  zipcode: string
}

interface Company {
  bs: string
  catchPhrase: string
  name: string
}

interface LoginData {
  username: string
  uuid: string
}

interface User {
  address: Address
  birthDate: string
  company: Company
  email: string
  firstname: string
  id: number
  lastname: string
  login: LoginData
  phone: string
  website: string
}

interface UserTransformed {
  address: string
  email: string
  firstname: string
  id: number
  lastname: string
  phone: string
}

interface ColumnConfig {
  name: string
  title: string
  sortable?: boolean
}

const ui: Record<string, HTMLElement | null> = {
  tableHeader: null,
  tableBody: null,
  filterForm: null,
};

interface SortingParams {
  field: string
  direction: 'asc' | 'desc'
}

let usersList: User[] = [];
let currentFilterValue: string = '';
let currentSortingValue: SortingParams | null = null;

const COLUMNS: ColumnConfig[] = [
  {
    name: 'id',
    title: 'ID',
  },
  {
    name: 'firstname',
    title: 'Firstname',
    sortable: true,
  },
  {
    name: 'lastname',
    title: 'Lastname',
    sortable: true,
  },
  {
    name: 'email',
    title: 'E-mail',
  },
  {
    name: 'phone',
    title: 'Phone',
  },
  {
    name: 'address',
    title: 'Address',
  },
  {
    name: 'actions',
    title: 'Actions',
  },
];

async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch('https://jsonplaceholder.org/users');

    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }

    const json = await res.json();

    return json;
  } catch (err) {
    console.error(err);
  }
}

function transformUser(user: User): UserTransformed {
  const { address } = user;

  return {
    ...user,
    address: `${address.city}, ${address.street}`
  };
}

async function initPage() {
  usersList = await fetchUsers();

  updateTableState();
}

function initUI() {
  ui.tableHeader = document.querySelector('#table-header');
  ui.tableBody = document.querySelector('#table-body');
  ui.filterForm = document.querySelector('#filter-form');
}

// Render start
function renderTableHeader(config: ColumnConfig[]) {
  let thColumns: string = '';

  config.forEach((col) => {
    thColumns += `<th data-name="${col.name}"><strong>${col.title}</strong>
      ${col.sortable ? '<span class="sort sort-asc">&uarr;</span><span class="sort sort-desc">&darr;</span>' : ''}</th>`;
  });

  ui.tableHeader.innerHTML = `<tr>${thColumns}</tr>`;
}

function renderTableBody<T, K>(config: ColumnConfig[], data: Array<T>, transformer?: (dateItem: T) => K) {
  function renderRow(dataItem: T | K): string {
    let tdColumns: string = '';

    config.forEach((col) => {
      if (col.name === 'actions') {
        tdColumns += `<td><button data-id="${dataItem['id']}" class="base-button base-button--small delete-button">&#x2715;</button></td>`;
      } else {
        tdColumns += `<td>${dataItem[col.name]}</td>`;
      }
    });

    return `<tr>${tdColumns}</tr>`;
  }

  let tbodyContent: string = '';

  if (!data.length) {
    tbodyContent = `<tr class="base-smart-table__no-data">
              <td colspan="${config.length}" class="base-table__no-data-col">
                NO DATA
              </td>
            </tr>`;
  } else {
    data.forEach((dataItem) => {
      const dataItemTransformed = transformer ? transformer(dataItem) : dataItem;
      tbodyContent += renderRow(dataItemTransformed);
    });
  }

  ui.tableBody.innerHTML = tbodyContent;
}

// Render End

// Filtering start
function filterUsers(list: User[], filterValue: string): User[] {
  if (!filterValue) {
    return [...list];
  }

  const filterValuePrepared = filterValue.toLowerCase();

  return list.filter(({ firstname, lastname }) => firstname.toLowerCase().includes(filterValuePrepared)
    || lastname.toLowerCase().includes(filterValuePrepared));
}

function onFilter(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const filterInput = form.elements[0] as HTMLInputElement;
  const filterValue = filterInput.value;

  currentFilterValue = filterValue;
  updateTableState();
}
// Filtering end

// Deleting start
function deleteUser(userId: number): User[] {
  return usersList.filter(({ id }) => id !== userId);
}

function onClickTableBody(event: Event) {
  const deleteButton: HTMLElement = (event.target as HTMLElement).closest('.delete-button');

  if (!deleteButton) {
    return;
  }

  const entityId = Number(deleteButton.dataset.id);

  usersList = deleteUser(entityId);
  updateTableState();
}
// Deleting end

// Sorting start
function sortUsers(list: User[], params: SortingParams): User[] {
  if (!params) {
    return [...list];
  }

  const { field, direction } = params;

  return [...list].sort((a, b) => {
    if (a[field] > b[field]) {
      return direction === 'asc' ? 1 : -1;
    } else if (a[field] < b[field]) {
      return direction === 'asc' ? -1 : 1;
    } else {
      return 0;
    }
  });
}

function onClickTableHeader(event: Event) {
  const sortButton: HTMLElement = (event.target as HTMLElement).closest('.sort');

  if (!sortButton) {
    return;
  }

  const sortingDir = sortButton.classList.contains('sort-asc') ? 'asc' : 'desc';
  const sortingField = sortButton.closest('th').dataset.name;

  currentSortingValue = { field: sortingField, direction: sortingDir };
  updateTableState();
}
// Sorting end

function updateTableState() {
  const usersListFiltered = filterUsers(usersList, currentFilterValue);
  const usersListFilteredSorted = sortUsers(usersListFiltered, currentSortingValue);

  renderTableBody<User, UserTransformed>(COLUMNS, usersListFilteredSorted, transformUser);
}

function onDocumentReady() {
  initUI();

  renderTableHeader(COLUMNS);
  renderTableBody<User, UserTransformed>(COLUMNS, usersList, transformUser);

  ui.filterForm.addEventListener('submit', onFilter);
  ui.tableBody.addEventListener('click', onClickTableBody);
  ui.tableHeader.addEventListener('click', onClickTableHeader);
}

document.addEventListener('DOMContentLoaded', onDocumentReady);

initPage();
