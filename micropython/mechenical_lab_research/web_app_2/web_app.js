const base = "http://192.168.61.208:8000";

w3.displayObject("whole", navObject);

const $ = function(f){
	return document.querySelector(f);
}

const $s = function(f){
	return document.querySelectorAll(f);
}

function jsonToPreformattedString(jsonData) {
	return JSON.stringify(jsonData, null, 4)  // Pretty-print with 4 spaces indentation
		.replace(/</g, "&lt;")   // Escape `<` to prevent HTML injection
		.replace(/>/g, "&gt;");  // Escape `>` to prevent HTML injection
}

let funcs_list = [];
let _csvOutput, _apiOutput;


window.onload = async ()=>{
	w3.hide("#content > div");
	w3.show("#content #Home");
	w3.addClass("#nav #Home","w3-light-gray");

	
	w3.hide("#Home  #Gcode-Editor");
	w3.hide("#Home  #Gcode-Upload");
	w3.show("#Home #Gcode-Editor");
	w3.addClass("#home-nav #gcode-edit","w3-light-gray");

	
	$("#Home #gcode-edit").addEventListener("click",(e)=>{
		w3.hide("#Home  #Gcode-Editor");
		w3.hide("#Home  #Gcode-Upload");
		w3.show("#Home #Gcode-Editor");
		w3.removeClass("#home-nav #gcode-upload","w3-light-gray");
		w3.addClass("#home-nav #gcode-edit","w3-light-gray");
	});
	$("#Home #gcode-upload").addEventListener("click",(e)=>{
		w3.hide("#Home  #Gcode-Editor");
		w3.hide("#Home  #Gcode-Upload");
		w3.show("#Home #Gcode-Upload");
		w3.removeClass("#home-nav #gcode-edit","w3-light-gray");
		w3.addClass("#home-nav #gcode-upload","w3-light-gray");
	});

	$("#Home #convert").addEventListener("click",(e)=>{
		w3.hide("#Home  #Gcode-Editor");
		w3.hide("#Home  #Gcode-Upload");
		w3.show("#Home #Gcode-Upload");
		w3.removeClass("#home-nav #gcode-edit","w3-light-gray");
		w3.addClass("#home-nav #gcode-upload","w3-light-gray");

		let gcodeString = $("#Home #Gcode-Editor-text").value;
		const { csvOutput, apiOutput } = parseGcode(gcodeString);
		_csvOutput = csvOutput;
		_apiOutput = apiOutput;
		$("#Home #Gcode-Upload-text").value = _apiOutput+"\n\n"+_csvOutput;
	});
	$("#Home #upload").addEventListener("click",async (e)=>{
		// console.log(_apiOutput,_csvOutput);
		await apiPost(base, "/api/writefile/motor_inits.txt",{"content":_apiOutput});
		const lines = _csvOutput.split("\n"); // Split CSV into lines
		const chunkSize = 5; // At least 10 lines per request

		for (let i = 0; i < lines.length; i += chunkSize) {
			const chunk = lines.slice(i, i + chunkSize).join("\n"); // Get a chunk
			$("#per").innerHTML = `${i} / ${lines.length}`;
			if(i==0){
				await apiPost(base, "/api/writefile/gcodes_convert.csv",{"content":chunk});
				continue;
			}
			await apiPost(base, "/api/appendfile/gcodes_convert.csv", { "content": chunk });
		}
	});

	$("#Home #upload-gcode").addEventListener("click",async (e)=>{
		// console.log(_apiOutput,_csvOutput);
		
		let gcodeString = $("#Home #Gcode-Editor-text").value;
		const lines = gcodeString.split("\n"); // Split CSV into lines
		const chunkSize = 5; // At least 10 lines per request

		for (let i = 0; i < lines.length; i += chunkSize) {
			const chunk = lines.slice(i, i + chunkSize).join("\n"); // Get a chunk
			$("#gcode-per").innerHTML = `${i} / ${lines.length}`;
			if(i==0){
				await apiPost(base, "/api/writefile/gcodes.txt",{"content":chunk});
				continue;
			}
			await apiPost(base, "/api/appendfile/gcodes.txt", { "content": chunk });
		}
	});

	w3.hide("#api-content > div");
	w3.show("#api-content #Help");
	w3.addClass("#api-nav #Help","w3-dark-gray");

	$("#api-content #Help pre").innerHTML = (await apiGet(base, "/api/help")).data;
	await loadApis();

	document.getElementById("Edit").addEventListener("keydown", function(event) {
		if (event.key === "Tab") {
			event.preventDefault();
			let start = this.selectionStart;
			let end = this.selectionEnd;
			
			// Insert tab character
			this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

			// Move cursor after tab
			this.selectionStart = this.selectionEnd = start + 1;
		}
	});
	
	
	
	var elements = document.querySelectorAll("#Documentation pre");
	for(let i=0 ; i<elements.length ; i++){
		let text = elements[i].innerHTML;
		elements[i].innerHTML = code[i];
	}
};

async function loadApis(){
	let apis = $("#api-content #Apis div#list");
	apis.innerHTML = "";
	funcs_list = (await apiGet(base, "/api/config")).data;
	for(let i=0 ; i<funcs_list.length ; i++){
		let li = document.createElement("div");
		w3.addClass(li,"w3-padding");
		let de = document.createElement("span");
		w3.addClass(de,"w3-button w3-red w3-margin-right");
		de.textContent = "Delete";
		de.addEventListener('click',async(e)=>{
			$("#model-delete").style.display='block';
			$("#model-delete-button").addEventListener("click",async(e)=>{
				let ff = funcs_list[i].route.replace(/\//g, "_").replace(/:(\w+)/g, "-$1");
				await removeAPI(base, funcs_list[i].method, ff);
				$("#model-delete").style.display='none';
			});
		});
		li.append(de);
		
		let edit = document.createElement("span");
		w3.addClass(edit,"w3-button w3-green w3-margin-right");
		edit.textContent = "Edit";
		edit.addEventListener("click",(e)=>{
			w3.hide("#api-content > div");
			w3.show("#api-content #Editor");
			w3.removeClass("#api-nav a","w3-dark-gray");
			w3.addClass("#api-nav #Editor","w3-dark-gray");
			$("#api-content #Editor #Edit").innerHTML = funcs_list[i].code;

			$("#upload").addEventListener("click",(e)=>{
				let ff = funcs_list[i].route.replace(/\//g, "_").replace(/:(\w+)/g, "-$1");
				// console.log($("#api-content #Editor #Edit").innerHTML);
				fetch(`${base}/api/addapi/method/${funcs_list[i].method}/route/${ff}/handler/${funcs_list[i].handler}`, {
					method: "POST",
					mode: "no-cors",  // Ensure CORS is enabled
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ code: $("#api-content #Editor #Edit").value })
				})
				.then(response => {
					// console.log(response.text());
					$("#model-create").style.display='none';
					return response.json();
				})
				.then(data => console.log("Success:", data))
				.catch(error => console.error("Error:", error));
			});
		});
		li.append(edit);
		li.append(`${funcs_list[i].method} --- ${funcs_list[i].route}`);
		apis.appendChild(li);
	}
}

// Fetch List of Routes
function fetchRoutes() {
	fetch(`${base}/api/listroutes`)
	.then(res => res.json())
	.then(data => {
		const list = document.getElementById("routes-list");
		list.innerHTML = "";
		// console.log(data);
		data.data.GET.forEach(route => {
			let li = document.createElement("li");
			li.textContent = `GET - ${route}`;
			list.appendChild(li);
		});
		data.data.POST.forEach(route => {
			let li = document.createElement("li");
			li.textContent = `POST - ${route}`;
			list.appendChild(li);
		});
	})
	.catch(err => console.error("Error:", err));
}

const set_selected = function(name){
	console.log(name);
	w3.removeClass("#nav a","w3-light-gray");
	w3.hide("#content > div");
	w3.addClass('#nav '+name,"w3-light-gray");
	w3.show("#content "+name);
}

const set_api_selected = function(name){
	w3.removeClass("#api-nav a","w3-dark-gray");
	w3.hide("#api-content > div");
	w3.addClass('#api-nav '+name,"w3-dark-gray");
	w3.show("#api-content "+name);
}


async function removeAPI(base, method, route) {

	await fetch(`${base}/api/removeroute/method/${method}/route/${route}`)
		.then(res => res.text())
		.then(data => alert("API Removed: " + JSON.stringify(data)))
		.catch(
			err =>{
				return {"Error:": err}
			}
		);
}


async function apiGet(base, url) {
	return await fetch(`${base}${url}`)
	.then(res => res.json())
	.then(data => {
		return data;
	})
	.catch(
		err =>{
			return {"Error:": err}
		}
	);
}

async function apiPost (base, url, data) {
	// let url = document.getElementById("post-api-route").value;
	// let code = document.getElementById("post-api-code").value;
	// console.log(JSON.stringify({score: code}) ,`${BASE_URL}${url}`);

	return await fetch(`${base}${url}`, {
		method: "POST",
		mode: "no-cors",  // Ensure CORS is enabled
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	})
	.then(response => response.text())
	.then(data => {
		fetch(`${base}/api/postresponse`)
		.then(res => res.json())
		.then(data => {
			const jsonPart = data.data.split("\r\n\r\n")[1];
			const parsedData = JSON.parse(jsonPart);
			// document.getElementById("test-output-post").innerText = jsonToPreformattedString(parsedData);
			return parsedData;
		})
		.catch(
			err =>{
				return {"Error:": err}
			}
		);
	})
	.catch(
		err =>{
			return {"Error:": err}
		}
	);
}

function addAPI() {
	let method = $("#model-create #api-method").value;
	let route = $("#model-create #api-route").value;
	let handler =$("#model-create #api-handler").value;
	let code = $("#model-create #api-code").value;

	fetch(`${base}/api/addapi/method/${method}/route/${route}/handler/${handler}`, {
		method: "POST",
		mode: "no-cors",  // Ensure CORS is enabled
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ code })
	})
	.then(response => {
		// console.log(response.text());
		$("#model-create").style.display='none';
		return response.json();
	})
	.then(data => console.log("Success:", data))
	.catch(error => console.error("Error:", error));
}



function testAPIGet() {
	let url = document.getElementById("test-url").value;
	fetch(`${base}${url}`)
	.then(res => res.json())
	.then(data => {
		document.getElementById("test-output").innerText = jsonToPreformattedString(data);
		// console.log(data);
	})
	.catch(err => console.error("Error:", err));
}

function testAPIPost() {
	let url = document.getElementById("post-api-route").value;
	let code = document.getElementById("post-api-code").value;
	// console.log(JSON.stringify({score: code}) ,`${BASE_URL}${url}`);

	fetch(`${base}${url}`, {
		method: "POST",
		mode: "no-cors",  // Ensure CORS is enabled
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({data: JSON.parse(code)})
	})
	.then(response => response.text())
	.then(data => {
		fetch(`${base}/api/postresponse`)
		.then(res => res.json())
		.then(data => {
			const jsonPart = data.data.split("\r\n\r\n")[1];
			const parsedData = JSON.parse(jsonPart);
				document.getElementById("test-output-post").innerText = jsonToPreformattedString(parsedData);
				// console.log(data);
		})
		.catch(err => console.error("Error:", err));
	})
	.catch(error => console.error("Error:", error));
}