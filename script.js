const addCourseBtn = document.getElementById('add-course-btn');
const input_course = document.getElementById('course-name');
const coursesList = document.getElementById('courses-list');
const totalTimeSpan = document.getElementById('total-time');
const pourcents = document.getElementById('popupButton');
const h1title = document.querySelector('h1');
const h2title = document.querySelector('h2');
const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let stats_mode = 0;

let totalSeconds = 0;
let start_time = 0;
let current_time = 0;
let number_of_plays = 0;
let courses = JSON.parse(localStorage.getItem('courses')) || {};
let chartcolor = "rgb(30, 30, 30)";

let timeChart = null; // Initialisation de la variable
let r = document.querySelector(':root');
document.addEventListener('DOMContentLoaded', () => {
    for (const name in courses) {
        addexistingCourses(name, courses[name].seconds, courses[name].interval, courses[name].notes, courses[name].history);
        totalSeconds += courses[name].seconds;
        updateTimeDisplay(courses[name].seconds, document.querySelector(`[data-course="${name}"] .time`));
        updateTimeDisplay(totalSeconds, totalTimeSpan);
        // displayNotes(courses[name], document.getElementById("course-${name}"));
        
    }
    addCourseBtn.addEventListener('click', () => {
        const courseName = document.getElementById('course-name').value;
        if (courseName && !courses[courseName]) {
            addCourse(courseName);
            document.getElementById('course-name').value = '';
        }
    });
    function addexistingCourses(name, les_secondes, intervalle, les_notes, historique) {
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
                <div class="notes-container" style="display:none">Commentaires : <br></div>
            </div>
        `;

        const playBtn = courseElement.querySelector('.play-btn');
        const stopBtn = courseElement.querySelector('.stop-btn');
        const closeBtn = courseElement.querySelector('.close-course');
        const timeSpan = courseElement.querySelector('.time');
        const notesBtn = courseElement.querySelector('.add-notes-btn');

        playBtn.addEventListener('click', () => startTimer(course, timeSpan, playBtn, stopBtn));
        stopBtn.addEventListener('click', () => stopTimer(course, playBtn, stopBtn, courseElement));
        closeBtn.addEventListener('click', () => removeCourse(name, courseElement));
        notesBtn.addEventListener('click', () => addNotes(course, courseElement));

        coursesList.appendChild(courseElement);
    }
    function addCourse(name) {
        const course = {
            name,
            seconds: 0,
            interval: null,
            notes: [],
            history: []
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

        playBtn.addEventListener('click', () => startTimer(course, timeSpan, playBtn, stopBtn));
        stopBtn.addEventListener('click', () => stopTimer(course, playBtn, stopBtn, courseElement));
        closeBtn.addEventListener('click', () => removeCourse(name, courseElement));
        notesBtn.addEventListener('click', () => addNotes(course, courseElement));

        coursesList.appendChild(courseElement);
        updatelocalStorage();
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
        // course.notes.push({ time: new Date(), note: "Temps de travail " + `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `});
        // displayNotes(course, courseElement);
        addNotes(course, courseElement, "Temps de travail " + `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `);
        course.history.push(session_duration);
        updatelocalStorage();
    }

    function updateTimeDisplay(seconds, element) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        element.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        notesContainer.innerHTML = ''; // Clear previous notes
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
        for (const name in courses) {
            const course = courses[name];
            const number_sessions = course.history.length;
            const average_session = number_sessions > 0 ? Math.round(course.seconds / number_sessions) : 0;
            const average_session_hours = Math.floor(average_session / 3600);
            const average_session_minutes = Math.floor((average_session % 3600) / 60);
            const average_session_seconds = average_session % 60;
            const percentage = totalSeconds > 0 ? Math.round((course.seconds / totalSeconds) * 100) : 0;
            alert_Message_container.innerHTML += `${name}` + "  :  " + `<ul> <li>${percentage}% du temps total</li> <li>${number_sessions} sessions de travail</li> <li>Temps moyen ${average_session_hours}:${average_session_minutes.toString().padStart(2, '0')}:${average_session_seconds.toString().padStart(2, '0')}</li> </ul> `;
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

    const custom_button = document.getElementById('popupButton');
    custom_button.addEventListener('click', function () {
        updatePercentage();
    });

    const close_img = document.querySelector('.close');
    close_img.addEventListener('click', function () {
        const alert_Message_container = document.getElementById("alertMessage");
        alert_Message_container.innerHTML = "";
        const alertBox = document.getElementById("customAlertBox");
        alertBox.style.display = "none";
        stats_mode = 0;
    });
    const statistics = document.querySelector('.statistics');
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
const bodyE1 = document.querySelector("body");
const containerE1 = document.querySelector(".container");
let les_cours = document.querySelector(".course");

const inputE1 = document.querySelector(".input");
inputE1.checked = JSON.parse(localStorage.getItem("mode")) || false;
updateBody();
function updateBody() {
    les_cours = document.querySelector(".course");
    console.log(les_cours);
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
        r.style.setProperty('--stats-back-color-hover', "#2f7fd5")
        r.style.setProperty('--notes-back-color-hover', "#575757")
        r.style.setProperty('--notes-back-color', "#515151")




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
        r.style.setProperty('--stats-back-color-hover', "#7ab3fc")
        r.style.setProperty('--notes-back-color-hover', "#eaeaea")
        r.style.setProperty('--notes-back-color', "#dddddd")
    }
}

inputE1.addEventListener("input", () => {
    updateBody();
    updatestorage();
});
function updatestorage(){
    localStorage.setItem("mode", JSON.stringify(inputE1.checked));
}
