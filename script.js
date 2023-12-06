const trackingKey = 'FEE539C0-D206-A685-88F8-0E433FCDFD1D';
const indexID = "1aea39a03a7b0321ba0235873067c0de1688376571";

const texts = document.querySelector('.speechToText-speechReco_textarea');
const startBtn = document.querySelector('.speechToText-speechReco_startBtn');
const langSelect = document.querySelector('.speechToText-speechReco_dropdown');
const output = document.querySelector('.speechToText-output_container');

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null; 

async function toggleSpeechRecognition() {
    if (!recognition) {
        recognition = new window.SpeechRecognition();
        recognition.interimResults = true;
        recognition.lang = langSelect.value;
        recognition.onstart = () => {
            texts.innerHTML = ''
            startBtn.textContent = "Stop";
        };
        recognition.onend = () => {
            recognition = null;
            startBtn.textContent = "Start!";
        };
        recognition.onresult = (e) => {
            const text = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')
            texts.innerHTML = text;
            recognition.stop()
            searchWithQuery(text);
            displayData(text)
        }
        recognition.start();
    } else {
        recognition.stop();
        recognition = null;
        startBtn.textContent = "Start!";
    }
}

langSelect.addEventListener('change', () => texts.innerHTML = '')

async function fetchData(query) {
    const apiUrl = `https://api.synerise.com/search/v2/indices/${indexID}/query?query=${query}`;
    const response = await fetch(apiUrl, {
        headers: {
            "x-api-key": trackingKey,
        },
    });
    if (!response.ok) {
        throw new Error('No data found.');
    } else {
        const data = await response.json();
        return data;
    }
}

async function searchWithQuery(query) {
    try {
        const data = await fetchData(query);
    } catch (error) {
        console.log("Error:", error);
    }
}

const displayData = async (query) => {
    let payload = await fetchData(query);

    let displayItems = payload.data.map((item) => {
        return `
        <div class="speechToText-output_item">
            <a href="${item.productUrl}">
                <img class="speechToText-output_img" src="${item.image}" alt="${item.name}" />
                <h3 class="speechToText-output_name">${item.name.substring(0, 25)}...</h3>
                <p class="speechToText-output_price">Price: ${parseInt(item.price).toFixed(2)}</p>
            </a>
        </div>
        `
    })

    output.innerHTML = displayItems;
}
startBtn.addEventListener('click', () => toggleSpeechRecognition())