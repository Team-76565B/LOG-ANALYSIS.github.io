function parseFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please upload a file!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const logData = event.target.result;
        const parsedData = parseLogData(logData);
        displayTable(parsedData);
        saveToCookies(parsedData);
        displayGraph(parsedData);
        displayRecentLogs();
    };
    reader.readAsText(file);
}

function parseLogData(logData) {
    const regex = /Adjusted PID Constants: Kp = ([\d.]+), Ki = ([\d.]+), Kd = ([\d.]+) Trial Nr\.:([\d]+)/g;
    const trialData = [];
    let match;

    while ((match = regex.exec(logData)) !== null) {
        const [_, Kp, Ki, Kd, trialNr] = match;
        trialData.push({
            trialNr: parseInt(trialNr),
            Kp: parseFloat(Kp),
            Ki: parseFloat(Ki),
            Kd: parseFloat(Kd),
        });
    }
    return trialData;
}

function displayTable(data) {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';
    data.forEach(entry => {
        const row = `
            <tr>
                <td>${entry.trialNr}</td>
                <td>${entry.Kp}</td>
                <td>${entry.Ki}</td>
                <td>${entry.Kd}</td>
            </tr>`;
        tableBody.innerHTML += row;
    });
}

function displayGraph(data) {
    const ctx = document.getElementById('pidChart').getContext('2d');
    const trialNumbers = data.map(entry => entry.trialNr);
    const KpValues = data.map(entry => entry.Kp);
    const KiValues = data.map(entry => entry.Ki);
    const KdValues = data.map(entry => entry.Kd);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trialNumbers,
            datasets: [
                { label: 'Kp', data: KpValues, borderColor: 'red', fill: false },
                { label: 'Ki', data: KiValues, borderColor: 'blue', fill: false },
                { label: 'Kd', data: KdValues, borderColor: 'green', fill: false },
            ]
        }
    });
}

function saveToCookies(data) {
    Cookies.set('pidLog', JSON.stringify(data), { expires: 7 });
}

function displayRecentLogs() {
    const recentLogs = JSON.parse(Cookies.get('pidLog') || '[]');
    const recentLogsList = document.getElementById('recentLogs');
    recentLogsList.innerHTML = '';

    recentLogs.forEach(log => {
        const logItem = `<li>Trial ${log.trialNr}: Kp=${log.Kp}, Ki=${log.Ki}, Kd=${log.Kd}</li>`;
        recentLogsList.innerHTML += logItem;
    });
}
