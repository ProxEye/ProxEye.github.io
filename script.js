const fetch = require('node-fetch');
const cheerio = require('cheerio');

const URL = 'https://whocars123-oai-proxy.hf.space';

async function getEndpoints() {
const response = await fetch(URL);
const htmlString = await response.text();

const $ = cheerio.load(htmlString);

// Find the tag and parse its text as JSON
  const parsedData = JSON.parse($('pre').text());


// Find the "openai" endpoint in the parsed data
  const endpointUrl = Object.values(parsedData.endpoints).find(endpoint => endpoint.includes('openai'));

// Get the name of the endpoint from its URL
  const endpointName = new URL(endpointUrl).hostname.split('.')[0];

// Create a table with the name and URL and output it to HTML
  const outputHtml = 
    <table>
      <tr>
        <th>Name</th>
        <th>URL</th>
      </tr>
      <tr>
        <td>${endpointName}</td>
        <td>${endpointUrl}</td>
      </tr>
    </table>;

// Output the table to our page
  document.getElementById('output').innerHTML = outputHtml;
}
getEndpoints();