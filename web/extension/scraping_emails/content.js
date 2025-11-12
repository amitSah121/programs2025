// async function scrapePage() {
//   let all = document.querySelectorAll(".views-row");
//   let selectors = [
//     "div div h3 a",
//     "div div .text-prussianDark",
//     "div div div.research-interests-list ul li:nth-child(1)",
//     "div div div.research-interests-list ul li:nth-child(2)",
//     "div div div.research-interests-list ul li:nth-child(3)",
//     "div div div.research-interests-list ul li:nth-child(4)",
//     "div div div.research-interests-list ul li:nth-child(5)",
//   ];
//   let keys = [
//     "name",
//     "position",
//     "interest 1",
//     "interest 2",
//     "interest 3",
//     "interest 4",
//     "interest 5",
//   ];
//   let pageData = [];

//   all.forEach((p) => {
//     let row = {};
//     for (let i = 0; i < selectors.length; i++) {
//       let el = p.querySelector(selectors[i]);
//       row[keys[i]] = el ? el.textContent.trim() : "";
//     }
//     pageData.push(row);
//   });
//   console.log(pageData);

//   return pageData;
// }

// async function runScraper() {
//   let { scraping, results = [] } = await chrome.storage.local.get([
//     "scraping",
//     "results",
//   ]);
//   if (!scraping) return; // Do nothing if not in scraping mode

//   // Scrape current page
//   let pageData = await scrapePage();
//   results.push(...pageData);
//   await chrome.storage.local.set({ results });

//   // Find next page button
//   let nextBtn = document.querySelector(".pager__item--next-rpl a");
//   if (nextBtn) {
//     nextBtn.click(); // Go to next page
//   } else {
//     console.log("No more pages.");
//   }
// }

// // Run when the content script loads
// runScraper();

async function scrapePage() {
  const all = document.querySelectorAll(".views-row");
  const selectors = [
    "div div h3 a",
    "div div .text-prussianDark",
    "div div div.research-interests-list ul li:nth-child(1)",
    "div div div.research-interests-list ul li:nth-child(2)",
    "div div div.research-interests-list ul li:nth-child(3)",
    "div div div.research-interests-list ul li:nth-child(4)",
    "div div div.research-interests-list ul li:nth-child(5)",
  ];
  const keys = [
    "name",
    "position",
    "interest 1",
    "interest 2",
    "interest 3",
    "interest 4",
    "interest 5",
  ];

  const pageData = [];

  all.forEach((p) => {
    const row = {};
    for (let i = 0; i < selectors.length; i++) {
      const el = p.querySelector(selectors[i]);
      row[keys[i]] = el ? el.textContent.trim() : "";
    }
    pageData.push(row);
  });

  console.log("Scraped", pageData.length, "rows");
  return pageData;
}

async function runScraper() {
  const { scraping, results = [] } = await chrome.storage.local.get([
    "scraping",
    "results",
  ]);
  if (!scraping) return; // stop if not active

  // Scrape current set of visible data
  const pageData = await scrapePage();
  results.push(...pageData);
  await chrome.storage.local.set({ results });

  // Try to click "Next" button
  const nextBtn = document.querySelector(".pager__item--next-rpl a");
  if (nextBtn) {
    console.log("Next page detected, clicking...");
    nextBtn.click();
  } else {
    console.log("No more pages to scrape.");
  }
}

// ---- SPA-AWARE observer ----
function observeForNextPage() {
  let lastPageSignature = "";

  const observer = new MutationObserver(async () => {
    // Build a signature to detect new content (using first row’s name)
    const first = document.querySelector(".views-row div div h3 a");
    const newSignature = first ? first.textContent.trim() : "";

    if (newSignature && newSignature !== lastPageSignature) {
      lastPageSignature = newSignature;
      console.log("Detected new page content, scraping...");
      await runScraper();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// ---- Run when content script loads ----
(async () => {
  console.log("Starting SPA-aware scraper...");
  observeForNextPage();
  await runScraper(); // Run initial page
})();
