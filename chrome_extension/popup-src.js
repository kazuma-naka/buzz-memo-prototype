import { createClient } from "@supabase/supabase-js";

// Supabase init
const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Get users.id by email
async function getUserIdByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Buzz Memo に登録してください。");
  return data.id;
}

// Chrome Identity → get email/profile
async function getUserProfile() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "getUserProfile" }, (response) => {
      if (response?.profile) {
        resolve(response.profile);
      } else {
        reject(response?.error || "Unknown error");
      }
    });
  });
}

async function getServices(userEmail) {
  const { data, error } = await supabase
    .from("services")
    .select("id, title")
    .eq("user_email", userEmail);

  if (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
  return data;
}

// Check if bookmark already exists
async function isBookmarkSaved(userId, title) {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("last_updated_user_id", userId)
    .eq("title", title)
    .maybeSingle();

  if (error) {
    console.error("Supabase check error:", error);
    return false;
  }

  return !!data;
}

// Set extension icon dynamically
function setExtensionIcon(isSaved, tabId) {
  chrome.action.setIcon({
    path: isSaved ? "icon-saved.png" : "icon-default.png",
    tabId,
  });
}

// On popup load
document.addEventListener("DOMContentLoaded", async () => {
  const loginDiv = document.getElementById("login-section");
  const userDiv = document.getElementById("user-section");
  const serviceDiv = document.getElementById("service-section");
  const getBtn = document.getElementById("save-bookmark-button");

  let userId = null;
  let metaInfo = null;
  let tabId = null;
  let services = null;

  const updateUIAfterLogin = (user) => {
    userDiv.innerHTML = `<strong>Logged in as:</strong> ${user.email}`;
    getBtn.style.display = "inline-block";
    getBtn.style.marginTop = "10px";
    loginDiv.innerHTML = "";
  };

  const updateServiceList = (services) => {
    serviceDiv.innerHTML = `
      <select id="service-selector">
        <option value="">-- サービスを選択してください。 --</option>
      </select>
    `;
    serviceDiv.style.marginTop = "10px";

    const serviceSelector = document.getElementById("service-selector");

    services.forEach((service, index) => {
      const option = document.createElement("option");
      option.value = service.id;
      option.textContent = service.title;
      if (index === 0) option.selected = true;
      serviceSelector.appendChild(option);
    });
  };

  try {
    const user = await getUserProfile();
    const id = await getUserIdByEmail(user.email);
    userId = id;
    updateUIAfterLogin(user);
    services = await getServices(user.email);
    updateServiceList(services);

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    tabId = tab.id;
    const currentUrl = tab.url;

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const getMeta = (name, attr = "name") =>
          document.querySelector(`meta[${attr}="${name}"]`)?.content || null;

        return {
          title: document.title,
          description: getMeta("description"),
          favicon_url:
            [...document.querySelectorAll('link[rel*="icon"]')][0]?.href ||
            null,
          twitter_image_url: getMeta("twitter:image"),
        };
      },
    });

    metaInfo = { ...result, url: currentUrl };
    const isSaved = await isBookmarkSaved(userId, metaInfo.title);
    setExtensionIcon(isSaved, tabId);

    // Save page path to local storage if bookmark exists
    if (isSaved) {
      const pageUrl = metaInfo.url;
      chrome.storage.local.set({ [pageUrl]: true }, () => {
        console.log(`Saved URL: ${pageUrl} to local storage`);
      });
    }
  } catch (err) {
    console.error("User not logged in or failed to load:", err.message);
    alert(err.message);
    loginDiv.innerHTML = `<button id="login">Login with Google</button>`;
    getBtn.style.display = "none";

    document.getElementById("login")?.addEventListener("click", async () => {
      try {
        const user = await getUserProfile();
        const id = await getUserIdByEmail(user.email);
        userId = id;
        updateUIAfterLogin(user);
      } catch (e) {
        console.error("Login failed:", e);
        alert(`Login failed:\n${e?.message || JSON.stringify(e, null, 2)}`);
      }
    });
  }

  // Save bookmark
  getBtn.addEventListener("click", async () => {
    if (!metaInfo || !userId) return;

    const selectedServiceId =
      document.getElementById("service-selector")?.value;
    if (!selectedServiceId) {
      alert("⚠️ サービスを選択してください。");
      return;
    }

    try {
      const { error } = await supabase.from("bookmarks").insert({
        title: metaInfo.title || "",
        description: metaInfo.description || "",
        favicon_url: metaInfo.favicon_url || "",
        twitter_image_url: metaInfo.twitter_image_url || "",
        url: metaInfo.url || "",
        last_updated_user_id: userId,
        service_id: selectedServiceId,
      });

      if (error) throw error;

      alert("✅ Bookmark saved to Supabase!");
      setExtensionIcon(true, tabId);

      const pagePath = metaInfo.url;
      chrome.storage.local.set({ [pagePath]: true }, () => {
        console.log(`Saved path: ${pagePath} to local storage after insert`);
      });
    } catch (e) {
      console.error("Supabase insert failed:", e);
      alert(`❌ Failed to save bookmark:\n${e.message}`);
    }
  });
});
