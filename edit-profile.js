// edit-profile.js
// identifier: choose how you identify user; here we try to read ?id= or fallback to token-subject
const params = new URLSearchParams(window.location.search);
const identifier = params.get('id') || localStorage.getItem('identifier') || null; // adapt as needed

const avatarImg = document.getElementById('avatarImg');
const avatarFile = document.getElementById('avatarFile');
const displayName = document.getElementById('displayName');
const username = document.getElementById('username');
const bio = document.getElementById('bio');
const locationInput = document.getElementById('location');
const status = document.getElementById('status');
const form = document.getElementById('editProfileForm');

if (!identifier) {
  status.textContent = 'No identifier found. Open this page with ?id=username or log in first.';
}

// load profile
async function loadProfile() {
  if (!identifier) return;
  try {
    const res = await fetch(`http://127.0.0.1:8000/profile/${encodeURIComponent(identifier)}`);
    if (!res.ok) {
      status.textContent = 'Unable to load profile.';
      return;
    }
    const data = await res.json();
    displayName.value = data.display_name || data.identifier || '';
    username.value = data.username || data.identifier || '';
    bio.value = data.bio || '';
    locationInput.value = data.location || '';
    if (data.avatar_url) {
      // if server returns a path like /uploads/..., use it; otherwise fallback
      avatarImg.src = data.avatar_url;
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Server error while loading profile.';
  }
}

avatarFile.addEventListener('change', () => {
  const f = avatarFile.files[0];
  if (!f) return;
  avatarImg.src = URL.createObjectURL(f);
});

// upload helper
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('http://127.0.0.1:8000/upload-avatar', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    throw new Error('Avatar upload failed');
  }
  return res.json(); // expected { path: "/uploads/filename.png" }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = 'Saving...';
  try {
    let avatar_url = null;
    if (avatarFile.files.length > 0) {
      const uploadResp = await uploadAvatar(avatarFile.files[0]);
      avatar_url = uploadResp.path;
    }

    const payload = {
      display_name: displayName.value.trim(),
      username: username.value.trim(),
      bio: bio.value.trim(),
      location: locationInput.value.trim(),
    };
    if (avatar_url) payload.avatar_url = avatar_url;

    const res = await fetch(`http://127.0.0.1:8000/profile/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      status.textContent = data.detail || 'Update failed.';
      return;
    }

    status.textContent = 'Profile updated!';
    // optionally redirect back to profile page
    setTimeout(() => window.location.href = `profile_sudeeptha.html?id=${encodeURIComponent(identifier)}`, 800);

  } catch (err) {
    console.error(err);
    status.textContent = 'Error while saving profile.';
  }
});

// init
loadProfile();
