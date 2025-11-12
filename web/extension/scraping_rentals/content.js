async function scrapePage() {
  let all = document.querySelectorAll(".listing-split-view-wrapper > div");
  let selectors = [
    ".price .displayConsumerPrice",
    ".price .displayListingPrice",
    ".address",
    ".property-type",
    ".feature-item:nth-of-type(1)",
    ".feature-item:nth-of-type(2)",
    ".feature-item:nth-of-type(3)",
  ];
  let keys = [
    "usd",
    "inr",
    "address",
    "property-type",
    "bedrooms",
    "bathrooms",
    "area in sq ft",
  ];
  let pageData = [];

  all.forEach((p) => {
    let row = {};
    for (let i = 0; i < selectors.length; i++) {
      let el = p.querySelector(selectors[i]);
      row[keys[i]] = el ? el.textContent.trim() : "";
    }
    pageData.push(row);
  });

  return pageData;
}

async function runScraper() {
  let { scraping, results = [] } = await chrome.storage.local.get([
    "scraping",
    "results",
  ]);
  if (!scraping) return; // Do nothing if not in scraping mode

  // Scrape current page
  let pageData = await scrapePage();
  results.push(...pageData);
  await chrome.storage.local.set({ results });

  // Find next page button
  let nextBtn = document.querySelector(
    ".ant-pagination-next:not(.ant-pagination-disabled)"
  );
  if (nextBtn) {
    nextBtn.click(); // Go to next page
  } else {
    console.log("No more pages.");
  }
}

// Run when the content script loads
runScraper();
