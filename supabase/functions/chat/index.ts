import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  userId?: string;
  conversationHistory?: { role: string; content: string }[];
}

interface Disease {
  id: string;
  name: string;
  symptoms: string[];
  advice: string;
  is_critical: boolean;
}

interface MatchResult {
  disease: Disease;
  matchScore: number;
  matchedSymptoms: string[];
}

const SYMPTOM_SYNONYMS: Record<string, string[]> = {
  "fever": ["temperature", "hot", "burning up", "chills", "feverish", "pyrexia", "high temp"],
  "headache": ["head pain", "head ache", "migraine", "head hurts", "throbbing head", "head throbbing"],
  "cough": ["coughing", "dry cough", "wet cough", "hacking cough", "cough up"],
  "fatigue": ["tired", "tiredness", "exhausted", "exhaustion", "weak", "weakness", "lethargy", "lethargic", "no energy"],
  "nausea": ["nauseous", "feel sick", "queasy", "stomach upset", "want to vomit"],
  "vomiting": ["vomit", "throwing up", "throw up", "puking", "puke"],
  "diarrhea": ["loose stools", "watery stools", "runs", "loose motion", "diarrhoea"],
  "chest pain": ["chest hurts", "chest ache", "chest tightness", "tight chest", "chest pressure"],
  "shortness of breath": ["breathless", "can't breathe", "difficulty breathing", "hard to breathe", "trouble breathing", "dyspnea"],
  "sore throat": ["throat pain", "throat hurts", "painful throat", "scratchy throat", "strep"],
  "runny nose": ["stuffy nose", "nasal congestion", "nose running", "blocked nose", "rhinorrhea"],
  "body ache": ["muscle pain", "body pain", "aching", "myalgia", "muscles ache", "limb pain"],
  "rash": ["skin rash", "skin irritation", "hives", "itchy skin", "red spots"],
  "abdominal pain": ["stomach pain", "tummy ache", "stomach ache", "belly pain", "abdominal cramps", "stomach cramps"],
  "dizziness": ["dizzy", "lightheaded", "vertigo", "spinning", "unsteady"],
  "anxiety": ["anxious", "panic", "worry", "stressed", "nervous", "panic attack"],
  "insomnia": ["can't sleep", "sleep problems", "trouble sleeping", "sleepless", "sleep disorder"],
  "joint pain": ["joint ache", "arthritis", "joints hurt", "joint stiffness", "stiff joints"],
  "back pain": ["back ache", "lower back pain", "spine pain", "backache"],
  "swelling": ["swollen", "edema", "puffiness", "bloated", "inflammation"],
};

function normalizeSymptom(input: string): string {
  const lower = input.toLowerCase();
  for (const [canonical, synonyms] of Object.entries(SYMPTOM_SYNONYMS)) {
    if (synonyms.some(s => lower.includes(s)) || lower.includes(canonical)) {
      return canonical;
    }
  }
  return lower;
}

function extractSymptoms(message: string): string[] {
  const lower = message.toLowerCase();
  const found: string[] = [];

  for (const [canonical, synonyms] of Object.entries(SYMPTOM_SYNONYMS)) {
    if (lower.includes(canonical) || synonyms.some(s => lower.includes(s))) {
      found.push(canonical);
    }
  }

  const commonWords = new Set([
    "i", "have", "am", "been", "feeling", "experiencing", "suffering", "with", "and", "also",
    "plus", "from", "the", "a", "an", "my", "some", "bit", "little", "lot", "very", "since",
    "past", "days", "day", "hours", "hour", "weeks", "week", "keep", "getting", "had", "has",
  ]);

  const words = lower.replace(/[,\.;!?]/g, " ").split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!commonWords.has(word) && word.length > 3 && !found.includes(word)) {
      const bigram = i + 1 < words.length ? `${word} ${words[i + 1]}` : "";
      if (bigram && !commonWords.has(words[i + 1])) {
        const normalized = normalizeSymptom(bigram);
        if (!found.includes(normalized)) found.push(normalized);
      }
      const normalized = normalizeSymptom(word);
      if (!found.includes(normalized)) found.push(normalized);
    }
  }

  return [...new Set(found)].filter(s => s.length > 2);
}

function getEditDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return (maxLen - getEditDistance(a, b)) / maxLen;
}

function findDiseaseMatches(message: string, symptoms: string[], diseases: Disease[]): MatchResult[] {
  const processedMessage = message.toLowerCase().trim();
  const matches: MatchResult[] = [];

  for (const disease of diseases) {
    let totalScore = 0;
    const matchedSymptoms: string[] = [];

    for (const diseaseSymptom of disease.symptoms) {
      const dsLower = diseaseSymptom.toLowerCase();

      if (processedMessage.includes(dsLower)) {
        totalScore += 1.5;
        matchedSymptoms.push(diseaseSymptom);
        continue;
      }

      for (const extractedSymptom of symptoms) {
        const sim = calculateSimilarity(extractedSymptom, dsLower);
        if (sim > 0.75) {
          totalScore += sim;
          if (!matchedSymptoms.includes(diseaseSymptom)) {
            matchedSymptoms.push(diseaseSymptom);
          }
          break;
        }
      }

      const synonyms = SYMPTOM_SYNONYMS[dsLower] || [];
      for (const syn of synonyms) {
        if (processedMessage.includes(syn)) {
          totalScore += 1.2;
          if (!matchedSymptoms.includes(diseaseSymptom)) {
            matchedSymptoms.push(diseaseSymptom);
          }
          break;
        }
      }
    }

    if (processedMessage.includes(disease.name.toLowerCase())) {
      totalScore += 3.0;
    }

    if (matchedSymptoms.length >= 2) {
      totalScore *= 1.3;
    }

    if (totalScore > 0.5) {
      matches.push({ disease, matchScore: totalScore, matchedSymptoms });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

function determineSeverity(disease: Disease, matchScore: number): string {
  if (disease.is_critical) return "critical";
  const severeNames = ["diabetes", "hypertension", "heart", "cardiac", "stroke", "pneumonia", "meningitis", "sepsis"];
  if (severeNames.some(n => disease.name.toLowerCase().includes(n))) return "severe";
  const moderateNames = ["asthma", "anemia", "gastritis", "anxiety", "depression", "migraine", "hypothyroid"];
  if (moderateNames.some(n => disease.name.toLowerCase().includes(n))) return "moderate";
  if (matchScore > 5) return "moderate";
  return "mild";
}

function getUrgencyLevel(severity: string): { label: string; color: string; action: string } {
  switch (severity) {
    case "critical":
      return {
        label: "SEEK EMERGENCY CARE IMMEDIATELY",
        color: "red",
        action: "Call emergency services (911) or go to the nearest ER right now.",
      };
    case "severe":
      return {
        label: "SEE A DOCTOR TODAY",
        color: "orange",
        action: "Schedule an urgent appointment or visit an urgent care clinic today.",
      };
    case "moderate":
      return {
        label: "SEE A DOCTOR WITHIN 2-3 DAYS",
        color: "yellow",
        action: "Book an appointment with your primary care physician soon.",
      };
    default:
      return {
        label: "MONITOR & REST",
        color: "green",
        action: "Rest, stay hydrated, and monitor your symptoms. See a doctor if they worsen.",
      };
  }
}

function buildDoctorResponse(
  matches: MatchResult[],
  symptoms: string[],
  originalMessage: string
): { response: string; isAlert: boolean; severity: string } {
  if (matches.length === 0) {
    return {
      response: buildNoMatchResponse(symptoms),
      isAlert: false,
      severity: "mild",
    };
  }

  const top = matches[0];
  const disease = top.disease;
  const severity = determineSeverity(disease, top.matchScore);
  const urgency = getUrgencyLevel(severity);
  const isAlert = disease.is_critical || severity === "critical";

  const symptomList = top.matchedSymptoms.length > 0
    ? top.matchedSymptoms
    : symptoms.slice(0, 5);

  const ddx = matches.slice(1, 4).map(m => `• ${m.disease.name}`).join("\n");

  let response = "";

  if (isAlert) {
    response += `🚨 MEDICAL ALERT — This may be a serious condition.\n\n`;
  }

  response += `CLINICAL ASSESSMENT\n`;
  response += `${"─".repeat(40)}\n\n`;

  response += `Based on your reported symptoms, the most likely diagnosis is:\n\n`;
  response += `PRIMARY DIAGNOSIS: ${disease.name.toUpperCase()}\n`;
  response += `Severity: ${severity.charAt(0).toUpperCase() + severity.slice(1)}\n\n`;

  response += `PRESENTING SYMPTOMS IDENTIFIED:\n`;
  symptomList.forEach(s => {
    response += `  • ${s.charAt(0).toUpperCase() + s.slice(1)}\n`;
  });
  response += `\n`;

  if (ddx) {
    response += `DIFFERENTIAL DIAGNOSES (other possibilities):\n${ddx}\n\n`;
  }

  response += `MEDICAL ADVICE:\n`;
  response += `${disease.advice}\n\n`;

  response += `URGENCY: ⚠️ ${urgency.label}\n`;
  response += `${urgency.action}\n\n`;

  response += `IMPORTANT: This AI assessment is for informational purposes only and does NOT replace a professional medical examination. Always consult a qualified healthcare provider for accurate diagnosis and treatment.`;

  return { response, isAlert, severity };
}

function buildNoMatchResponse(symptoms: string[]): string {
  if (symptoms.length === 0) {
    return (
      `I need more specific information to assess your condition properly.\n\n` +
      `Please describe your symptoms in detail. For example:\n` +
      `  • "I have fever, headache, and body aches for 2 days"\n` +
      `  • "I'm experiencing chest pain and shortness of breath"\n` +
      `  • "I have severe abdominal pain and nausea"\n\n` +
      `The more detail you provide about your symptoms, their duration, and severity, the better I can assist you.\n\n` +
      `If you are experiencing severe chest pain, difficulty breathing, or loss of consciousness — call emergency services immediately.`
    );
  }

  return (
    `CLINICAL ASSESSMENT\n` +
    `${"─".repeat(40)}\n\n` +
    `I've noted the following symptoms you described:\n` +
    symptoms.map(s => `  • ${s.charAt(0).toUpperCase() + s.slice(1)}`).join("\n") +
    `\n\nI was unable to match these symptoms to a specific condition with confidence.\n\n` +
    `This could mean:\n` +
    `  • Your symptoms may represent a combination of conditions\n` +
    `  • Additional diagnostic tests may be required\n` +
    `  • The condition may be uncommon or require specialist evaluation\n\n` +
    `RECOMMENDATION: Please consult a healthcare professional who can perform a physical examination and order appropriate tests.\n\n` +
    `If symptoms include chest pain, difficulty breathing, sudden severe headache, or loss of consciousness — seek emergency care immediately.`
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { message, userId }: ChatRequest = await req.json();
    const processedMessage = message.toLowerCase().trim();

    const greetings = ["hi", "hello", "hey", "namaste", "good morning", "good evening", "how are you", "what's up", "help"];
    if (greetings.some(g => processedMessage === g || processedMessage.startsWith(g + " ") || processedMessage.endsWith(" " + g))) {
      const greetResponse = (
        `Hello! I'm your AI Medical Advisor.\n\n` +
        `I can help you with:\n` +
        `  • Symptom analysis and possible diagnosis\n` +
        `  • Medical advice based on your symptoms\n` +
        `  • Urgency assessment (when to see a doctor)\n` +
        `  • General health information\n\n` +
        `Please describe your symptoms in detail. For best results, include:\n` +
        `  • What symptoms you have\n` +
        `  • How long you've had them\n` +
        `  • Severity (mild, moderate, severe)\n\n` +
        `Example: "I have had fever of 38.5°C, severe headache, body aches, and fatigue for 3 days."\n\n` +
        `How can I help you today?`
      );

      return new Response(
        JSON.stringify({ response: greetResponse, isAlert: false, disease: null, severity: "mild", matchedSymptoms: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: diseases, error } = await supabase.from("diseases").select("*");
    if (error) throw error;

    const extractedSymptoms = extractSymptoms(message);
    const matches = findDiseaseMatches(message, extractedSymptoms, diseases as Disease[]);
    const { response, isAlert, severity } = buildDoctorResponse(matches, extractedSymptoms, message);

    const matchedDisease = matches.length > 0 ? matches[0].disease.name : null;
    const matchedSymptoms = matches.length > 0 ? matches[0].matchedSymptoms : extractedSymptoms;

    if (userId && matchedDisease) {
      try {
        await supabase.from("consultation_records").insert({
          user_id: userId,
          symptoms: message,
          diagnosis: matchedDisease,
          severity_level: severity,
          recommended_action: matches[0]?.disease?.advice || "",
          specialist_recommended: isAlert ? "Emergency Medical Attention" : severity === "severe" ? "General Physician" : null,
          follow_up_required: severity === "critical" || severity === "severe",
        });

        const { count } = await supabase
          .from("consultation_records")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);

        await supabase.from("user_analytics").upsert(
          {
            user_id: userId,
            total_consultations: count || 1,
            last_consultation_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      } catch (_err) {
      }
    }

    await supabase.from("chat_history").insert({
      user_message: message,
      bot_response: response,
      disease_matched: matchedDisease,
      is_alert: isAlert,
    }).then(() => {});

    return new Response(
      JSON.stringify({ response, isAlert, disease: matchedDisease, severity, matchedSymptoms }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your message. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
