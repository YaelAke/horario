document.addEventListener('DOMContentLoaded', () => {
    // Generar la lista de maestros únicos y agrupar "Contrato" bajo una opción
    const rows = Array.from(document.querySelectorAll('#schedule-table tbody tr'));
    let teachers = [...new Set(rows.map(row => row.querySelectorAll('td')[6].innerText))];

    // Agregar "Contrato" como opción unificada si hay coincidencias
    const contratos = teachers.filter(teacher => teacher.toLowerCase().includes('contrato'));
    if (contratos.length > 0) {
        teachers = teachers.filter(teacher => !contratos.includes(teacher)); // Remover contratos individuales
        teachers.push('Contrato'); // Agregar opción genérica
    }

    const form = document.getElementById('omit-teachers-form');
    teachers.forEach(teacher => {
        const container = document.createElement('label');
        container.className = 'checkbox-container';
        container.innerHTML = `
            <input type="checkbox" value="${teacher}" name="omit-teachers">
            <div class="custom-checkbox"></div>
            <span class="label-text">${teacher}</span>
        `;
        form.appendChild(container);
    });
});

function generateSchedules() {
    const table = document.getElementById('schedule-table');
    const rows = Array.from(table.querySelectorAll('tbody tr'));

    // Obtener los maestros a omitir
    const omittedTeachers = Array.from(
        document.querySelectorAll('input[name="omit-teachers"]:checked')
    ).map(input => input.value);

    // Crear una lista de todas las materias excluyendo las de maestros omitidos
    const data = rows.map(row => {
        const cells = row.querySelectorAll('td');
        const fullName = cells[0].innerText; // Nombre completo de la materia con grupo
        const baseName = fullName.split(' (')[0]; // Nombre base de la materia (sin grupo)
        const maestro = cells[6].innerText;
        return {
            fullName: fullName,
            baseName: baseName,
            horarios: [
                cells[1].innerText, cells[2].innerText,
                cells[3].innerText, cells[4].innerText,
                cells[5].innerText
            ],
            maestro: maestro
        };
    }).filter(materia => {
        if (omittedTeachers.includes('Contrato') && materia.maestro.toLowerCase().includes('contrato')) {
            return false; // Excluir maestros relacionados con "Contrato"
        }
        return !omittedTeachers.includes(materia.maestro); // Excluir maestros seleccionados
    });

    // Generar todas las combinaciones posibles de horarios
    const validSchedules = [];
    const combinations = generateCombinations(data, 6); // Combinaciones de 6 materias

    for (const combination of combinations) {
        if (isValidSchedule(combination)) {
            validSchedules.push(sortByTime(combination)); // Ordenar por horario
        }
    }

    if (validSchedules.length > 0) {
        displaySchedules(validSchedules);
    } else {
        alert('No se encontraron horarios válidos.');
    }
}

// Generar todas las combinaciones posibles de tamaño `k` a partir de una lista
function generateCombinations(data, k) {
    function combine(start, path) {
        if (path.length === k) {
            // Comprobamos que no haya repetición de materias base
            const baseNames = new Set(path.map(materia => materia.baseName));
            if (baseNames.size === k) {
                combinations.push(path);
            }
            return;
        }

        for (let i = start; i < data.length; i++) {
            combine(i + 1, path.concat(data[i]));
        }
    }

    const combinations = [];
    combine(0, []);
    return combinations;
}

// Validar si una combinación es un horario válido (sin choques de horas)
function isValidSchedule(schedule) {
    for (let i = 0; i < schedule.length; i++) {
        for (let j = i + 1; j < schedule.length; j++) {
            const materia1 = schedule[i];
            const materia2 = schedule[j];

            for (let day = 0; day < 5; day++) { // Validar los 5 días de la semana
                if (materia1.horarios[day] && materia2.horarios[day]) {
                    if (materia1.horarios[day] === materia2.horarios[day]) {
                        return false; // Horarios chocan
                    }
                }
            }
        }
    }
    return true;
}

// Ordenar un horario por los horarios de inicio
function sortByTime(schedule) {
    return schedule.sort((a, b) => {
        const timeA = getEarliestTime(a.horarios);
        const timeB = getEarliestTime(b.horarios);
        return timeA - timeB;
    });
}

// Obtener la hora de inicio más temprana de los horarios de una materia
function getEarliestTime(horarios) {
    for (const horario of horarios) {
        if (horario) {
            const [hour, minute] = horario.split(' - ')[0].split(':').map(Number); // Extraer hora y minuto
            return hour * 60 + minute; // Convertir a minutos desde medianoche
        }
    }
    return Infinity; // Si no hay horarios, devolver un valor muy alto
}

// Mostrar todos los horarios generados
function displaySchedules(schedules) {
    const container = document.getElementById('generated-schedules');
    container.innerHTML = ''; // Limpiar horarios previos

    schedules.forEach((schedule, index) => {
        const table = document.createElement('table');
        table.innerHTML = `
            <caption>Horario ${index + 1}</caption>
            <thead>
                <tr>
                    <th>Materia</th>
                    <th>Lunes</th>
                    <th>Martes</th>
                    <th>Miércoles</th>
                    <th>Jueves</th>
                    <th>Viernes</th>
                    <th>Maestro</th>
                </tr>
            </thead>
            <tbody>
                ${schedule.map(materia => `
                    <tr>
                        <td>${materia.fullName}</td>
                        <td>${materia.horarios[0]}</td>
                        <td>${materia.horarios[1]}</td>
                        <td>${materia.horarios[2]}</td>
                        <td>${materia.horarios[3]}</td>
                        <td>${materia.horarios[4]}</td>
                        <td>${materia.maestro}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
    });
}

function startDogWalk() {
    const dogRainContainer = document.getElementById('dog-rain-container');

    // Rutas de las imágenes de los perritos caminando
    const dogImageLeftToRight = './walk.gif'; // GIF para la dirección izquierda a derecha
    const dogImageRightToLeft = './walkr.gif'; // GIF para la dirección derecha a izquierda

    function createWalkingDog() {
        return new Promise((resolve) => {
            const dog = document.createElement('img');
            dog.className = 'walking-dog';

            // Alternar dirección aleatoriamente
            const moveDirection = Math.random() > 0.5 ? 'left-to-right' : 'right-to-left';

            // Generar una posición vertical aleatoria
            const verticalPosition = Math.random() * (window.innerHeight - 100); // Evitar que salga fuera de la pantalla
            dog.style.top = `${verticalPosition}px`;

            // Configurar dirección, animación y GIF según la dirección
            if (moveDirection === 'left-to-right') {
                dog.src = dogImageLeftToRight; // Usar GIF para izquierda a derecha
                dog.style.left = '-100px'; // Empieza fuera del lado izquierdo
                dog.style.animation = `move-left-to-right ${Math.random() * 5 + 3}s linear`;
            } else {
                dog.src = dogImageRightToLeft; // Usar GIF para derecha a izquierda
                dog.style.left = '100vw'; // Empieza fuera del lado derecho
                dog.style.animation = `move-right-to-left ${Math.random() * 5 + 3}s linear`;
            }

            // Agregar el perrito al contenedor
            dogRainContainer.appendChild(dog);

            // Eliminar el perrito una vez que termina su animación
            const duration = parseFloat(dog.style.animationDuration) * 1000;
            setTimeout(() => {
                dog.remove();
                resolve(); // Notificar que el perrito ha salido de la pantalla
            }, duration);
        });
    }

    // Mostrar un perrito, esperar a que termine, y luego mostrar el siguiente
    async function loopDogs() {
        while (true) {
            await createWalkingDog();
        }
    }

    // Iniciar el bucle
    loopDogs();
}

// Iniciar el efecto de caminar al cargar la página
window.onload = startDogWalk;
