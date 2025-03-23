(async function () {


  async function init() {
    chrome.storage.local.get(["sellerProfileLink", "sellerName"], async (result) => {
      sellerProfileLink = result.sellerProfileLink || "";
      myUsername = result.sellerName || "";

      if (!sellerProfileLink) {
        sellerProfileLink = prompt("🔗 أدخل رابط حسابك الشخصي على خمسات (مثال: https://khamsat.com/user/YourName):");

        if (!sellerProfileLink || !sellerProfileLink.startsWith("https://khamsat.com/user/")) {
          alert("❗ الرابط غير صحيح، حاول مرة أخرى!");
          return;
        }

        chrome.storage.local.set({ sellerProfileLink });
      }


      if (!myUsername) {
        myUsername = await fetchSellerNameFromLink(sellerProfileLink);

        if (myUsername) {
          chrome.storage.local.set({ sellerName: myUsername });

          startObserving();
        } else {

        }
      } else {

        startObserving();
      }
    });
  }

  function hasUserCommented() {
    const commentAuthors = document.querySelectorAll(".comments a[href^='/user/']");
    if (!commentAuthors.length) return false;

    for (const author of commentAuthors) {
      const authorName = author.textContent.trim().toLowerCase();

      if (authorName === myUsername.toLowerCase()) {
        return author.closest('.comment');
      }
    }

    return false;
  }

  function getRequestInfo(commentElement) {
    const titleElement = document.querySelector("h1");
    const descriptionElement = document.querySelector("article.replace_urls");
    const ownerElement = document.querySelector("a.sidebar_user");

    const link = window.location.href;

    const title = titleElement ? titleElement.innerText.trim() : "";
    const description = descriptionElement ? descriptionElement.innerText.trim() : "";
    const owner = ownerElement ? ownerElement.innerText.trim() : "";

    const savedAt = new Date().toISOString();

    return {
      title,
      description,
      owner,
      sellerName: myUsername,
      link,
      savedAt
    };
  }

  function saveRequest(requestInfo) {
    chrome.storage.local.get(["myReplies"], (result) => {
      let myReplies = result.myReplies || [];
      const exists = myReplies.some(item => item.link === requestInfo.link);

      if (!exists) {
        myReplies.push(requestInfo);
        chrome.storage.local.set({ myReplies });
      }
    });
  }

  function scanPage() {
    const commentElement = hasUserCommented();
    if (commentElement) {
      const requestInfo = getRequestInfo(commentElement);
      saveRequest(requestInfo);
    }
  }

  function observeComments() {
    const commentsSection = document.querySelector(".comments");
    if (!commentsSection) return;

    const observer = new MutationObserver(() => {
      scanPage();
    });

    observer.observe(commentsSection, {
      childList: true,
      subtree: true
    });
  }

  function startObserving() {
    scanPage();
    observeComments();
  }


  init();

})();
