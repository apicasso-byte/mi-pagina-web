const API_URL = "/api/questions/";  // ✅ ruta relativa para que funcione con Django

let preguntas = [];

async function cargarPreguntas() {
    try {
        const response = await fetch(API_URL);
        preguntas = await response.json();
        console.log("Preguntas cargadas:", preguntas);

        if (preguntas.length > 0) {
            iniciarJuego(); // solo arranca si hay preguntas
        } else {
            alert("No hay preguntas en la base de datos.");
        }
    } catch (error) {
        console.error("Error al cargar preguntas:", error);
    }
}

function iniciarJuego() {
    // Ejemplo: tomar una pregunta fácil de historia
    const pregunta = preguntas.facil.historia[0];

    // 👇 Aquí ajusta según tu HTML, pero la idea es meter el texto
    document.getElementById("pregunta").textContent = pregunta.q;

    // Supongamos que tienes botones con ids opcion1, opcion2, opcion3
    document.getElementById("opcion1").textContent = pregunta.options[0];
    document.getElementById("opcion2").textContent = pregunta.options[1];
    document.getElementById("opcion3").textContent = pregunta.options[2];
}

// Llamar al cargar la página
window.onload = cargarPreguntas;

// ----------------------
// VARIABLES GLOBALES
// ----------------------
let currentQuestions = [];
let currentIndex = 0;
let score = 0; // puntaje para trivia normal
let customIndex = 0;
let customScore = 0; // puntaje para trivia personalizada

// ----------------------
// PANTALLAS
// ----------------------
const welcomeScreen = document.getElementById("welcomeScreen");
const menuScreen = document.getElementById("menuScreen");
const quizOptions = document.getElementById("quiz-options");
const quizScreen = document.getElementById("quizScreen");
const createScreen = document.getElementById("createScreen");
const customQuizScreen = document.getElementById("customQuizScreen"); // <-- NUEVO

// ----------------------
// BOTONES
// ----------------------
document.getElementById("startBtn").addEventListener("click", () => {
    welcomeScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});

// Mostrar opciones de trivia
document.getElementById("showQuestion").addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    quizOptions.classList.remove("hidden");
});

// Mostrar pantalla para crear preguntas
document.getElementById("showCustomQuestions").addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    createScreen.classList.remove("hidden");
    mostrarPreguntas();
});

// Iniciar trivia normal
document.getElementById("playBtn").addEventListener("click", () => {
    quizOptions.classList.add("hidden");
    createScreen.classList.add("hidden");
    menuScreen.classList.add("hidden");

    quizScreen.classList.remove("hidden");

    loadQuestions();
    score = 0;
    showQuestion();
});

// Jugar con preguntas personalizadas
document.getElementById("playCustomBtn").addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    createScreen.classList.add("hidden");

    customQuizScreen.classList.remove("hidden");

    let savedQuestions = JSON.parse(localStorage.getItem("customQuestions")) || [];
    if (savedQuestions.length === 0) {
        alert("No tienes preguntas guardadas todavía.");
        customQuizScreen.classList.add("hidden");
        menuScreen.classList.remove("hidden");
        return;
    }

    customIndex = 0;
    customScore = 0;
    currentQuestions = savedQuestions;
    customQuizScreen.classList.remove("hidden");
    showCustomQuestion();
});

// Guardar pregunta personalizada
document.getElementById("saveQuestion").addEventListener("click", () => {
    const q = document.getElementById("newQuestion").value;
    const o1 = document.getElementById("newOption1").value;
    const o2 = document.getElementById("newOption2").value;
    const o3 = document.getElementById("newOption3").value;
    const ans = document.getElementById("newAnswer").value;

   if (q && o1 && o2 && o3 && ans) {
    let savedQuestions = JSON.parse(localStorage.getItem("customQuestions")) || [];

    // Verificar si ya existe una pregunta con el mismo texto
    let existe = savedQuestions.some(item => item.q.toLowerCase() === q.toLowerCase());

    if (existe) {
        alert("⚠️ Esa pregunta ya existe, intenta con otra.");
        return;
    }

    // Si no existe, la guardamos
    savedQuestions.push({ q: q, options: [o1, o2, o3], answer: ans });
    localStorage.setItem("customQuestions", JSON.stringify(savedQuestions));

    alert("Pregunta guardada con éxito ✨");
        document.getElementById("newQuestion").value = "";
        document.getElementById("newOption1").value = "";
        document.getElementById("newOption2").value = "";
        document.getElementById("newOption3").value = "";
        document.getElementById("newAnswer").value = "";

        mostrarPreguntas();
        createScreen.classList.add("hidden");
        menuScreen.classList.remove("hidden");
    } else {
        alert("Por favor, completa todos los campos.");
    }
});

// ----------------------
// FUNCIONES
// ----------------------

// Mostrar preguntas guardadas en lista
function mostrarPreguntas() {
    let savedQuestions = JSON.parse(localStorage.getItem("customQuestions")) || [];
    let container = document.getElementById("myQuestions");
    if (!container) return;
    container.innerHTML = "";

    savedQuestions.forEach((q, index) => {
        let p = document.createElement("p");
        p.textContent = `${index + 1}. ${q.q} (Correcta: ${q.answer})`;
        container.appendChild(p);
    });
}

// Trivia normal
function loadQuestions() {
    const level = document.getElementById("difficulty").value;
    const category = document.getElementById("category").value;

    currentQuestions = [];

    if (questions[level] && questions[level][category]) {
        currentQuestions = currentQuestions.concat(questions[level][category]);
    }

    currentIndex = 0;
}

function showQuestion() {
    const q = currentQuestions[currentIndex];
    document.getElementById("question").innerText = q.q;
    document.getElementById("score").innerText = score;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.onclick = () => {
            if (opt === q.answer) {
                score++;
                alert("¡Correcto!");
            } else {
                alert("Incorrecto. La respuesta es: " + q.answer);
            }
            currentIndex++;
            if (currentIndex < currentQuestions.length) {
                showQuestion();
            } else {
                alert(`Terminaste la trivia. Puntaje: ${score}/${currentQuestions.length}`);
                quizScreen.classList.add("hidden");
                menuScreen.classList.remove("hidden");
            }
        };
        optionsDiv.appendChild(btn);
    });
}

// Trivia personalizada
function showCustomQuestion() {
    const q = currentQuestions[customIndex];
    if (!q) return; // evita undefined 
    document.getElementById("customQuestion").innerText = q.q;

    const optionsDiv = document.getElementById("customOptions");
    optionsDiv.innerHTML = "";

    q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.onclick = () => {
            if (opt === q.answer) {
                customScore++;
                alert("¡Correcto!");
            } else {
                alert("Incorrecto. La respuesta es: " + q.answer);
            }
            customIndex++;
            if (customIndex < currentQuestions.length) {
                showCustomQuestion();
            } else {
                alert(`Terminaste tu trivia personalizada. Puntaje: ${customScore}/${currentQuestions.length}`);
                customQuizScreen.classList.add("hidden");
                menuScreen.classList.remove("hidden");
            }
        };
        optionsDiv.appendChild(btn);
    });

    document.getElementById("customScore").innerText = `Puntaje: ${customScore}`;
}
function mostrarPreguntas() {
    let savedQuestions = JSON.parse(localStorage.getItem("customQuestions")) || [];
    let container = document.getElementById("myQuestions");
    if (!container) return;
    container.innerHTML = "";

    savedQuestions.forEach((q, index) => {
        let p = document.createElement("p");
        p.textContent = `${index + 1}. ${q.q} (Correcta: ${q.answer})`;

        // Botón de borrar individual
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Borrar";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.onclick = () => {
            savedQuestions.splice(index, 1); // elimina la pregunta
            localStorage.setItem("customQuestions", JSON.stringify(savedQuestions));
            mostrarPreguntas(); // actualiza la lista
        };

        p.appendChild(deleteBtn);
        container.appendChild(p);
    });
}

// 🔹 Fuera de la función (junto a los demás botones)
document.getElementById("backFromCustom").addEventListener("click", () => {
    customQuizScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});

document.getElementById("backFromCreate").addEventListener("click", () => {
    createScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});