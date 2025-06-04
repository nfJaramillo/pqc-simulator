// Bancolombia Post-Quantum Cryptography Educational App

// Application state
let rsaKeys = {
  n: null,
  e: null,
  d: null,
  p: null,
  q: null,
  phi: null
};

let quizState = {
  currentQuestion: 0,
  score: 0,
  questions: [
    {
      question: "¿Cuál es el principal riesgo del algoritmo de Shor para RSA?",
      options: ["Velocidad de cifrado", "Factorización de números primos", "Uso de memoria", "Compatibilidad"],
      correct: 1
    },
    {
      question: "¿Cuándo estima NCSC completar la migración PQC?",
      options: ["2025", "2030", "2035", "2040"],
      correct: 2
    },
    {
      question: "¿Qué algoritmo PQC estandarizó NIST para encriptación?",
      options: ["CRYSTALS-Dilithium", "CRYSTALS-Kyber", "SPHINCS+", "Falcon"],
      correct: 1
    }
  ],
  selectedOption: null
};

let shorSteps = [
  "Inicializando computadora cuántica...",
  "Aplicando superposición cuántica a registros...",
  "Generando entrelazamiento cuántico...", 
  "Ejecutando Transformada de Fourier Cuántica...",
  "Midiendo período de la función...",
  "Calculando MCD para factorización...",
  "¡Factorización encontrada!"
];

// Utility functions
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function modInverse(a, m) {
  function extendedGCD(a, b) {
    if (a === 0) return [b, 0, 1];
    let [gcd, x1, y1] = extendedGCD(b % a, a);
    let x = y1 - Math.floor(b / a) * x1;
    let y = x1;
    return [gcd, x, y];
  }

  let [g, x, y] = extendedGCD(a % m, m);
  if (g !== 1) throw new Error("Modular inverse does not exist");
  return ((x % m) + m) % m;
}

// Potencia modular usando BigInt
function modPow(base, exponent, modulus) {
  base = BigInt(base);
  exponent = BigInt(exponent);
  modulus = BigInt(modulus);
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exponent = exponent / 2n;
    base = (base * base) % modulus;
  }
  return result;
}

// RSA Key Generation
function generateRSA() {
  const p = parseInt(document.getElementById('prime-p').value);
  const q = parseInt(document.getElementById('prime-q').value);
  
  // Validate inputs
  if (!isPrime(p)) {
    alert(`${p} no es un número primo. Por favor ingresa un número primo.`);
    return;
  }
  
  if (!isPrime(q)) {
    alert(`${q} no es un número primo. Por favor ingresa un número primo.`);
    return;
  }
  
  if (p === q) {
    alert('Los números primos p y q deben ser diferentes.');
    return;
  }

  // Calculate RSA parameters
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  
  // Choose e (commonly 65537 or 3)
  let e = 65537;
  if (e >= phi || gcd(e, phi) !== 1) {
    e = 3;
    if (gcd(e, phi) !== 1) {
      // Find a suitable e
      for (let i = 3; i < phi; i += 2) {
        if (gcd(i, phi) === 1) {
          e = i;
          break;
        }
      }
    }
  }
  
  // Calculate d (private exponent)
  const d = modInverse(e, phi);
  
  // Store in global state
  rsaKeys = { n, e, d, p, q, phi };
  
  // Update UI
  document.getElementById('n-value').textContent = n;
  document.getElementById('phi-value').textContent = phi;
  document.getElementById('e-value').textContent = e;
  document.getElementById('d-value').textContent = d;
  document.getElementById('public-n').textContent = n;
  document.getElementById('public-e').textContent = e;
  document.getElementById('private-n').textContent = n;
  document.getElementById('private-d').textContent = d;
  
  // Show results
  const resultsDiv = document.getElementById('rsa-results');
  resultsDiv.style.display = 'block';
  
  // Update max value for message input
  document.getElementById('message-input').max = n - 1;
  
  // Add visual feedback
  resultsDiv.style.animation = 'none';
  setTimeout(() => {
    resultsDiv.style.animation = 'slideIn 0.5s ease-out';
  }, 10);
}

// Encryption/Decryption Demo
function encryptMessage() {
  if (!rsaKeys.n) {
    alert('Primero genera las claves RSA.');
    return;
  }
  
  const message = parseInt(document.getElementById('message-input').value);
  
  if (message >= rsaKeys.n) {
    alert(`El mensaje debe ser menor que n (${rsaKeys.n}).`);
    return;
  }
  
  if (message < 1) {
    alert('El mensaje debe ser un número positivo.');
    return;
  }
  
  // Encrypt: C = M^e mod n
  const encrypted = modPow(message, rsaKeys.e, rsaKeys.n);
  
  // Decrypt: M = C^d mod n
  const decrypted = modPow(encrypted, rsaKeys.d, rsaKeys.n);
  
  // Update UI
  document.getElementById('original-message').textContent = message;
  document.getElementById('encrypted-message').textContent = encrypted;
  document.getElementById('decrypted-message').textContent = decrypted;
  
  // Show results
  const resultsDiv = document.getElementById('cipher-results');
  resultsDiv.style.display = 'block';
  
  // Add visual feedback
  resultsDiv.style.animation = 'none';
  setTimeout(() => {
    resultsDiv.style.animation = 'slideIn 0.5s ease-out';
  }, 10);
}

// Descifrado manual con clave privada
function decryptManualMessage() {
  if (!rsaKeys.n) {
    alert('Primero genera las claves RSA.');
    return;
  }
  const cipher = parseInt(document.getElementById('cipher-input').value);
  if (isNaN(cipher) || cipher < 0) {
    alert('Introduce un valor válido para el mensaje cifrado.');
    return;
  }
  // Descifrar: M = C^d mod n
  const decrypted = modPow(cipher, rsaKeys.d, rsaKeys.n);
  document.getElementById('manual-decrypted-message').textContent = decrypted;
  // Mostrar resultados
  const resultsDiv = document.getElementById('cipher-results');
  resultsDiv.style.display = 'block';
  resultsDiv.style.animation = 'none';
  setTimeout(() => {
    resultsDiv.style.animation = 'slideIn 0.5s ease-out';
  }, 10);
}

// Descifrado manual con clave privada personalizada usando BigInt
function decryptWithCustomKey() {
  console.log('Botón DESCIFRAR MANUAL PRESIONADO');
  const cipher = document.getElementById('manual-cipher-input').value.trim();
  const d = document.getElementById('manual-d-input').value.trim();
  const n = document.getElementById('manual-n-input').value.trim();

  // Imprimir todos los valores de entrada
  console.log('--- DESCIFRADO MANUAL ---');
  console.log('C (cipher):', cipher, typeof cipher);
  console.log('d (privada):', d, typeof d);
  console.log('n (modulo):', n, typeof n);

  if (cipher === "" || d === "" || n === "") {
    alert('Por favor ingresa valores válidos para C, d y n.');
    document.getElementById('manual-cipher-decrypted-message').textContent = "-";
    console.log('Algún campo está vacío');
    return;
  }

  let cipherNum, dNum, nNum;
  try {
    cipherNum = BigInt(cipher);
    dNum = BigInt(d);
    nNum = BigInt(n);
    console.log('BigInt C:', cipherNum, 'BigInt d:', dNum, 'BigInt n:', nNum);
  } catch (e) {
    alert('Por favor ingresa valores válidos para C, d y n.');
    document.getElementById('manual-cipher-decrypted-message').textContent = "-";
    console.log('Error al convertir a BigInt:', e);
    return;
  }

  if (cipherNum < 0n || dNum < 1n || nNum < 2n) {
    alert('Por favor ingresa valores válidos para C, d y n.');
    document.getElementById('manual-cipher-decrypted-message').textContent = "-";
    console.log('Valores fuera de rango:', cipherNum, dNum, nNum);
    return;
  }

  // Descifrar: M = C^d mod n
  let decrypted;
  try {
    decrypted = modPow(cipherNum, dNum, nNum);
    console.log('Resultado descifrado:', decrypted.toString());
  } catch (e) {
    console.log('Error en modPow:', e);
    decrypted = "-";
  }
  document.getElementById('manual-cipher-decrypted-message').textContent = decrypted.toString();

  // Mostrar el resultado correctamente
  const resultsDiv = document.getElementById('manual-cipher-results');
  resultsDiv.style.display = 'block';
  resultsDiv.style.visibility = 'visible';
  resultsDiv.style.animation = 'none';
  setTimeout(() => {
    resultsDiv.style.animation = 'slideIn 0.5s ease-out';
  }, 10);
}

// Cifrado manual con clave pública personalizada usando BigInt
function encryptWithCustomKey() {
  console.log('Botón CIFRAR MANUAL PRESIONADO');
  const message = document.getElementById('manual-message-input').value.trim();
  const e = document.getElementById('manual-e-input').value.trim();
  const n = document.getElementById('manual-n-pub-input').value.trim();

  // Imprimir todos los valores de entrada
  console.log('--- CIFRADO MANUAL ---');
  console.log('M (mensaje):', message, typeof message);
  console.log('e (pública):', e, typeof e);
  console.log('n (módulo):', n, typeof n);

  if (message === "" || e === "" || n === "") {
    alert('Por favor ingresa valores válidos para M, e y n.');
    document.getElementById('manual-message-encrypted').textContent = "-";
    console.log('Algún campo está vacío');
    return;
  }

  let messageNum, eNum, nNum;
  try {
    messageNum = BigInt(message);
    eNum = BigInt(e);
    nNum = BigInt(n);
    console.log('BigInt M:', messageNum, 'BigInt e:', eNum, 'BigInt n:', nNum);
  } catch (err) {
    alert('Por favor ingresa valores válidos para M, e y n.');
    document.getElementById('manual-message-encrypted').textContent = "-";
    console.log('Error al convertir a BigInt:', err);
    return;
  }

  if (messageNum < 0n || eNum < 1n || nNum < 2n) {
    alert('Por favor ingresa valores válidos para M, e y n.');
    document.getElementById('manual-message-encrypted').textContent = "-";
    console.log('Valores fuera de rango:', messageNum, eNum, nNum);
    return;
  }

  // Cifrar: C = M^e mod n
  let encrypted;
  try {
    encrypted = modPow(messageNum, eNum, nNum);
    console.log('Resultado cifrado:', encrypted.toString());
  } catch (err) {
    console.log('Error en modPow:', err);
    encrypted = "-";
  }
  document.getElementById('manual-message-encrypted').textContent = encrypted.toString();

  // Mostrar el resultado correctamente
  const resultsDiv = document.getElementById('manual-message-results');
  resultsDiv.style.display = 'block';
  resultsDiv.style.visibility = 'visible';
  resultsDiv.style.animation = 'none';
  setTimeout(() => {
    resultsDiv.style.animation = 'slideIn 0.5s ease-out';
  }, 10);
}

// Shor's Algorithm Attack Simulation
function simulateShorAttack() {
  if (!rsaKeys.n) {
    alert('Primero genera las claves RSA para atacar.');
    return;
  }
  
  const btn = document.getElementById('shor-btn');
  const progress = document.getElementById('attack-progress');
  const progressFill = document.getElementById('progress-fill');
  const stepsContainer = document.getElementById('attack-steps');
  const resultsContainer = document.getElementById('attack-results');
  const timeComparison = document.getElementById('time-comparison');
  
  // Reset and show progress
  btn.disabled = true;
  btn.textContent = '🔮 Ejecutando Ataque...';
  progress.style.display = 'block';
  resultsContainer.style.display = 'none';
  stepsContainer.innerHTML = '';
  progressFill.style.width = '0%';
  
  let currentStep = 0;
  
  function executeStep() {
    if (currentStep < shorSteps.length) {
      // Add step to UI
      const stepDiv = document.createElement('div');
      stepDiv.className = 'step-item step-active';
      stepDiv.textContent = shorSteps[currentStep];
      stepsContainer.appendChild(stepDiv);
      
      // Update progress bar
      const progressPercent = ((currentStep + 1) / shorSteps.length) * 100;
      progressFill.style.width = progressPercent + '%';
      
      // Make previous steps less prominent
      const allSteps = stepsContainer.querySelectorAll('.step-item');
      if (allSteps.length > 1) {
        allSteps[allSteps.length - 2].classList.remove('step-active');
      }
      
      currentStep++;
      
      // Continue with next step after delay
      setTimeout(executeStep, 800);
    } else {
      // Attack complete
      setTimeout(() => {
        showAttackResults();
      }, 500);
    }
  }
  
  function showAttackResults() {
    resultsContainer.innerHTML = `
      <h5>🎯 Resultado del Ataque Cuántico</h5>
      <div class="attack-result">
        <strong>Factorización exitosa:</strong><br>
        n = ${rsaKeys.n} = ${rsaKeys.p} × ${rsaKeys.q}<br>
        <strong>Claves comprometidas:</strong><br>
        p = ${rsaKeys.p}, q = ${rsaKeys.q}<br>
        d = ${rsaKeys.d} (clave privada descubierta)
      </div>
    `;
    resultsContainer.style.display = 'block';
    
    // Update time comparison
    const keySize = Math.floor(Math.log2(rsaKeys.n));
    document.getElementById('classical-time').textContent = 
      keySize < 20 ? 'Años' : keySize < 30 ? 'Siglos' : 'Millones de años';
    document.getElementById('quantum-time').textContent = 
      keySize < 20 ? 'Milisegundos' : keySize < 30 ? 'Segundos' : 'Minutos';
    
    timeComparison.style.display = 'flex';
    
    // Reset button
    btn.disabled = false;
    btn.textContent = '🔮 Ejecutar Nuevo Ataque';
  }
  
  // Start the simulation
  executeStep();
}

// Quiz Functions
function initializeQuiz() {
  showQuestion();
}

function showQuestion() {
  const question = quizState.questions[quizState.currentQuestion];
  document.getElementById('question-text').textContent = question.question;
  
  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';
  
  question.options.forEach((option, index) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'quiz-option';
    optionDiv.textContent = option;
    optionDiv.onclick = () => selectOption(index);
    optionsContainer.appendChild(optionDiv);
  });
  
  document.getElementById('current-question').textContent = quizState.currentQuestion + 1;
  document.getElementById('total-questions').textContent = quizState.questions.length;
  document.getElementById('score').textContent = quizState.score;
  
  // Reset UI state
  quizState.selectedOption = null;
  document.getElementById('submit-btn').style.display = 'inline-block';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('quiz-feedback').style.display = 'none';
}

function selectOption(index) {
  // Remove previous selection
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.classList.remove('option-selected');
  });
  
  // Add selection to clicked option
  document.querySelectorAll('.quiz-option')[index].classList.add('option-selected');
  quizState.selectedOption = index;
}

function submitAnswer() {
  if (quizState.selectedOption === null) {
    alert('Por favor selecciona una respuesta.');
    return;
  }
  
  const question = quizState.questions[quizState.currentQuestion];
  const isCorrect = quizState.selectedOption === question.correct;
  const feedback = document.getElementById('quiz-feedback');
  
  if (isCorrect) {
    quizState.score++;
    feedback.textContent = '¡Correcto! Excelente conocimiento sobre criptografía post-cuántica.';
    feedback.className = 'quiz-feedback feedback-correct';
  } else {
    feedback.textContent = `Incorrecto. La respuesta correcta es: ${question.options[question.correct]}`;
    feedback.className = 'quiz-feedback feedback-incorrect';
  }
  
  feedback.style.display = 'block';
  document.getElementById('submit-btn').style.display = 'none';
  
  // Update score display
  document.getElementById('score').textContent = quizState.score;
  
  if (quizState.currentQuestion < quizState.questions.length - 1) {
    document.getElementById('next-btn').style.display = 'inline-block';
  } else {
    // Quiz complete
    setTimeout(() => {
      showQuizComplete();
    }, 2000);
  }
}

function nextQuestion() {
  quizState.currentQuestion++;
  showQuestion();
}

function showQuizComplete() {
  const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
  let message = '';
  
  if (percentage >= 80) {
    message = '🏆 ¡Excelente! Tienes un sólido entendimiento de la criptografía post-cuántica.';
  } else if (percentage >= 60) {
    message = '👍 ¡Bien! Tienes conocimientos básicos, pero puedes mejorar.';
  } else {
    message = '📚 Te recomendamos revisar más sobre criptografía post-cuántica.';
  }
  
  document.getElementById('quiz-container').innerHTML = `
    <div class="quiz-complete">
      <h4>🎓 Quiz Completado</h4>
      <div class="final-score">
        <p><strong>Puntuación Final: ${quizState.score}/${quizState.questions.length} (${percentage}%)</strong></p>
        <p>${message}</p>
      </div>
      <button class="btn btn-quiz" onclick="restartQuiz()">Reiniciar Quiz</button>
    </div>
  `;
}

function restartQuiz() {
  quizState.currentQuestion = 0;
  quizState.score = 0;
  quizState.selectedOption = null;
  
  document.getElementById('quiz-container').innerHTML = `
    <div class="quiz-question" id="quiz-question">
      <h4 id="question-text">Cargando pregunta...</h4>
      <div class="quiz-options" id="quiz-options"></div>
    </div>
    <div class="quiz-controls">
      <button class="btn btn-quiz" id="submit-btn">Responder</button>
      <button class="btn btn-next" id="next-btn" style="display: none;">Siguiente</button>
    </div>
    <div class="quiz-score">
      Pregunta <span id="current-question">1</span> de <span id="total-questions">3</span> 
      | Puntuación: <span id="score">0</span>/3
    </div>
    <div class="quiz-feedback" id="quiz-feedback"></div>
  `;
  
  // Re-attach event listeners
  document.getElementById('submit-btn').addEventListener('click', submitAnswer);
  document.getElementById('next-btn').addEventListener('click', nextQuestion);
  
  initializeQuiz();
}

// Export Session Report
function exportSession() {
  const sessionData = {
    timestamp: new Date().toLocaleString('es-CO'),
    rsaKeys: rsaKeys,
    quizScore: `${quizState.score}/${quizState.questions.length}`,
    quizPercentage: Math.round((quizState.score / quizState.questions.length) * 100)
  };
  
  const reportContent = `
REPORTE DE SESIÓN - CRIPTOGRAFÍA POST-CUÁNTICA
Bancolombia - Área de Innovación
=============================================

Fecha y Hora: ${sessionData.timestamp}

CLAVES RSA GENERADAS:
${rsaKeys.n ? `
- Números primos: p = ${rsaKeys.p}, q = ${rsaKeys.q}
- Módulo: n = ${rsaKeys.n}
- Función de Euler: φ(n) = ${rsaKeys.phi}
- Clave pública: (n=${rsaKeys.n}, e=${rsaKeys.e})
- Clave privada: (n=${rsaKeys.n}, d=${rsaKeys.d})
` : 'No se generaron claves durante la sesión'}

EVALUACIÓN DE CONOCIMIENTOS:
- Puntuación: ${sessionData.quizScore} (${sessionData.quizPercentage}%)
- Estado: ${sessionData.quizPercentage >= 80 ? 'Excelente' : sessionData.quizPercentage >= 60 ? 'Satisfactorio' : 'Necesita refuerzo'}

RECOMENDACIONES:
1. Continuar con la evaluación de algoritmos post-cuánticos
2. Planificar la migración de sistemas críticos
3. Capacitar al equipo en nuevas tecnologías criptográficas

----
Generado por el Simulador Educativo de Criptografía Post-Cuántica
© 2025 Bancolombia
  `;
  
  // Create downloadable file
  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-pqc-bancolombia-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  // Show confirmation
  alert('✅ Reporte exportado exitosamente. Revisa tu carpeta de descargas.');
}

// Add some CSS animations dynamically
function addAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .step-active {
      animation: pulse 0.5s ease-in-out;
    }
  `;
  document.head.appendChild(style);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initializeQuiz();
  addAnimations();

  // Add event listeners SOLO SI EL ELEMENTO EXISTE
  const listeners = [
    ['generate-rsa-btn', generateRSA],
    ['encrypt-btn', encryptMessage],
    ['shor-btn', simulateShorAttack],
    ['submit-btn', submitAnswer],
    ['next-btn', nextQuestion],
    ['export-btn', exportSession],
    ['decrypt-btn', decryptManualMessage]
  ];

  listeners.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', fn);
    } else {
      console.warn(`No se encontró el elemento con id: ${id}`);
    }
  });

  function tryAttachManualDecrypt() {
    const btn = document.getElementById('manual-decrypt-btn');
    console.log('¿Existe manual-decrypt-btn?', btn);
    if (btn) {
      btn.removeEventListener('click', decryptWithCustomKey); // Previene duplicados
      btn.addEventListener('click', decryptWithCustomKey);
    } else {
      console.error('No se encontró el botón manual-decrypt-btn en el DOM');
    }
  }
  tryAttachManualDecrypt();
  setTimeout(tryAttachManualDecrypt, 1000);

  function tryAttachManualEncrypt() {
    const btn = document.getElementById('manual-encrypt-btn');
    console.log('¿Existe manual-encrypt-btn?', btn);
    if (btn) {
      btn.removeEventListener('click', encryptWithCustomKey); // Previene duplicados
      btn.addEventListener('click', encryptWithCustomKey);
    } else {
      console.error('No se encontró el botón manual-encrypt-btn en el DOM');
    }
  }
  tryAttachManualEncrypt();
  setTimeout(tryAttachManualEncrypt, 1000);

  // Add helpful tooltips and validate inputs
  document.getElementById('prime-p').addEventListener('input', function() {
    const value = parseInt(this.value);
    if (value && !isPrime(value)) {
      this.style.borderColor = '#FF803A';
    } else {
      this.style.borderColor = '#ddd';
    }
  });
  
  document.getElementById('prime-q').addEventListener('input', function() {
    const value = parseInt(this.value);
    if (value && !isPrime(value)) {
      this.style.borderColor = '#FF803A';
    } else {
      this.style.borderColor = '#ddd';
    }
  });
  
  // Add keyboard support for quiz
  document.addEventListener('keydown', function(e) {
    if (e.key >= '1' && e.key <= '4') {
      const optionIndex = parseInt(e.key) - 1;
      const options = document.querySelectorAll('.quiz-option');
      if (options[optionIndex]) {
        options[optionIndex].click();
      }
    } else if (e.key === 'Enter') {
      const submitBtn = document.getElementById('submit-btn');
      const nextBtn = document.getElementById('next-btn');
      if (submitBtn && submitBtn.style.display !== 'none') {
        submitAnswer();
      } else if (nextBtn && nextBtn.style.display !== 'none') {
        nextQuestion();
      }
    }
  });
  
  console.log('🔐 Bancolombia Post-Quantum Cryptography Simulator initialized');
  console.log('🚀 Ready for educational experience!');
});