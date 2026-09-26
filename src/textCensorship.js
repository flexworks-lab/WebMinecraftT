const CENSOR_TERMS = [
    "fuck","fucker","fucking","motherfucker","shit","shitting","bullshit",
    "bitch","bitches","bitching","cunt","asshole","assholes","dumbass","jackass",
    "dick","dicks","dickhead","pussy","pussies","whore","whores","slut","sluts",
    "bastard","crap","damn","hell","idiot","moron","stupid","retard","retarded",
    "nazi","nigger","faggot","fag","dyke","spic","chink","kike","gook","tranny",
    "porn","porno","pornography","rape","rapist","molest","molester"
];

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

function termPattern(term) {
    return [...term.toLowerCase()].map(char => {
        if (char === " ") return "[\\s\\W_]+";
        const escaped = char.replace(/[-[\]{}()*+?.\\^$|]/g, "\\$&");
        return (LEET[char] || escaped) + "[^A-Za-z0-9]*";
    }).join("");
}

const TERM_REGEXES = CENSOR_TERMS
    .sort((a, b) => b.length - a.length)
    .map(term => new RegExp("(^|[^A-Za-z0-9])(" + termPattern(term) + ")(?=$|[^A-Za-z0-9])", "giu"));

function mask(match) {
    return match.replace(/[^\s]/g, "█");
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
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 40);
    return censored || fallback;
}
