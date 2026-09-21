// Shared, small helpers used by both pages. All API traffic goes through fetch.
const $ = (id) => document.getElementById(id);
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}
async function request(url, method = "GET", body) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(
      "Could not connect to the music library. Check your connection and try again.",
    );
  }
  if (!response.ok) {
    if (response.status === 404)
      throw new Error(
        `The requested ${url.includes("/songs/") ? "song" : "album"} was not found. Refresh the page and try again.`,
      );
    if (response.status >= 500)
      throw new Error(
        "The server could not complete this request. Please try again.",
      );
    throw new Error(
      "Could not save this change. Check the values and try again.",
    );
  }
  if (response.status === 204) return null;
  return response.json();
}
function notify(message) {
  $("notice").innerHTML =
    `<div class="alert alert-success alert-dismissible" role="status">${escapeHtml(message)}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Dismiss"></button></div>`;
}
function loading(id, label) {
  $(id).innerHTML =
    `<div class="py-5 text-center text-secondary"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${label}</div>`;
}
function showError(id, error, retry) {
  $(id).innerHTML =
    `<div class="alert alert-danger" role="alert">${escapeHtml(error.message)} ${retry ? '<button class="btn btn-sm btn-outline-danger ms-2">Try again</button>' : ""}</div>`;
  if (retry) $(id).querySelector("button").onclick = retry;
}
function coverStyle(id) {
  const colors = [
    "#cbd4bc",
    "#ddbaa5",
    "#bdcbd3",
    "#d9c889",
    "#c2bcd0",
    "#b7cbc4",
  ];
  return `--cover:${colors[Number(id) % colors.length]}`;
}
function albumYear(album) {
  return album.year ?? album.release_year;
}

const albumModal = new bootstrap.Modal($("albumModal"));
let editingAlbumId = null;
let afterAlbumSave;
function openAlbumForm(album, onSave) {
  editingAlbumId = album ? album.id : null;
  afterAlbumSave = onSave;
  $("albumModalForm").reset();
  $("albumModalTitle").textContent = album ? "Edit album" : "Add album";
  $("albumTitle").value = album?.title ?? "";
  $("albumArtist").value = album?.artist ?? "";
  $("albumYear").value = album ? albumYear(album) : "";
  clearFormError("albumModalForm");
  albumModal.show();
}
function clearFormError(id) {
  $(id).querySelector(".form-error").classList.add("d-none");
}
function formError(id, error) {
  const element = $(id).querySelector(".form-error");
  element.textContent = error.message;
  element.classList.remove("d-none");
}
// Disable closing and repeated submissions while a write is in progress.
function busyForm(id, busy) {
  $(id).dataset.busy = String(busy);
  $(id)
    .querySelectorAll("button, input")
    .forEach((element) => (element.disabled = busy));
}
for (const id of ["albumModal", "deleteModal", "songModal"]) {
  if (!$(id)) continue;
  $(id).addEventListener("hide.bs.modal", (event) => {
    if ($(id + "Form").dataset.busy === "true") event.preventDefault();
  });
  $(id).addEventListener("shown.bs.modal", () =>
    $(id).querySelector("input, .modal-footer button").focus(),
  );
}
$("albumModalForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = {
    title: $("albumTitle").value.trim(),
    artist: $("albumArtist").value.trim(),
    year: Number($("albumYear").value),
  };
  if (!body.title || !body.artist)
    return formError(
      "albumModalForm",
      new Error("Enter an album title and artist."),
    );
  if (!Number.isInteger(body.year) || body.year < 1900 || body.year > 2100)
    return formError(
      "albumModalForm",
      new Error("Enter a year between 1900 and 2100."),
    );
  busyForm("albumModalForm", true);
  clearFormError("albumModalForm");
  try {
    if (editingAlbumId === null) await createAlbum(body);
    else await updateAlbum(editingAlbumId, body);
    busyForm("albumModalForm", false);
    albumModal.hide();
    notify(
      editingAlbumId === null
        ? "Album added to your collection."
        : "Album updated.",
    );
    await afterAlbumSave();
  } catch (error) {
    formError("albumModalForm", error);
  } finally {
    busyForm("albumModalForm", false);
  }
});
function createAlbum(body) {
  return request("/albums", "POST", body);
}
function updateAlbum(id, body) {
  return request(`/albums/${id}`, "PUT", body);
}
function deleteAlbum(id) {
  return request(`/albums/${id}`, "DELETE");
}

const deleteModal = new bootstrap.Modal($("deleteModal"));
let deleteAction;
function confirmDelete(title, isAlbum, action) {
  $("deleteMessage").textContent =
    `Are you sure you want to delete “${title}”?`;
  $("deleteWarning").textContent = isAlbum
    ? "This cannot be undone. Deleting this album may also delete all its songs when cascading deletion is enabled."
    : "This song will be removed from the album. This cannot be undone.";
  clearFormError("deleteModalForm");
  deleteAction = action;
  deleteModal.show();
}
$("deleteModalForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  busyForm("deleteModalForm", true);
  clearFormError("deleteModalForm");
  try {
    await deleteAction();
    busyForm("deleteModalForm", false);
    deleteModal.hide();
  } catch (error) {
    formError("deleteModalForm", error);
  } finally {
    busyForm("deleteModalForm", false);
  }
});
