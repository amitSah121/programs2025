document.getElementById("start").addEventListener("click", () => {
  chrome.storage.local.set({ scraping: true }, () => {
    document.getElementById("status").textContent = "Scraping started.";
  });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.storage.local.clear(() => {
    document.getElementById("status").textContent =
      "Scraping stopped and data cleared.";
    document.getElementById("results").innerHTML = "";
  });
});

// document.getElementById("downloadBtn").addEventListener("click", () => {
//   const textData = document.querySelector("");

//   chrome.runtime.sendMessage({
//     filename: "hello.txt",
//     fileContent: textData,
//   });
// });

document.getElementById("downloadBtn").addEventListener("click", () => {
  // Retrieve whatever is stored under "results"
  chrome.storage.local.get(["results"], (data) => {
    // Check if there’s data
    if (!data.results) {
      alert("No data found in local storage!");
      return;
    }

    // Convert the stored data to text (stringify if it’s an object)
    let textData;
    if (typeof data.results === "object") {
      textData = JSON.stringify(data.results, null, 2);
    } else {
      textData = String(data.results);
    }

    // Send it to background for download
    chrome.runtime.sendMessage({
      filename: "hello.txt",
      fileContent: textData,
    });
  });
});

// Load results whenever popup opens
chrome.storage.local.get(["results"], (data) => {
  let listEl = document.getElementById("results");
  listEl.innerHTML = "";
  if (data.results && data.results.length > 0) {
    document.getElementById(
      "status"
    ).textContent = `Found ${data.results.length} listings so far.`;
    let temp = document.createElement("li");
    temp.textContent +=
      "usd;cad;address;property_type;bedrooms;bathrooms;area_in_sq_ft";
    listEl.appendChild(temp);
    data.results.forEach((item) => {
      let li = document.createElement("li");
      //   console.log(item);
      try {
        li.textContent += `${item["usd"].split(" ")[1]};`;
        li.textContent += `${item["inr"].split(" ")[1]};`;
        li.textContent += `${item["address"]};`;
        li.textContent += `${item["property-type"]};`;
        li.textContent += `${item["bedrooms"]};`;
        li.textContent += `${item["bathrooms"]};`;
        li.textContent += `${item["area in sq ft"]}`;
      } catch (e) {
        li.textContent += `\n`;
      }
      li.textContent += `\n`;
      listEl.appendChild(li);
    });
  }
});
