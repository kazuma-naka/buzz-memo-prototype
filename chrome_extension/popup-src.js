import { createClient } from "@supabase/supabase-js";

/* ------------------- Supabase Service ------------------- */
class SupabaseService {
  constructor() {
    this.client = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  async getUserIdByEmail(email) {
    const { data, error } = await this.client
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Buzz Memo に登録してください。");
    return data.id;
  }

  async getServices(userEmail) {
    const { data, error } = await this.client
      .from("services")
      .select("id, title")
      .eq("user_email", userEmail);

    if (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
    return data;
  }

  async isBookmarkSaved(userId, title) {
    const { data, error } = await this.client
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

  async insertBookmark(bookmarkData) {
    const { error } = await this.client.from("bookmarks").insert(bookmarkData);
    if (error) throw error;
    return true;
  }
}

/* ------------------- Authentication Service ------------------- */
class AuthService {
  async getUserProfile() {
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
}

/* ------------------- UI Service ------------------- */
class UIService {
  constructor() {
    this.loginDiv = document.getElementById("login-section");
    this.userDiv = document.getElementById("user-section");
    this.serviceDiv = document.getElementById("service-section");
  }

  updateUserUI(user) {
    this.userDiv.innerHTML = `<strong>ログイン:</strong> ${user.email}`;
    this.loginDiv.innerHTML = "";
  }

  updateServiceList(services) {
    this.serviceDiv.innerHTML = `
      <select id="service-selector">
        <option value="">-- サービスを選択してください。 --</option>
      </select>
    `;
    this.serviceDiv.style.marginTop = "10px";
    const serviceSelector = document.getElementById("service-selector");
    services.forEach((service, index) => {
      const option = document.createElement("option");
      option.value = service.id;
      option.textContent = service.title;
      if (index === 0) option.selected = true;
      serviceSelector.appendChild(option);
    });
  }

  setExtensionIcon(isSaved, tabId) {
    chrome.action.setIcon({
      path: isSaved ? "icon-saved.png" : "icon-default.png",
      tabId,
    });
  }

  renderMetaSection(meta, saveCallback) {
    let metaDiv = document.getElementById("meta-section");
    if (!metaDiv) {
      metaDiv = document.createElement("div");
      metaDiv.id = "meta-section";
      metaDiv.style.marginTop = "10px";
      document.body.appendChild(metaDiv);
    }
    metaDiv.innerHTML = `
    <label>タイトル</label><br>
    <input id="meta-title" value="${
      meta.title || ""
    }" style="width: 100%;" /><br><br>
    <label>説明</label><br>
    <textarea id="meta-description" rows="3" style="width: 100%;">${
      meta.description || ""
    }</textarea><br><br>
    <label>Favicon URL</label><br>
    <input id="meta-favicon" value="${
      meta.favicon_url || ""
    }" style="width: 100%;" /><br><br>
    <label>Twitter画像URL</label><br>
    <input id="meta-twitter-img" value="${
      meta.twitter_image_url || ""
    }" style="width: 100%;" /><br><br>
    <!-- New Publish Date input field -->
    <label>Publish Date</label><br>
    <input id="meta-publish-date" value="${
      meta.publish_date || ""
    }" style="width: 100%;" /><br><br>
    <button id="save-bookmark-button" style="margin-top: 10px;">Save Bookmark</button>
  `;
    document
      .getElementById("save-bookmark-button")
      .addEventListener("click", saveCallback);
  }
}

/* ------------------- Utility Functions ------------------- */
const getCurrentTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
};

/* ------------------- Main Application ------------------- */
class BookmarkExtensionApp {
  constructor() {
    this.supabaseService = new SupabaseService();
    this.authService = new AuthService();
    this.uiService = new UIService();
    this.userId = null;
    this.metaInfo = null;
    this.tabId = null;
  }

  async init() {
    try {
      // Get user profile and initialize user
      const user = await this.authService.getUserProfile();
      this.userId = await this.supabaseService.getUserIdByEmail(user.email);
      this.uiService.updateUserUI(user);

      // Get and display services
      const services = await this.supabaseService.getServices(user.email);
      this.uiService.updateServiceList(services);

      // Setup tab info and meta data
      await this.setupTabAndMeta();
    } catch (err) {
      console.error("Initialization error:", err.message);
      alert(err.message);
      this.showLoginButton();
    }
  }

  async setupTabAndMeta() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    this.tabId = tab.id;
    const currentUrl = tab.url;

    // Execute script in the current tab to grab meta info
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: this.tabId },
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
          // Set publish_date: Use meta tags or default to current date in ISO format.
          publish_date:
            getMeta("article:published_time", "property") ||
            getMeta("og:published_time", "property") ||
            new Date().toISOString(),
        };
      },
    });
    this.metaInfo = { ...result, url: currentUrl };

    // Render the meta info UI and attach save callback
    this.uiService.renderMetaSection(
      this.metaInfo,
      this.handleSaveBookmark.bind(this)
    );

    // Check and update bookmark icon if saved
    const isSaved = await this.supabaseService.isBookmarkSaved(
      this.userId,
      this.metaInfo.title
    );
    this.uiService.setExtensionIcon(isSaved, this.tabId);
    if (isSaved) {
      chrome.storage.local.set({ [this.metaInfo.url]: true }, () => {
        console.log(`Saved URL: ${this.metaInfo.url} to local storage`);
      });
    }
  }

  async handleSaveBookmark() {
    const serviceSelector = document.getElementById("service-selector");
    const selectedServiceId = serviceSelector?.value;
    if (!selectedServiceId) {
      alert("⚠️ サービスを選択してください。");
      return;
    }

    const editedMeta = {
      title: document.getElementById("meta-title")?.value || "",
      description: document.getElementById("meta-description")?.value || "",
      favicon_url: document.getElementById("meta-favicon")?.value || "",
      twitter_image_url:
        document.getElementById("meta-twitter-img")?.value || "",
      url: this.metaInfo.url || "",
      last_updated_user_id: this.userId,
      service_id: selectedServiceId,
      // Use the publish_date from the input or fallback to the meta info or current timestamp
      uploaded_date:
        document.getElementById("meta-publish-date")?.value ||
        this.metaInfo.publish_date ||
        getCurrentTimestamp(),
    };

    try {
      await this.supabaseService.insertBookmark(editedMeta);
      alert("✅ Bookmark saved to Supabase!");
      this.uiService.setExtensionIcon(true, this.tabId);
      chrome.storage.local.set({ [this.metaInfo.url]: true }, () => {
        console.log(
          `Saved path: ${this.metaInfo.url} to local storage after insert`
        );
      });
    } catch (e) {
      console.error("Supabase insert failed:", e);
      alert(`❌ Failed to save bookmark:\n${e.message}`);
    }
  }

  showLoginButton() {
    this.loginDiv = document.getElementById("login-section");
    this.loginDiv.innerHTML = `<button id="login">Login with Google</button>`;
    document.getElementById("login")?.addEventListener("click", async () => {
      try {
        const user = await this.authService.getUserProfile();
        this.userId = await this.supabaseService.getUserIdByEmail(user.email);
        this.uiService.updateUserUI(user);
      } catch (e) {
        console.error("Login failed:", e);
        alert(`Login failed:\n${e?.message || JSON.stringify(e, null, 2)}`);
      }
    });
  }
}

/* ------------------- Initialize App on DOMContentLoaded ------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const app = new BookmarkExtensionApp();
  app.init();
});
