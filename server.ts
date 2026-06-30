import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Get Gemini client using the mandatory user custom key
function getGeminiClient(userKey?: string): GoogleGenAI {
  const apiKey = userKey?.trim();
  if (!apiKey) {
    throw new Error("Clave de API de Gemini requerida. Por razones de seguridad, privacidad y cuotas de consumo gratuitas, es obligatorio registrar tu propia Clave de API en el panel de Configuración de la aplicación.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/reflection/analyze", async (req, res) => {
  try {
    const { entries = [], habits = [] } = req.body;
    const userKey = req.headers["x-user-api-key"] as string | undefined;

    const client = getGeminiClient(userKey);

    // Construct the context representing the user's progress
    let entriesContext = "Ninguna entrada de bitácora registrada aún.";
    if (entries.length > 0) {
      entriesContext = entries
        .slice(0, 5) // Last 5 entries for focus and token limits
        .map((e: any, i: number) => {
          return `--- Entrada ${i + 1} (${e.date}) ---
Estado de ánimo: ${e.mood}
Victoria / Enfoque Central: ${e.dailyFocus || "No especificado"}
Agradecimiento: ${e.gratitude || "No especificado"}
Descarga Mental: ${e.brainDump || "No especificada"}
Reflexión / Optimización: ${e.reflection || "No especificada"}`;
        })
        .join("\n\n");
    }

    let habitsContext = "Ningún hábito configurado aún.";
    if (habits.length > 0) {
      habitsContext = habits
        .map((h: any, i: number) => {
          return `- Hábito: "${h.title}" (Identidad asociada: "${h.identity || "General"}")
  Racha actual: ${h.streak} días | Mejor racha: ${h.bestStreak} días
  Señal/ stack stacking: ${h.cue || "No especificada"}
  Tipo: ${h.isHarmful ? "Hábito a romper (nocivo)" : "Hábito a construir (positivo)"}`;
        })
        .join("\n");
    }

    const systemPrompt = `Eres el "Analista de Reflexión" del sistema de enfoque, disciplina y desarrollo personal del usuario.
Tu filosofía está inspirada en "Hábitos Atómicos" de James Clear y psicología conductual moderna. Tu objetivo es realizar una auditoría honesta, profunda y empática de los sistemas del usuario para ayudarlo a crecer.

Reglas fundamentales de respuesta:
1. No te limites a repetir lo que el usuario ya anotó. Encuentra la "verdadera fricción" o patrones comunes (por ejemplo, si los días de mal humor o cansancio coinciden con baja en hábitos, o si la descarga mental revela estrés recurrente).
2. Desafía constructivamente los sesgos cognitivos, las excusas inconscientes o la inconsistencia en los hábitos con tono firme pero extremadamente inspirador y empático.
3. Propone soluciones a nivel "Sistema" (acción obvia de 1%, apilamiento de hábitos, optimización de fricción o diseño de entorno) específicas para el usuario, en lugar de consejos motivacionales genéricos.
4. Tu respuesta debe estructurarse de manera impecable usando Markdown, con una redacción pulida, profesional, madura y persuasiva.
5. Usa subtítulos atractivos (e.g., "🧬 Diagnóstico de Sistemas", "⚠️ Puntos Inconscientes de Fricción", "⚡ Planes de Acción del 1%").
6. Idioma: Español.`;

    const userPrompt = `Analiza mi rendimiento y estabilidad emocional en base a mi bitácora y hábitos de comportamiento recientes.

Aquí tienes mis entradas de bitácora recientes:
${entriesContext}

Aquí tienes mis hábitos programados y su estado:
${habitsContext}

Por favor, bríndame un análisis personalizado de crecimiento.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      analysis: response.text || "No se pudo generar el análisis. Inténtalo de nuevo.",
    });
  } catch (error: any) {
    console.error("Gemini server analysis error:", error);
    
    let userFriendlyError = "Ocurrió un error al procesar el análisis de reflexión por parte de la IA.";
    let details = error.message || String(error);

    const checkStr = String(error).toLowerCase() + " " + String(error.message).toLowerCase();

    if (checkStr.includes("quota") || checkStr.includes("limit") || checkStr.includes("429") || checkStr.includes("exhausted")) {
      userFriendlyError = "Límite de solicitudes de IA temporalmente alcanzado (Quota Limit).";
      details = "El Analista de Reflexión está recibiendo muchas consultas simultáneas de otros usuarios en este momento. Por favor, espera entre 15 y 30 segundos antes de volver a intentarlo. Para aplicaciones con alto volumen de usuarios, te sugerimos habilitar la facturación de pago por consumo (Pay-As-You-Go) en Google AI Studio para remover límites gratuitos.";
    } else if (checkStr.includes("api key") || checkStr.includes("invalid") || checkStr.includes("not found")) {
      userFriendlyError = "Clave API de Gemini con inconvenientes de configuración.";
      details = "Asegúrate de que tu clave GEMINI_API_KEY esté correctamente configurada e ingresada sin espacios en blanco en Settings > Secrets de tu panel de AI Studio.";
    }

    res.status(500).json({
      error: userFriendlyError,
      details,
    });
  }
});

app.post("/api/growth/blueprint", async (req, res) => {
  try {
    const { focus, userName = "Elías", stats = {} } = req.body;
    const userKey = req.headers["x-user-api-key"] as string | undefined;

    const client = getGeminiClient(userKey);

    const focusTitles: { [key: string]: string } = {
      alto_rendimiento: "Deportista de Élite (Alto Rendimiento Físico)",
      libertad_financiera: "Libertad Financiera (Control de Riqueza y Presupuesto)",
      mente_acero: "Mente de Acero (Disciplina Estoica, Enfoque y Hábitos)",
      salud_vitalidad: "Nutrición & Vitalidad (Optimización de Energía y Nutrientes)"
    };

    const selectedFocusTitle = focusTitles[focus] || "Superación Integral";

    const systemPrompt = `Eres el "Mentor Supremo de Crecimiento y Disciplina" del usuario.
Tu filosofía está inspirada en grandes mentores de alto rendimiento, filosofía estoica (Séneca, Marco Aurelio), optimización neurobiológica (Andrew Huberman) y disciplina táctica (Jocko Willink, James Clear).
Tu misión es guiar al usuario hacia su mejor versión absoluta en base a su enfoque elegido de vida y sus estadísticas actuales. No das consejos vagos; das pautas concisas, ultra-memorables, de alto impacto y basadas en sistemas.

Estructura de respuesta obligatoria (en hermoso Markdown):
1. **🔥 VISIÓN DE CAMPEÓN**: Un párrafo breve de gran impacto que encienda su fuego interno y valide su enfoque elegido.
2. **🧬 DIAGNÓSTICO DE SISTEMAS**: Analiza brevemente las estadísticas provistas (hábitos, tareas, finanzas) en relación con su enfoque.
3. **🎯 EL PLAN DE BATALLA (3 PASOS DEL 1%)**: Tres acciones concretas que el usuario debe ejecutar esta misma semana. Deben ser micro-pasos específicos (acciones obvias de 2 minutos que escalen).
4. **💪 DECLARACIÓN DE PODER**: Una sola oración final, en negritas, extremadamente inspiradora e inquebrantable.

Reglas:
- Sé directo, humilde, pero sumamente enérgico y persuasivo.
- Usa terminología de excelencia (sistemas, fricción, apilamiento, hábitos atómicos).
- Idioma: Español.`;

    const userPrompt = `Hola Mentor. Mi nombre es ${userName} y mi enfoque actual de superación es: "${selectedFocusTitle}".

Aquí están algunas de mis estadísticas de la plataforma actuales para tu análisis:
- Tareas en mi agenda: ${stats.totalTasks || 0} registradas (${stats.completedTasks || 0} completadas, ${stats.failedTasks || 0} sin cumplir).
- Hábitos activos: ${stats.totalHabits || 0} hábitos programados. Racha máxima de hábitos activa: ${stats.maxHabitStreak || 0} días.
- Balance Financiero Estimado: Ingresos de $${stats.totalIncomes || 0} ARS y Gastos de $${stats.totalExpenses || 0} ARS.

Por favor, genera mi Plan de Batalla personalizado de Superación Personal para esta semana.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });

    res.json({
      blueprint: response.text || "No se pudo generar el plan de batalla. Inténtalo de nuevo.",
    });
  } catch (error: any) {
    console.error("Gemini server blueprint error:", error);
    res.status(500).json({
      error: "Error al generar tu plan de batalla por IA.",
      details: error.message || String(error),
    });
  }
});

import os from "os";

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

async function startServer() {
  // Robust production detection so it works reliably on Render
  const isProd = process.env.NODE_ENV === "production" || 
                 process.argv[1]?.endsWith("server.cjs") || 
                 !process.argv[1]?.endsWith("server.ts");

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const localIp = getLocalIp();
    console.log(`\n🚀 ¡Servidor de desarrollo activo!`);
    console.log(`📡 LOCAL:   http://localhost:${PORT}`);
    if (localIp) {
      console.log(`📱 RED/CEL: http://${localIp}:${PORT}\n`);
      console.log(`💡 Para abrirlo en tu celular:`);
      console.log(`   1. Asegúrate de que tu celular y computadora estén en la misma red Wi-Fi.`);
      console.log(`   2. Abre el navegador de tu celular e ingresa: http://${localIp}:${PORT}\n`);
    } else {
      console.log(`📱 RED/CEL: No se pudo detectar una IP local automáticamente.\n`);
    }
  });
}

startServer();
