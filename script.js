const addCourseBtn = document.getElementById('add-course-btn');
const addSiteBtn = document.getElementById('add-site-btn');
const input_course = document.getElementById('course-name');
const coursesList = document.getElementById('courses-list');
const totalTimeSpan = document.getElementById('total-time');
const pourcents = document.getElementById('popupButton');
const h1title = document.querySelector('h1');
const h2title = document.querySelector('h2');
console.log(h2title.innerHTML);
const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const bodyE1 = document.querySelector("body");
const containerE1 = document.querySelector(".container");
const inputE1 = document.querySelector(".input");
const custom_button = document.getElementById('popupButton');
const statistics = document.querySelector('.statistics');
const close_img = document.querySelector('.close');
const table_stats = document.querySelector('.table_stats');
const menu = document.querySelector('.menu');
const tools = document.getElementById('tools');
const menuToggle = document.getElementById('menu-toggle');
const a_link = document.querySelector('.links');

inputE1.checked = JSON.parse(localStorage.getItem("mode")) || false;

let stats_mode = 0;
let totalSeconds = 0;
let start_time = 0;
let current_time = 0;
let number_of_plays = 0;
let courses = JSON.parse(localStorage.getItem('courses')) || {};
let chartcolor = "rgb(30, 30, 30)";
let timeChart = null; // Initialisation de la variable
let r = document.querySelector(':root');
function openMenu() {
    if (tools.style.display === "flex") {
        tools.style.transform = "scale(1, 0)";
        tools.style.opacity = "0";
        coursesList.style.transition = "transform 0.5s";
        coursesList.style.transform = "translate(0, -388px)";
        setTimeout(() => {
            coursesList.style.transition = "transform 0s";
            coursesList.style.transform = "translate(0, 0px)";
            tools.style.display = "none";
        }, 500);
    } else {
        coursesList.style.transition = "transform 0.5s";
        coursesList.style.transform = "translate(0, 388px)";
        tools.style.opacity = "1";
        setTimeout(() => {
            tools.style.display = "flex";
            coursesList.style.transition = "transform 0s";
            coursesList.style.transform = "translate(0, 0px)";
            tools.style.transform = "scale(1, 1)";
        }, 450);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    for (const name in courses) {
        addexistingCourses(name, courses[name].seconds, courses[name].interval, courses[name].notes, courses[name].history);
        totalSeconds += courses[name].seconds;
        updateTimeDisplay(courses[name].seconds, document.querySelector(`[data-course="${name}"] .time`));
        updateTimeDisplay(totalSeconds, totalTimeSpan);
        
    }
    totalTimeSpan.addEventListener('click', () => alertetimer());
    addCourseBtn.addEventListener('click', () => {
        const courseName = document.getElementById('course-name').value;
        if (courseName && !courses[courseName]) {
            addCourse(courseName);
            document.getElementById('course-name').value = '';
        }
    });
    addSiteBtn.addEventListener('click', () => {
        const siteName = document.getElementById('site-name').value;
        addsite(siteName);
        document.getElementById('site-name').value = '';
        document.getElementById('site-url').value = '';
    });
    function addexistingCourses(name, les_secondes, intervalle, les_notes, historique) {
        if (historique instanceof Array){
            historique = historique.length;
        }
        const course = {
            name,
            seconds: les_secondes,
            interval: intervalle,
            notes: les_notes,
            history: historique
        };
        courses[name] = course;

        const courseElement = document.createElement('div');
        courseElement.classList.add('course');
        courseElement.setAttribute('data-course', name);
        courseElement.innerHTML = `
            <h3>${name}</h3>
            <div class="time-info" id="course-${name}">
                <button class="play-btn" title="Lance le chronomètre pour le cours">Play</button>
                <button class="stop-btn" title="Arrête le chronomètre pour le cours" disabled>Stop</button>
                <button class="add-notes-btn" title="Ajouter une note à propos de la session de travail">Notes</button>
                <span class="time">0:00:00</span>
                <button class="close-course" id="close-course-${name}">&times;</button>
                <div class="notes-container" style="display:none"><b>Notes : </b></div>
            </div>
        `;

        const playBtn = courseElement.querySelector('.play-btn');
        const stopBtn = courseElement.querySelector('.stop-btn');
        const closeBtn = courseElement.querySelector('.close-course');
        const timeSpan = courseElement.querySelector('.time');
        const notesBtn = courseElement.querySelector('.add-notes-btn');
        const timering = courseElement.querySelector('.time');
        const notesContainer = courseElement.querySelector('.notes-container');

        playBtn.addEventListener('click', () => startTimer(course, timeSpan, playBtn, stopBtn));
        stopBtn.addEventListener('click', () => stopTimer(course, playBtn, stopBtn, courseElement));
        closeBtn.addEventListener('click', () => removeCourse(name, courseElement));
        notesBtn.addEventListener('click', () => addNotes(course, courseElement));
        timering.addEventListener('click', () => alertetimer());
        if (course.notes.length > 0) {
            notesContainer.style.display = 'flex';
            les_notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.classList.add('note');
                noteElement.textContent = `${note.note}`;
                notesContainer.appendChild(noteElement);
            });
        }  

        coursesList.appendChild(courseElement);
    }
    function addsite(name, url) {
        const siteElement = document.createElement('div');
        siteElement.classList.add('sites-ref');
        siteElement.innerHTML = `
        <img src="https://cdn2.iconfinder.com/data/icons/university-tuition-and-college-1/122/Icons-07-512.png" alt="Logo" class="logo">
        <span class="site"><a href="${url}" target="_blank">${name}</a></span>
        `;
        tools.appendChild(siteElement);
    }
    function addCourse(name) {
        const course = {
            name,
            seconds: 0,
            interval: null,
            notes: [],
            history: 0
        };

        courses[name] = course;

        const courseElement = document.createElement('div');
        courseElement.classList.add('course');
        courseElement.setAttribute('data-course', name);
        courseElement.innerHTML = `
            <h3>${name}</h3>
            <div class="time-info">
                <button class="play-btn" title="Lancer le chronomètre pour le cours">Play</button>
                <button class="stop-btn" title="Arrêter le chronomètre pour le cours" disabled>Stop</button>
                <button class="add-notes-btn" title="Ajouter une note à propos de ta session de travail">Notes</button>
                <span class="time">0:00:00</span>
                <button class="close-course" id="close-course-${name}">&times;</button>
                <div class="notes-container" style="display:none">Commentaires : <br></div>
            </div>
        `;

        const playBtn = courseElement.querySelector('.play-btn');
        const stopBtn = courseElement.querySelector('.stop-btn');
        const closeBtn = courseElement.querySelector('.close-course');
        const timeSpan = courseElement.querySelector('.time');
        const notesBtn = courseElement.querySelector('.add-notes-btn');
        const timering = courseElement.querySelector('.time');

        playBtn.addEventListener('click', () => startTimer(course, timeSpan, playBtn, stopBtn));
        stopBtn.addEventListener('click', () => stopTimer(course, playBtn, stopBtn, courseElement));
        closeBtn.addEventListener('click', () => removeCourse(name, courseElement));
        notesBtn.addEventListener('click', () => addNotes(course, courseElement));
        timering.addEventListener('click', () => alertetimer());

        coursesList.appendChild(courseElement);
        updatelocalStorage();
    }
    function alertetimer(){
        alert("FORMAT DE L'HEURE :\n\n   - Heure : Minutes : Secondes\n   - (d) Jours : Heures : Minutes\n");
    }

    function removeCourse(name, courseElem) {
        stopTimer(courses[name], courseElem.querySelector('.play-btn'), courseElem.querySelector('.stop-btn'), courseElem);
        totalSeconds -= courses[name].seconds;
        updateTimeDisplay(totalSeconds, totalTimeSpan);
        delete courses[name];
        const courseElement = document.querySelector(`[data-course="${name}"]`);
        courseElement.remove();
        if (coursesList.children.length === 0) {
            totalSeconds = 0;
            updateTimeDisplay(totalSeconds, totalTimeSpan);
        }
        updatelocalStorage();
    }

    function startTimer(course, timeSpan, playBtn, stopBtn) {
        if (number_of_plays > 0) {
            alert("Pas possible de travailler sur plusieurs cours en même temps (et je sais pas comment on fait pour que ça marche dans le programme). Donc Arrêez le chrono en cours pour en lancer un autre.");
            return 0;
        }
        number_of_plays++;

        playBtn.disabled = true;
        stopBtn.disabled = false;
        let sessionStart = new Date();
        start_time = sessionStart.getTime();
        current_time = start_time;
        course.history++;

        course.interval = setInterval(() => {
            let current = new Date();
            let time_passed = Math.floor((current.getTime() - current_time)/1000);
            current_time = current.getTime();
            course.seconds += time_passed;
            totalSeconds += time_passed;
            updateTimeDisplay(course.seconds, timeSpan);
            updateTimeDisplay(totalSeconds, totalTimeSpan);
            updatelocalStorage();
        }, 1000);
    }

    function stopTimer(course, playBtn, stopBtn, courseElement) {
        number_of_plays--;
        let sessionEnd = new Date();
        end_time = sessionEnd.getTime();
        let session_duration = Math.floor((end_time - start_time)/1000);
        let hours = Math.floor(session_duration / 3600);
        let minutes = Math.floor((session_duration % 3600) / 60);
        let secs = session_duration % 60;
        playBtn.disabled = false;
        stopBtn.disabled = true;
        clearInterval(course.interval);
        addNotes(course, courseElement, "Temps de travail " + `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `);
        updatelocalStorage();
    }

    function updateTimeDisplay(seconds, element) {
        const days = Math.floor(seconds/86400)
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (seconds < 86400) {
            element.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            element.textContent = `(d) ${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        
    }

    function addNotes(course, courseElement, text_note = null) {
        const date = new Date();
        let text_time = `${date.getDate()} ${months[date.getMonth()]} ${date.getHours().toString().padStart(2, '0')}h${date.getMinutes().toString().padStart(2, '0')} : `;
        if (text_note != null) {
            text_note = text_time + text_note;
            course.notes.push({ time: new Date(), note: text_note});
            displayNotes(course, courseElement);
        } else {
            let notes = prompt('Ajouter des notes pour cette session :');
            notes = text_time + notes;
            course.notes.push({ time: new Date(), note: notes });
            displayNotes(course, courseElement);
        }
    }

    function displayNotes(course, courseElement) {
        const notesContainer = courseElement.querySelector('.notes-container');
        notesContainer.style.display = 'flex';
        notesContainer.innerHTML = '<b>Notes :</b>'; // Clear previous notes
        course.notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.textContent = `${note.note}`;
            notesContainer.appendChild(noteElement);
        });
        updatelocalStorage();
    }
    function updatePercentage() {
        let alertBox = document.getElementById("customAlertBox");
        let alert_Message_container = document.getElementById("alertMessage");

        alert_Message_container.innerHTML = "<h3>Pourcentage de travail par cours</h3>";
        for (const name in courses) {
            const course = courses[name];
            const percentage = totalSeconds > 0 ? Math.round((course.seconds / totalSeconds) * 100) : 0;
            alert_Message_container.innerHTML += `${name}` + "  :  " + `${percentage}%<br><br>`;
            alertBox.style.display = "block";
        }
        const courseNames = Object.keys(courses);
        const timeSpent = courseNames.map(name => courses[name].seconds / 3600); // Convertir les secondes en heures


        if (timeChart) {
            console.log("Destroying existing chart"); // Ajouter un log pour vérifier
            try {
                timeChart.destroy(); // Détruire le graphique existant avant d'en créer un nouveau
            } catch (error) {
                console.error("Error destroying chart:", error); // Capturer les erreurs de destruction
            }
        }

        const ctx = document.getElementById('timeChart').getContext('2d');

        timeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: courseNames,
                datasets: [{
                    label: 'Temps passé (heures)',
                    data: timeSpent,
                    borderWidth: 0.5
                }]
            },
            options: {
                scales: {},
                color: chartcolor,
            }
        });
    }
    function updatePercentage2() {
        let alertBox = document.getElementById("customAlertBox");
        let alert_Message_container = document.getElementById("alertMessage");

        alert_Message_container.innerHTML = "<h3>Pourcentage de travail par cours</h3>";
        let tabledoc = "";
        tabledoc += "<table class='table_stats' style='width:100%; font-size:14px;'><colgroup><col span='1' style='background-color: var(--tr-color)'></colgroup><tr style='background-color:var(--tr-title-color);'><td style='width:25%;'><b>Nom du cours</b></td><td style='width:25%;'><b>Pourcentage</b></td><td style='width:25%;'><b>Nombre de sessions</b></td><td><b>Temps moyen</b></td></tr>";
        //alert_Message_container.innerHTML += `<table style="width:100%"><tr><th>Cours</th><th>Pourcentage</th><th>Nombre de sessions</th></tr>`;
        for (const name in courses) {
            const course = courses[name];
            const number_sessions = course.history;
            const average_session = number_sessions > 0 ? Math.round(course.seconds / number_sessions) : 0;
            const average_session_hours = Math.floor(average_session / 3600);
            const average_session_minutes = Math.floor((average_session % 3600) / 60);
            const average_session_seconds = average_session % 60;
            const percentage = totalSeconds > 0 ? Math.round((course.seconds / totalSeconds) * 100) : 0;
            //alert_Message_container.innerHTML += `<tr style="width:100%"><td>${name}</td><td>${percentage}%</td><td>${number_sessions}</td></tr>`;
            tabledoc += `<tr style='background-color: var(--tr-color)'><td style='background-color: var(--td-color)'><b>${name}</b></td><td style='text-indent:8px'>${percentage} %</td><td style='text-indent:8px'>${number_sessions}</td><td style='text-indent:8px'>${average_session_hours}:${average_session_minutes.toString().padStart(2, '0')}:${average_session_seconds.toString().padStart(2, '0')}</td></tr>`;
        }
        tabledoc += "</table>";
        //alert_Message_container.innerHTML += `</table>`;
        alert_Message_container.innerHTML += tabledoc;
        alertBox.style.display = "block";

        const courseNames = Object.keys(courses);
        const timeSpent = courseNames.map(name => courses[name].seconds / 3600); // Convertir les secondes en heures


        if (timeChart) {
            console.log("Destroying existing chart"); // Ajouter un log pour vérifier
            try {
                timeChart.destroy(); // Détruire le graphique existant avant d'en créer un nouveau
            } catch (error) {
                console.error("Error destroying chart:", error); // Capturer les erreurs de destruction
            }
        }

        const ctx = document.getElementById('timeChart').getContext('2d');

        timeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: courseNames,
                datasets: [{
                    label: 'Temps passé (heures)',
                    data: timeSpent,
                    borderWidth: 0.5
                }]
            },
            options: {
                scales: {},
                color: chartcolor,
            }
        });
    }


    custom_button.addEventListener('click', function () {
        updatePercentage();
    });

    close_img.addEventListener('click', function () {
        const alert_Message_container = document.getElementById("alertMessage");
        alert_Message_container.innerHTML = "";
        const alertBox = document.getElementById("customAlertBox");
        alertBox.style.display = "none";
        stats_mode = 0;
    });

    statistics.addEventListener('click', function () {
        if (stats_mode == 1) {
            stats_mode = 0;
            updatePercentage();
        } else {
            stats_mode = 1;
            updatePercentage2();
        }
    });
});
function updatelocalStorage() {
    const liste_cours = JSON.stringify(courses);
    console.log(liste_cours);
    localStorage.setItem('courses', liste_cours);
}
updateBody();
function updateBody() {
    if (inputE1.checked) {
        bodyE1.style.background = "black";
        containerE1.style.background = "rgb(30, 30, 30)";
        pourcents.style.background = "rgb(50, 50, 50)";
        pourcents.style.color = "white";
        h1title.style.color = "white";
        h2title.style.color = "white";
        input_course.style.backgroundColor = "rgb(60, 60, 60)";
        input_course.style.color = "white";
        chartcolor = "white";
        r.style.setProperty('--BackColor', "rgb(50, 50, 50)");
        r.style.setProperty('--course-color', 'white');
        r.style.setProperty('--course-color-hover', 'white');
        r.style.setProperty('--BackColor-hover', "rgb(59, 59, 59)");
        r.style.setProperty('--shadow-color', "rgb(255, 255, 255, 0.3)");
        r.style.setProperty('--shadow-color2', "rgb(0, 0, 0, 0.38)");
        r.style.setProperty('--stats-color', "rgb(235, 235, 235)");
        r.style.setProperty('--stats-back-color', "#2172c8");
        r.style.setProperty('--stats-back-color-hover', "#2f7fd5");
        r.style.setProperty('--notes-back-color-hover', "#575757");
        r.style.setProperty('--notes-back-color', "#515151");
        r.style.setProperty('--table-color', "white");
        r.style.setProperty('--tr-color', "rgb(90, 90, 90)");
        r.style.setProperty('--tr-title-color', "rgb(20, 20, 20)");
        r.style.setProperty('--td-color', "rgb(33, 94, 160)");
        a_link.style.color = "white";

    } else {
        bodyE1.style.background = "#efefef";
        containerE1.style.background = "white";
        pourcents.style.background = "rgb(230, 230, 230)";
        pourcents.style.color = "black";
        h2title.style.color = "black";
        h1title.style.color = "black";
        input_course.style.backgroundColor = "white";
        input_course.style.color = "black";
        chartcolor = "rgb(30, 30, 30)";
        r.style.setProperty('--BackColor', 'rgb(245, 245, 245)');
        r.style.setProperty('--course-color', 'black');
        r.style.setProperty('--course-color-hover', 'black');
        r.style.setProperty('--BackColor-hover', "white");
        r.style.setProperty('--shadow-color', "rgb(0, 0, 0, 0.18)");
        r.style.setProperty('--shadow-color2', "rgb(0, 0, 0, 0.18)");
        r.style.setProperty('--stats-color', "#1e1e1e");
        r.style.setProperty('--stats-back-color', "#5fa6f3");
        r.style.setProperty('--stats-back-color-hover', "#7ab3fc");
        r.style.setProperty('--notes-back-color-hover', "#eaeaea");
        r.style.setProperty('--notes-back-color', "#dddddd");
        r.style.setProperty('--tr-color', "rgb(230, 230, 230)");
        r.style.setProperty('--tr-title-color', "rgb(200, 200, 200)");
        r.style.setProperty('--td-color', "rgb(200, 230, 255)");
        r.style.setProperty('--table-color', "black");
        a_link.style.color = "black";
    }
}

inputE1.addEventListener("input", () => {
    updateBody();
    updatestorage();
});
function updatestorage(){
    localStorage.setItem("mode", JSON.stringify(inputE1.checked));
}
