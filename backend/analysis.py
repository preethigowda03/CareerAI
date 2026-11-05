import os
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Union

try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None

try:
    from PyPDF2 import PdfReader as PyPDF2Reader
except Exception:
    PyPDF2Reader = None

try:
    import pdfplumber
except Exception:
    pdfplumber = None


SKILL_ALIASES = {
    "python": ["python"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite"],
    "machine learning": ["machine learning", "machine-learning", "ml"],
    "deep learning": ["deep learning", "deep-learning"],
    "data structures": ["data structures", "data structure", "dsa"],
    "algorithms": ["algorithms", "algorithm", "data structures & algorithms"],
    "object oriented programming": ["object-oriented programming", "object oriented programming", "oop"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
    "tensorflow": ["tensorflow"],
    "pytorch": ["pytorch"],
    "nlp": ["natural language processing", "nlp"],
    "computer vision": ["computer vision", "opencv"],
    "statistics": ["statistics", "statistical"],
    "data analysis": ["data analysis", "data analytics", "analytics"],
    "data visualization": ["data visualization", "visualization"],
    "power bi": ["power bi", "powerbi"],
    "excel": ["excel", "microsoft excel"],
    "git": ["git"],
    "github": ["github", "github.com"],
    "linkedin": ["linkedin", "linkedin.com"],
    "rest api": ["rest api", "rest apis", "restful api", "restful apis"],
    "apis": ["api", "apis"],
    "node.js": ["node.js", "nodejs"],
    "typescript": ["typescript"],
    "javascript": ["javascript", "java script"],
    "java": ["java"],
    "c++": ["c++", "cpp"],
    "c": ["c programming", "c language"],
    "aws": ["aws", "amazon web services"],
    "azure": ["azure", "microsoft azure"],
    "docker": ["docker"],
    "mongodb": ["mongodb", "mongo db"],
    "dbms": ["dbms", "database management system"],
    "operating systems": ["operating systems", "operating system", "os basics"],
    "communication": ["communication", "communication skills"],
    "problem solving": ["problem-solving", "problem solving"],
    "leadership": ["leadership"],
    "teamwork": ["teamwork", "team work"],
}

RECOMMENDED_SKILLS = [
    "python", "sql", "machine learning", "git", "communication",
    "problem solving", "github", "linkedin"
]


def _clean(text: str) -> str:
    text = text.replace("\x00", " ")
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_text_from_pdf(source: Union[str, os.PathLike, bytes, bytearray]) -> str:
    """Extract text from a PDF using several fallbacks."""
    if isinstance(source, (bytes, bytearray)):
        data = bytes(source)
        if PdfReader is not None:
            try:
                from io import BytesIO
                reader = PdfReader(BytesIO(data))
                text = "\n".join((page.extract_text() or "") for page in reader.pages)
                if text.strip():
                    return _clean(text)
            except Exception:
                pass
        if PyPDF2Reader is not None:
            try:
                from io import BytesIO
                reader = PyPDF2Reader(BytesIO(data))
                text = "\n".join((page.extract_text() or "") for page in reader.pages)
                if text.strip():
                    return _clean(text)
            except Exception:
                pass
        if pdfplumber is not None:
            try:
                from io import BytesIO
                with pdfplumber.open(BytesIO(data)) as pdf:
                    text = "\n".join((page.extract_text() or "") for page in pdf.pages)
                return _clean(text)
            except Exception:
                pass
        return ""

    path = Path(source)
    if not path.exists():
        raise FileNotFoundError(f"Resume file not found: {path}")

    if PdfReader is not None:
        try:
            reader = PdfReader(str(path))
            text = "\n".join((page.extract_text() or "") for page in reader.pages)
            if text.strip():
                return _clean(text)
        except Exception:
            pass

    if PyPDF2Reader is not None:
        try:
            reader = PyPDF2Reader(str(path))
            text = "\n".join((page.extract_text() or "") for page in reader.pages)
            if text.strip():
                return _clean(text)
        except Exception:
            pass

    if pdfplumber is not None:
        try:
            with pdfplumber.open(str(path)) as pdf:
                text = "\n".join((page.extract_text() or "") for page in pdf.pages)
            return _clean(text)
        except Exception:
            pass

    return ""


def _normalise_for_search(text: str) -> str:
    value = text.lower()
    value = value.replace("–", "-").replace("—", "-")
    value = re.sub(r"\s+", " ", value)
    return value


def detect_skills(text: str) -> List[str]:
    normalized = _normalise_for_search(text)
    found: List[str] = []
    for canonical, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            pattern = r"(?<![a-z0-9])" + re.escape(alias.lower()) + r"(?![a-z0-9])"
            if re.search(pattern, normalized):
                found.append(canonical)
                break
    return found


def _section(text: str, headings: Iterable[str]) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    heading_set = {h.lower() for h in headings}
    start = None
    for i, line in enumerate(lines):
        normalized = re.sub(r"[^a-z ]", "", line.lower()).strip()
        if normalized in heading_set or any(normalized.startswith(h) for h in heading_set):
            start = i + 1
            break
    if start is None:
        return ""
    end = len(lines)
    common_headings = {
        "summary", "profile", "objective", "education", "technical skills",
        "skills", "experience", "work experience", "projects", "certificates",
        "certifications", "hackathon and experience", "soft skills", "conclusion",
        "achievements", "internship", "internships", "links"
    }
    for j in range(start, len(lines)):
        normalized = re.sub(r"[^a-z ]", "", lines[j].lower()).strip()
        if normalized in common_headings:
            end = j
            break
    return "\n".join(lines[start:end])


def extract_education(text: str) -> List[str]:
    block = _section(text, ["education", "academic background", "educational qualifications"])
    if not block:
        matches = re.findall(
            r"(?im)^.*(?:B\.E\.?|B\.Tech|M\.E\.?|M\.Tech|Bachelor|Master|SSLC|PUC|12th|10th|CGPA|graduation).*$",
            text,
        )
        block = "\n".join(matches)
    lines = []
    for line in block.splitlines():
        line = re.sub(r"^[\-•*\d.)\s]+", "", line).strip()
        if len(line) >= 3:
            lines.append(line)
    result: List[str] = []
    for line in lines:
        if line not in result:
            result.append(line)
    return result[:12]


def extract_projects_and_experience(text: str) -> str:
    project_block = _section(text, ["projects", "project experience", "experience", "work experience", "internship", "internships"])
    if project_block:
        return project_block[:1800]
    indicators = re.findall(
        r"(?im)^.*(?:developed|implemented|built|worked|experience|internship|project|hackathon).*$",
        text,
    )
    return "\n".join(indicators[:25])[:1800]


def detect_careers(text: str, skills: List[str]) -> List[str]:
    normalized = _normalise_for_search(text)
    careers: List[str] = []
    mappings = [
        (("machine learning", "scikit-learn", "tensorflow", "pytorch", "numpy", "pandas"), "Machine Learning Engineer"),
        (("python", "sql", "apis", "rest api", "node.js"), "Python Developer"),
        (("sql", "data analysis", "pandas", "power bi", "excel"), "Data Analyst"),
        (("machine learning", "deep learning", "statistics", "pandas"), "Data Scientist"),
        (("aws", "azure", "docker"), "Cloud / DevOps Engineer"),
        (("javascript", "typescript", "node.js", "rest api"), "Full Stack Developer"),
    ]
    for required, career in mappings:
        hits = sum(1 for skill in required if skill in skills or skill in normalized)
        if hits >= 2 and career not in careers:
            careers.append(career)
    if not careers:
        careers = ["Python Developer", "Data Analyst", "Machine Learning Engineer"]
    return careers[:5]


def build_score(skills: List[str], education: List[str], experience: str, text: str) -> Dict[str, Dict[str, int]]:
    normalized = _normalise_for_search(text)
    has_experience = bool(experience.strip()) and bool(re.search(r"developed|implemented|worked|experience|internship|project|hackathon", experience.lower()))
    has_internship = bool(re.search(r"internship|intern\b|industrial training", normalized))
    has_projects = bool(re.search(r"project|developed|implemented|built", normalized))
    has_github = "github" in normalized or "github.com" in normalized
    has_linkedin = "linkedin" in normalized or "linkedin.com" in normalized
    return {
        "skills": {"score": min(40, round(len(skills) / 12 * 40)), "maximum": 40},
        "education": {"score": 20 if education else 0, "maximum": 20},
        "experience": {"score": 15 if has_experience else 0, "maximum": 15},
        "internship": {"score": 10 if has_internship else 0, "maximum": 10},
        "projects": {"score": 10 if has_projects else 0, "maximum": 10},
        "github": {"score": 3 if has_github else 0, "maximum": 3},
        "linkedin": {"score": 2 if has_linkedin else 0, "maximum": 2},
    }


def analyze_resume_text(text: str, filename: str = "Resume.pdf") -> Dict[str, Any]:
    text = _clean(text or "")
    skills = detect_skills(text)
    education = extract_education(text)
    experience = extract_projects_and_experience(text)
    careers = detect_careers(text, skills)
    breakdown = build_score(skills, education, experience, text)
    score = sum(item["score"] for item in breakdown.values())

    missing = [skill for skill in RECOMMENDED_SKILLS if skill not in skills]
    tips: List[str] = []
    normalized = _normalise_for_search(text)
    if not re.search(r"internship|intern\b", normalized):
        tips.append("Consider adding internship experience with measurable outcomes.")
    if not re.search(r"project|developed|implemented|built", normalized):
        tips.append("Add practical academic or personal projects.")
    if "github" not in normalized:
        tips.append("Add your GitHub profile to showcase projects.")
    if "linkedin" not in normalized:
        tips.append("Add your LinkedIn profile.")
    if not education:
        tips.append("Clearly mention your educational qualifications.")
    if len(skills) < 6:
        tips.append("Add more relevant technical skills and tools.")
    if not tips:
        tips.append("Keep your resume concise and quantify project or experience outcomes.")

    if score >= 80:
        strength = "Strong resume profile"
    elif score >= 60:
        strength = "Good foundation with room for improvement"
    else:
        strength = "Needs improvement"

    return {
        "filename": filename,
        "resume_score": score,
        "resume_strength": strength,
        "skills_found": skills,
        "skills_count": len(skills),
        "education": education,
        "experience": experience if experience else "No experience detected",
        "career_recommendations": careers,
        "skill_gap": missing,
        "score_breakdown": breakdown,
        "improvement_tips": tips,
        "improvement_suggestions": tips,
    }


def analyze_resume(source: Union[str, os.PathLike, bytes, bytearray], filename: Optional[str] = None) -> Dict[str, Any]:
    if isinstance(source, (bytes, bytearray)):
        text = extract_text_from_pdf(source)
        name = filename or "Resume.pdf"
    else:
        path = Path(source)
        text = extract_text_from_pdf(path)
        name = filename or path.name
    return analyze_resume_text(text, name)


def analyze_resume_file(file_path: Union[str, os.PathLike]) -> Dict[str, Any]:
    return analyze_resume(file_path)


def analyze_resume_pdf(file_path: Union[str, os.PathLike]) -> Dict[str, Any]:
    return analyze_resume(file_path)


def analyze(text: str, filename: str = "Resume.pdf") -> Dict[str, Any]:
    return analyze_resume_text(text, filename)


# ---------------------------------------------------------------------------
# FastAPI endpoint used by the existing CareerAI frontend
# ---------------------------------------------------------------------------
try:
    from fastapi import APIRouter, HTTPException
    router = APIRouter()
except Exception:
    router = None


def _get_resume_collections():
    collections = []

    try:
        from database.mongodb import resumes_collection
        collections.append(resumes_collection)
    except Exception:
        pass

    try:
        from database.mongodb import resume_collection
        if all(resume_collection is not item for item in collections):
            collections.append(resume_collection)
    except Exception:
        pass

    if not collections:
        raise RuntimeError("Resume MongoDB collection could not be loaded")

    return collections


def _find_resume_document(resume_id: str):
    from bson import ObjectId

    lookup_values = [resume_id]
    if ObjectId.is_valid(resume_id):
        lookup_values.append(ObjectId(resume_id))

    queries = []
    for value in lookup_values:
        queries.extend([
            {"resume_id": value},
            {"id": value},
            {"_id": value},
        ])

    for collection in _get_resume_collections():
        for query in queries:
            try:
                document = collection.find_one(query)
                if document is not None:
                    return collection, document
            except Exception:
                continue

    return None, None


if router is not None:
    @router.get("/analyze-resume/{resume_id}")
    def analyze_resume_endpoint(resume_id: str):
        collection, document = _find_resume_document(resume_id)

        if document is None:
            raise HTTPException(
                status_code=404,
                detail=f"Resume not found for resume_id: {resume_id}",
            )

        filename = (
            document.get("filename")
            or document.get("file_name")
            or document.get("name")
            or "Resume.pdf"
        )

        text = (
            document.get("text")
            or document.get("extracted_text")
            or document.get("resume_text")
            or document.get("content")
            or ""
        )

        if isinstance(text, str) and text.strip():
            result = analyze_resume_text(text, filename)
        else:
            file_path = document.get("file_path") or document.get("path")
            file_bytes = (
                document.get("file_data")
                or document.get("pdf_data")
                or document.get("data")
            )

            if file_path:
                result = analyze_resume(file_path, filename)
            elif isinstance(file_bytes, (bytes, bytearray)):
                result = analyze_resume(file_bytes, filename)
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Resume text or PDF data is not available for analysis",
                )

        result["resume_id"] = resume_id
        result["status"] = "completed"

        try:
            document_id = document.get("_id")
            if document_id is not None:
                collection.update_one(
                    {"_id": document_id},
                    {
                        "$set": {
                            "status": "completed",
                            "analysis": result,
                        }
                    },
                )
            else:
                collection.update_one(
                    {"resume_id": resume_id},
                    {
                        "$set": {
                            "status": "completed",
                            "analysis": result,
                        }
                    },
                )
        except Exception:
            pass

        return result
