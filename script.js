document.addEventListener('DOMContentLoaded', () => {
    const addCourseBtn = document.getElementById('add-course-btn');
    const coursesList = document.getElementById('courses-list');
    const totalTimeSpan = document.getElementById('total-time');

    let totalSeconds = 0;
    let start_time = 0;
    let current_time = 0;
    let number_of_plays = 0;
    const courses = {};
    let timeChart = null; // Initialisation de la variable

    addCourseBtn.addEventListener('click', () => {
        const courseName = document.getElementById('course-name').value;
        if (courseName && !courses[courseName]) {
            addCourse(courseName);
            document.getElementById('course-name').value = '';
        }
    });

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
            <div>
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

    function removeCourse(name, courseElem) {
        stopTimer(courses[name], courseElem.querySelector('.play-btn'), courseElem.querySelector('.stop-btn'), courseElem);
        delete courses[name];
        const courseElement = document.querySelector(`[data-course="${name}"]`);
        courseElement.remove();
        if (coursesList.children.length === 0) {
            totalSeconds = 0;
            updateTimeDisplay(totalSeconds, totalTimeSpan);
        }
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
        course.notes.push({ time: new Date(), note: "Temps de travail " + `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `});
        displayNotes(course, courseElement);
    }

    function updateTimeDisplay(seconds, element) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        element.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function addNotes(course, courseElement, text_note = null) {
        const notes = prompt('Ajouter des notes pour cette session :');
        if (text_note != null) {
            course.notes.push({ time: new Date(), note: text_note });
            displayNotes(course, courseElement);
        }
        if (notes) {
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
            noteElement.textContent = `${note.time.toLocaleString("fr-BE", { dateStyle: 'long' })} : ${note.note}`;
            notesContainer.appendChild(noteElement);
        });
    }

    function updatePercentage() {
        let alertBox = document.getElementById("customAlertBox");
        let alert_Message_container = document.getElementById("alertMessage");

        alert_Message_container.innerHTML = "<h3>Pourcentage de travail par cours</h3>";
        for (const name in courses) {
            const course = courses[name];
            const percentage = totalSeconds > 0 ? Math.round((course.seconds / totalSeconds) * 100) : 0;
            alert_Message_container.innerHTML += `${name}` + "  :  " + `${percentage}%` + "<br><br>";
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
                    borderWidth: 1
                }]
            },
            options: {
                scales: {}
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
    });
});
