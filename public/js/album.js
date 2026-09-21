const albumId = new URLSearchParams(window.location.search).get("id");
let album;
let songs = [];
let editingSongId = null;
const songModal = new bootstrap.Modal($("songModal"));
async function loadAlbum() {
  loading("albumState", "Loading album…");
  try {
    album = await request(`/albums/${albumId}`);
    $("detailTitle").textContent = album.title;
    $("detailArtist").textContent = album.artist;
    $("detailYear").textContent = albumYear(album);
    $("detailCover").setAttribute("style", coverStyle(album.id));
    document.title = `${album.title} · Music Library`;
    $("albumState").replaceChildren();
    $("albumContent").hidden = false;
  } catch (error) {
    $("albumContent").hidden = true;
    showError("albumState", error, loadPage);
  }
}
async function loadPage() {
  await loadAlbum();
  if (!$("albumContent").hidden) await loadSongs();
}
async function loadSongs() {
  loading("songsState", "Loading tracks…");
  $("songsTable").hidden = true;
  try {
    songs = await request(`/albums/${albumId}/songs`);
    // The existing list route omits duration. Read song details when needed,
    // preserving the list's original order without changing the API.
    songs = await Promise.all(
      songs.map((song) =>
        song.duration_seconds === undefined
          ? request(`/albums/${albumId}/songs/${song.id}`)
          : song,
      ),
    );
    renderSongs();
  } catch (error) {
    showError("songsState", error, loadSongs);
  }
}
function duration(seconds) {
  if (seconds === null || seconds === undefined) return "—";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
function renderSongs() {
  $("songCount").textContent = songs.length;
  $("songsState").innerHTML = "";
  $("songsTable").hidden = songs.length === 0;
  $("songsBody").innerHTML = songs
    .map(
      (song) =>
        `<tr><td class="text-secondary">${escapeHtml(song.track_number)}</td><td class="fw-semibold">${escapeHtml(song.title)}</td><td class="text-secondary text-nowrap">${duration(song.duration_seconds)}</td><td class="text-end text-nowrap"><button class="btn btn-light" data-action="edit" data-id="${song.id}" aria-label="Edit ${escapeHtml(song.title)}">Edit</button> <button class="btn btn-light text-danger" data-action="delete" data-id="${song.id}" aria-label="Delete ${escapeHtml(song.title)}">Delete</button></td></tr>`,
    )
    .join("");
  if (!songs.length) {
    $("songsState").innerHTML =
      '<div class="empty-state"><h3>A record waiting for its tracks</h3><p>Add the first song to bring this album to life.</p><button class="btn btn-primary">＋ Add a song</button></div>';
    $("songsState").querySelector("button").onclick = () => openSongForm();
  }
}
$("editAlbum").onclick = () => openAlbumForm(album, loadAlbum);
$("addSong").onclick = () => openSongForm();
function openSongForm(song) {
  editingSongId = song ? song.id : null;
  $("songModalForm").reset();
  $("songModalTitle").textContent = song ? "Edit song" : "Add song";
  $("songTrack").value =
    song?.track_number ??
    Math.max(0, ...songs.map((item) => item.track_number)) + 1;
  $("songTitle").value = song?.title ?? "";
  $("songDuration").value = song?.duration_seconds ?? "";
  clearFormError("songModalForm");
  songModal.show();
}
$("songModalForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  // album_id belongs in the URL, never in the JSON body.
  const body = {
    track_number: Number($("songTrack").value),
    title: $("songTitle").value.trim(),
    duration_seconds: Number($("songDuration").value),
  };
  if (!body.title)
    return formError("songModalForm", new Error("Enter a song title."));
  if (
    !Number.isInteger(body.track_number) ||
    body.track_number < 1 ||
    !Number.isInteger(body.duration_seconds) ||
    body.duration_seconds < 0
  )
    return formError(
      "songModalForm",
      new Error(
        "Enter a positive whole track number and a duration of zero or more seconds.",
      ),
    );
  if (
    songs.some(
      (song) =>
        song.track_number === body.track_number && song.id !== editingSongId,
    )
  )
    return formError(
      "songModalForm",
      new Error("This track number is already in use. Choose another number."),
    );
  busyForm("songModalForm", true);
  clearFormError("songModalForm");
  try {
    if (editingSongId === null) await createSong(body);
    else await updateSong(editingSongId, body);
    busyForm("songModalForm", false);
    songModal.hide();
    notify(
      editingSongId === null ? "Song added to the album." : "Song updated.",
    );
    await loadSongs();
  } catch (error) {
    formError("songModalForm", error);
  } finally {
    busyForm("songModalForm", false);
  }
});
function createSong(body) {
  return request(`/albums/${albumId}/songs`, "POST", body);
}
function updateSong(id, body) {
  return request(`/albums/${albumId}/songs/${id}`, "PUT", body);
}
function deleteSong(id) {
  return request(`/albums/${albumId}/songs/${id}`, "DELETE");
}
$("songsBody").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const song = songs.find((item) => String(item.id) === button.dataset.id);
  if (button.dataset.action === "delete") {
    confirmDelete(song.title, false, async () => {
      await deleteSong(song.id);
      notify("Song removed from the album.");
      await loadSongs();
    });
  } else {
    button.disabled = true;
    try {
      openSongForm(await request(`/albums/${albumId}/songs/${song.id}`));
    } catch (error) {
      showError("notice", error);
    } finally {
      button.disabled = false;
    }
  }
});
if (
  !albumId ||
  !/^[1-9]\d*$/.test(albumId) ||
  !Number.isSafeInteger(Number(albumId))
) {
  showError(
    "albumState",
    new Error("Choose a valid album from your collection."),
  );
} else loadPage();
