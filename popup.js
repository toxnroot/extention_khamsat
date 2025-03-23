document.addEventListener("DOMContentLoaded", () => {
  const repliesContainer = document.getElementById("repliesContainer");
  const deleteAllButton = document.getElementById("deleteAll");

   async function fetchSellerNameFromLink(profileUrl) {
    try {
      const response = await fetch(profileUrl);
      const htmlText = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      const sellerNameElement = doc.querySelector('h1.username');

      if (sellerNameElement) {
        const nameText = sellerNameElement.childNodes[0].textContent.trim();

        return nameText;
      } else {

        return "";
      }

    } catch (error) {
      alert("❌ خطأ  تحقق من الرابط!");
      console.error(error);
      return "";
    }
  }

   function checkSellerProfileLink() {
    chrome.storage.local.get(["sellerProfileLink", "sellerName"], async (result) => {
      let sellerProfileLink = result.sellerProfileLink || "";
      let sellerName = result.sellerName || "";

      if (!sellerProfileLink) {
      
        sellerProfileLink = prompt("🔗 أدخل رابط حسابك الشخصي على خمسات (مثال: https://khamsat.com/user/YourName):");

      
        if (!sellerProfileLink || !sellerProfileLink.startsWith("https://khamsat.com/user/")) {
          alert("❗ الرابط غير صحيح، حاول مرة أخرى!");
          return;
        }

      
        chrome.storage.local.set({ sellerProfileLink });
      }

    
      if (!sellerName) {
        sellerName = await fetchSellerNameFromLink(sellerProfileLink);

        if (sellerName) {
          chrome.storage.local.set({ sellerName });

        } else {

        }
      } else {

      }
    });
  }

 
  function timeAgoFromSaved(savedAt) {
    const now = new Date();
    const savedDate = new Date(savedAt);
    const diff = Math.floor((now - savedDate) / 1000);

    if (diff < 60) return `${diff} ثانية`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `${days} يوم`;
  }

 
  function loadReplies() {
    chrome.storage.local.get(["myReplies"], (result) => {
      const replies = result.myReplies || [];

      repliesContainer.innerHTML = ""; // Clear container

      if (replies.length === 0) {
        const noRepliesMessage = document.createElement("p");
        noRepliesMessage.textContent = "لا توجد عروض محفوظة.";
        repliesContainer.appendChild(noRepliesMessage);
        return;
      }

      replies.forEach((reply) => {
        const replyDiv = document.createElement("div");
        replyDiv.className = "reply";

        const titleEl = document.createElement("h2");
        titleEl.textContent = reply.title;
        replyDiv.appendChild(titleEl);

        const ownerEl = document.createElement("h3");
        ownerEl.textContent = `العميل: ${reply.owner}`;
        ownerEl.className = "owner";
        replyDiv.appendChild(ownerEl);

        const timeEl = document.createElement("h4");
        timeEl.textContent = `منذ: ${timeAgoFromSaved(reply.savedAt)}`;
        replyDiv.appendChild(timeEl);

        const linkEl = document.createElement("a");
        linkEl.href = reply.link;
        linkEl.className = "open-link";
        linkEl.target = "_blank";
        linkEl.textContent = "فتح العرض";
        replyDiv.appendChild(linkEl);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "حذف";
        deleteBtn.dataset.link = reply.link;
        deleteBtn.className = "delete";
        deleteBtn.addEventListener("click", () => {
          deleteReply(reply.link);
        });
        replyDiv.appendChild(deleteBtn);

        repliesContainer.appendChild(replyDiv);
      });
    });
  }

 
  function deleteReply(link) {
    chrome.storage.local.get(["myReplies"], (result) => {
      let myReplies = result.myReplies || [];
      myReplies = myReplies.filter(item => item.link !== link);
      chrome.storage.local.set({ myReplies }, () => {
        loadReplies();
      });
    });
  }

 
  deleteAllButton.addEventListener("click", () => {
    if (confirm("هل تريد حذف كل الردود؟")) {
      chrome.storage.local.set({ myReplies: [] }, () => {
        loadReplies();
      });
    }
  });

 
  checkSellerProfileLink(); 
  loadReplies(); 

  setInterval(() => {
    loadReplies();
  }, 60000);
});
