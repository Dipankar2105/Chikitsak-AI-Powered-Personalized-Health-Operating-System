import csv
from pathlib import Path
from backend.app.logging_config import get_logger

logger = get_logger("services.medication_interaction")

DATA_FILE = Path(__file__).parent.parent / "data" / "interactions.csv"

# ── Common drug-class aliases ────────────────────────────────────────────
DRUG_ALIASES: dict[str, list[str]] = {
    "nsaid": ["ibuprofen", "naproxen", "diclofenac", "aspirin", "celecoxib"],
    "maoi": ["phenelzine", "tranylcypromine", "selegiline"],
    "antacid": ["omeprazole", "pantoprazole", "ranitidine", "calcium carbonate"],
    "statin": ["simvastatin", "atorvastatin", "rosuvastatin", "pravastatin"],
}


def _normalize(name: str) -> str:
    return name.strip().lower()


def _expand_aliases(medications: list[str]) -> set[str]:
    """Expand class-level aliases to include individual drugs."""
    expanded = set()
    for med in medications:
        norm = _normalize(med)
        expanded.add(norm)
        # If the user typed a class name, expand it
        if norm in DRUG_ALIASES:
            expanded.update(DRUG_ALIASES[norm])
    return expanded


def _load_interaction_rules() -> list[tuple[str, str, str, str]]:
    """Load interaction rules from CSV file."""
    rules = []
    if not DATA_FILE.exists():
        logger.warning("Interaction data file not found at %s", DATA_FILE)
        return []

    try:
        with open(DATA_FILE, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rules.append((
                    _normalize(row["drug_a"]),
                    _normalize(row["drug_b"]),
                    _normalize(row["severity"]),
                    row["description"],
                ))
        logger.info("Loaded %d interaction rules from CSV", len(rules))
    except Exception as e:
        logger.error("Failed to load interaction rules: %s", e)

    return rules


# Load rules once at module level (or could be lazy-loaded)
INTERACTION_RULES = _load_interaction_rules()


def check_interactions(medications: list[str]) -> list[dict]:
    """
    Check a list of medication names against the interaction rule table.
    Returns a list of interaction warnings.
    """
    med_set = _expand_aliases(medications)
    warnings: list[dict] = []

    for drug_a, drug_b, severity, description in INTERACTION_RULES:
        if drug_a in med_set and drug_b in med_set:
            warnings.append({
                "drug_a": drug_a,
                "drug_b": drug_b,
                "severity": severity,
                "description": description,
            })

    logger.info(
        "Checked %d medications → %d interaction(s) found",
        len(medications), len(warnings),
    )
    return warnings


def check_allergy_conflicts(
    medications: list[str], allergies: str | list[str] | None
) -> list[dict]:
    """
    Cross-reference medications against a user's known allergies.
    Allergies can be a comma-separated string or a list of strings.
    """
    conflicts: list[dict] = []
    allergy_set = set()
    med_set = _expand_aliases(medications)

    # Check Allergies
    if allergies:
        if isinstance(allergies, list):
            allergy_names = [a.strip() for a in allergies if a.strip()]
        else: # Assume string
            allergy_names = [a.strip() for a in allergies.split(",") if a.strip()]

        allergy_set = {_normalize(a) for a in allergy_names}
        
        for med in med_set:
            if med in allergy_set:
                conflicts.append({
                    "medication": med,
                    "allergy": med,
                    "warning": f"Patient is allergic to {med}",
                })

    # Also check class-level: if allergic to "nsaid", flag any nsaid
    for allergy in allergy_set:
        if allergy in DRUG_ALIASES:
            for member in DRUG_ALIASES[allergy]:
                if member in med_set and not any(c["medication"] == member for c in conflicts):
                    conflicts.append({
                        "medication": member,
                        "allergy": allergy,
                        "warning": f"Patient is allergic to {allergy} class (includes {member})",
                    })

    logger.info(
        "Checked %d medications against allergies → %d conflict(s)",
        len(medications), len(conflicts),
    )
    return conflicts
