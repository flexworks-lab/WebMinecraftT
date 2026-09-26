const BASE_CENSOR_TERMS = [
    // Common profanity and insults.
    "arsehole","asshat","asshole","assmunch","bastard","bitch","bloody","blowjob","bollocks",
    "brainfuck","bugger","bullshit","chicken shit","ching chong","clusterfuck","cock","cocksucker",
    "coonass","cornhole","cracker","crap","cunt","damn","dick","dickhead","dumbass","enshittification",
    "faggot","feck","fuck","fuck her right in the pussy","fuck joe biden","fuckery","gay pejorative",
    "grab em by the pussy","healslut","hell","hori","horseshit","if you see kay",
    "jesus fucking christ","kike","motherfucker","nigga","nigger","niggerhead","pajeet","paki",
    "polaco","poof","poofter","prick","pussy","queer pejorative","ratfucking","retard","russian warship go fuck yourself",
    "serving cunt","shit","shit happens","shithouse","shitposting","shitter","shut the fuck up",
    "shut the hell up","slut","son of a bitch","spic","taking the piss","twat","unclefucker","wanker",
    "wetback","whore",

    // Existing stronger safety terms.
    "idiot","moron","stupid","retarded","nazi","fag","dyke","chink","gook","tranny",
    "porn","porno","pornography","rape","rapist","molest","molester",

    // Sexual phrases from the supplied dictionary.
    "big black cock","fuck marry kill"
];

const LEARNED_STORAGE_KEY = "webminecraft-learned-censor-terms";
const MAX_LEARNED_TERMS = 500;

const LEET = {
    a: "[a4@]",
    b: "[b8]",
    c: "[c(]",
    e: "[e3]",
    g: "[g9]",
    i: "[i1!|]",
    l: "[l1|]",
    o: "[o0]",
    s: "[s5$]",
    t: "[t7]",
    z: "[z2]"
};

function cleanTerm(term) {
    return String(term ?? "")
        .toLowerCase()
        .replace(/[\\r\\n\\t]+/g, " ")
        .replace(/\\s+/g, " ")
        .trim()
        .slice(0, 80);
}

function readLearnedTerms() {
    try {
        const raw = localStorage.getItem(LEARNED_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed.map(cleanTerm).filter(Boolean).slice(0, MAX_LEARNED_TERMS);
    } catch {
        return [];
    }
}

function writeLearnedTerms(terms) {
    try {
        localStorage.setItem(LEARNED_STORAGE_KEY, JSON.stringify(terms.slice(0, MAX_LEARNED_TERMS)));
    } catch {}
}

function allTerms() {
    return [...new Set([...BASE_CENSOR_TERMS, ...readLearnedTerms()].map(cleanTerm).filter(Boolean))];
}

function termPattern(term) {
    return [...cleanTerm(term)].map(char => {
        if (char === " ") return "[\\s\\W_]+";
        const escaped = char.replace(/[-[\\]{}()*+?.\\^$|]/g, "\\$&");
        return (LEET[char] || escaped) + "[^A-Za-z0-9]*";
    }).join("");
}

function buildRegexes() {
    return allTerms()
        .sort((a, b) => b.length - a.length)
        .map(term => new RegExp(
            "(^|[^A-Za-z0-9])(" + termPattern(term) + ")(?=$|[^A-Za-z0-9])",
            "giu"
        ));
}

let TERM_REGEXES = buildRegexes();

function rebuildRegexes() {
    TERM_REGEXES = buildRegexes();
}

function mask(match) {
    return match.replace(/[^\\s]/g, "█");
}

export function learnCensorTerm(term) {
    const cleaned = cleanTerm(term);
    if (!cleaned || cleaned.length < 2 || BASE_CENSOR_TERMS.includes(cleaned)) return false;

    const learned = readLearnedTerms();
    if (learned.includes(cleaned)) return false;

    learned.push(cleaned);
    writeLearnedTerms(learned);
    rebuildRegexes();
    return true;
}

export function learnCensorTerms(terms) {
    let added = 0;
    for (const term of Array.isArray(terms) ? terms : [terms]) {
        if (learnCensorTerm(term)) added += 1;
    }
    return added;
}

export function getLearnedCensorTerms() {
    return readLearnedTerms();
}

export function clearLearnedCensorTerms() {
    try { localStorage.removeItem(LEARNED_STORAGE_KEY); } catch {}
    rebuildRegexes();
}

export function censorUserText(value) {
    let text = String(value ?? "");
    for (const regex of TERM_REGEXES) {
        text = text.replace(regex, (_, prefix, hit) => prefix + mask(hit));
    }
    return text;
}

export function normalizeSafeName(value, fallback = "") {
    const censored = censorUserText(value)
        .replace(/[\\r\\n\\t]+/g, " ")
        .replace(/\\s+/g, " ")
        .trim()
        .slice(0, 40);
    return censored || fallback;
}
