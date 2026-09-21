let albums = [];
$("heroAdd").onclick = $("addAlbum").onclick = () =>
  openAlbumForm(null, loadAlbums);
$("search").addEventListener("input", renderAlbums);
$("sort").addEventListener("change", renderAlbums);
async function loadAlbums() {
  loading("albumsState", "Loading your collection…");
  $("albumsGrid").replaceChildren();
  try {
    albums = await request("/albums");
    $("albumCount").textContent = albums.length;
    renderAlbums();
  } catch (error) {
    showError("albumsState", error, loadAlbums);
  }
}
function renderAlbums() {
  const query = $("search").value.trim().toLowerCase();
  const visible = albums.filter((album) =>
    `${album.title} ${album.artist}`.toLowerCase().includes(query),
  );
  const sort = $("sort").value;
  if (sort === "title" || sort === "artist")
    visible.sort((a, b) => a[sort].localeCompare(b[sort]));
  if (sort === "year") visible.sort((a, b) => albumYear(b) - albumYear(a));
  $("albumsState").innerHTML = "";
  $("albumsGrid").innerHTML = visible
    .map((album) => {
      const url = `/album.html?id=${encodeURIComponent(album.id)}`;
      return `<div class="col-12 col-sm-6 col-lg-4 col-xl-3"><article class="album-card"><a class="album-link" href="${url}" aria-label="View ${escapeHtml(album.title)}"><div class="album-cover" style="${coverStyle(album.id)}" aria-hidden="true"><div class="cover-record"></div><span class="cover-caption">MUSIC LIBRARY / LP</span></div><div class="p-3"><h3 class="mb-1">${escapeHtml(album.title)}</h3><p class="artist mb-3">${escapeHtml(album.artist)}</p><span class="badge year-badge">${escapeHtml(albumYear(album))}</span></div></a><div class="card-actions"><a href="${url}" class="view-link">View album ↗</a><button class="btn btn-light" data-action="edit" data-id="${album.id}" aria-label="Edit ${escapeHtml(album.title)}">Edit</button><button class="btn btn-light text-danger" data-action="delete" data-id="${album.id}" aria-label="Delete ${escapeHtml(album.title)}">Delete</button></div></article></div>`;
    })
    .join("");
  if (!visible.length) {
    $("albumsState").innerHTML =
      `<div class="empty-state"><h3>${albums.length ? "No matching records" : "Your next favorite belongs here"}</h3><p>${albums.length ? "Try a different album title or artist." : "Start your collection by adding your first album."}</p><button class="btn btn-primary">${albums.length ? "Clear search" : "＋ Add your first album"}</button></div>`;
    $("albumsState").querySelector("button").onclick = () => {
      if (albums.length) {
        $("search").value = "";
        renderAlbums();
      } else openAlbumForm(null, loadAlbums);
    };
  }
}
$("albumsGrid").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const album = albums.find((item) => String(item.id) === button.dataset.id);
  if (button.dataset.action === "delete") {
    confirmDelete(album.title, true, async () => {
      await deleteAlbum(album.id);
      notify("Album removed from your collection.");
      await loadAlbums();
    });
  } else {
    button.disabled = true;
    try {
      openAlbumForm(await request(`/albums/${album.id}`), loadAlbums);
    } catch (error) {
      showError("notice", error);
    } finally {
      button.disabled = false;
    }
  }
});
loadAlbums();
