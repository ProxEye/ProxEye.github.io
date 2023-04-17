
const table = document.createElement('table');
tableInit(table);

const urls = [
    "https://whocars123-oai-proxy.hf.space/",
    "https://whocars123-oai-proxy2.hf.space/",
    "https://anonjegger340-coom-tunnel.hf.space/",
    "https://gookproxy-coomlemon.hf.space/",
    "https://whocars123-public-test.hf.space/",
    "https://anonjegger340-logged-cooms.hf.space/",
    "https://maceter636-8874416364.hf.space/"
];

renderMultipleTables(urls);
document.body.appendChild(table);  

function copyText(btn) {
    var text = $(btn).closest('tr').text();
    navigator.clipboard.writeText(text.trim());
}
function tableInit(table){
    //name, url, maxOutputTokens, rejectSampleRate, logPrompts, modelRateLimit, keyinfo: all, gpt4, quotaLeft:gpt4
    const headers = ['Name', 'URL', 'Max Output Tokens', 'Prompts Logging', 'Model Rate limit', 'Reject Sample rate', 'Available'];
    addRow(headers, true);
}
function addRow(Elements, isHeader = false, fontColor = null) {
    const row = document.createElement('tr');
    const type = isHeader ? 'th' : 'td';
    Elements.forEach((elem, index) => {
        const cell = document.createElement(type);
        cell.textContent = elem;
        if (index === 1 && !isHeader) {
            // cell.style.padding ="20px";
            const button = document.createElement('button');
            button.textContent = '📋';
            button.style.float = "right";
            button.addEventListener('click', () => {
                navigator.clipboard.writeText(elem);
            });
            cell.appendChild(button);
        }
        if (fontColor !== null) {
            cell.style.color = fontColor[index];
        }
        row.appendChild(cell);
    });
    table.appendChild(row);
}
function queryUrl(url) {
    // Fetch site contents using XMLHttpRequest.
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
            // If request successful, print fetched content into pre element.
            if (this.status === 200) {
                const content = this.responseText;
                // Extract text between <pre> tags
                const startIndex = content.indexOf("<pre>") + "<pre>".length;
                const endIndex = content.indexOf("</pre>");
                const preText = JSON.parse(content.substring(startIndex, endIndex));

                // Parse text for uptime key using regex and print value
                const name = preText.endpoints.openai.split(".")[0].split("//")[1];
                // create table headers
                addRow([name, preText.endpoints.openai, preText.config.maxOutputTokens]);
                document.body.appendChild(table);
            } 
            else {    
                console.error('Error fetching site contents:', this.statusText);
            }
        }
    };
    xhr.open('GET', url);
    xhr.send();
}
function parseAndCleanHtml(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    function extractFromTag(tag) {
        const tagElements = doc.getElementsByTagName(tag);
        return Array.from(tagElements).map(elem => elem.textContent.trim());
    }
    return extractFromTag("pre");
}
function extractJSON(json) {
    var name = null;
    var url = null;
    var maxToken = null;
    var logging = null;
    var rateLimit = null;
    var sampRate = null;
    var quotaAll = null;
    var quotaGPT4 = null;
    var isGPT4 = 0;
    var available = false;
    //Standard
    if (json.keyInfo) {
        name = json.endpoints.openai.split(".")[0].split("//")[1];
        url = json.endpoints.openai + "/v1";
        maxToken = json.config.maxOutputTokens;
        logging = (json.config.promptLogging == "true") ? "Yes" : "No";
        rateLimit = json.config.modelRateLimit;
        sampRate = json.config.rejectSampleRate;
        isGPT4 = json.keyInfo.gpt4;
        console.log(name);
        quotaAll = parseFloat(json.keyInfo.quotaLeft.all);
        quotaGPT4 = parseFloat(json.keyInfo.quotaLeft.gpt4);
    }
    //Ruski
    else {
        name = json.api.split(".")[0].split("//")[1];
        url = json.api;
        maxToken = json.config.maxOutputTokens;
        logging = (json.config.promptLogging == "true") ? "Yes" : "No";
        rateLimit = json.config.modelRateLimit;
        sampRate = json.config.rejectSampleRate;
        isGPT4 = json['gpt-4'].active;
        quotaAll = parseFloat(json['gpt-3.5-turbo'].remaining);
        quotaGPT4 = parseFloat(json['gpt-4'].remaining);
    }

    retStr = "GPT3.5: " + quotaAll + "%";
    if (isGPT4 > 0)
        if (quotaGPT4 == NaN){
            if(quotaAll > 0) {
                retStr += "GPT4: " + quotaAll + "%";
                available = true;
            }
        }
        else
            if(quotaGPT4 > 0) {
                retStr = "GPT4: " + quotaGPT4 + "%";
                available = true;
            }

    return [[name, url, maxToken, logging, rateLimit, sampRate, retStr], available];
}
function renderMultipleTables(urls) {
    const tableContainer = document.createElement("div");
    async function fetchAndParseHTML(url) {
        const response = await fetch(url);
        const textData = await response.text();
        return parseAndCleanHtml(textData);
    }
    urls.forEach(async (url) => {
        const data = await fetchAndParseHTML(url);
        const json = JSON.parse(data[0]);
        row = extractJSON(json);
        addRow(
            row[0]
            , false, 
            [
                "0", "0", "0", 
                (json.config.promptLogging == "true") ? "red" : "blue", 
                "0", "0", 
                row[1] ? "green" : "0", 
            ]
        );
    });
}
