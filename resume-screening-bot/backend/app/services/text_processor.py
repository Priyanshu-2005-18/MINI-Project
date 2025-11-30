import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import spacy

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

class TextPreprocessor:
    """Preprocess text for NLP analysis"""
    
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            print("Warning: SpaCy model not installed. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove emails
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z0-9\s\-]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize(self, text: str) -> list:
        """Tokenize text"""
        tokens = word_tokenize(text)
        return tokens
    
    def remove_stopwords(self, tokens: list) -> list:
        """Remove stopwords from tokens"""
        return [token for token in tokens if token not in self.stop_words]
    
    def lemmatize(self, tokens: list) -> list:
        """Lemmatize tokens"""
        return [self.lemmatizer.lemmatize(token) for token in tokens]
    
    def preprocess(self, text: str, remove_stop=True, lemmatize=True) -> list:
        """Complete preprocessing pipeline"""
        # Clean text
        text = self.clean_text(text)
        
        # Tokenize
        tokens = self.tokenize(text)
        
        # Remove stopwords
        if remove_stop:
            tokens = self.remove_stopwords(tokens)
        
        # Lemmatize
        if lemmatize:
            tokens = self.lemmatize(tokens)
        
        return tokens
    
    def extract_entities(self, text: str) -> dict:
        """Extract named entities using SpaCy"""
        if not self.nlp:
            return {}
        
        doc = self.nlp(text)
        entities = {
            "persons": [],
            "organizations": [],
            "locations": [],
            "gpe": []
        }
        
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                entities["persons"].append(ent.text)
            elif ent.label_ == "ORG":
                entities["organizations"].append(ent.text)
            elif ent.label_ == "GPE":
                entities["gpe"].append(ent.text)
            elif ent.label_ == "LOC":
                entities["locations"].append(ent.text)
        
        return entities
    
    def extract_skills(self, text: str) -> list:
        """Extract technical skills from text"""
        skills_keywords = [
            # Programming Languages
            "python", "java", "javascript", "c++", "c#", "ruby", "go", "rust", "swift", "kotlin",
            "php", "scala", "r", "matlab", "perl", "groovy", "typescript",
            # Web Technologies
            "html", "css", "react", "angular", "vue", "nodejs", "express", "django", "flask",
            "spring", "asp.net", "fastapi", "graphql", "rest", "api",
            # Databases
            "sql", "mysql", "postgresql", "mongodb", "oracle", "cassandra", "redis", "elasticsearch",
            # Cloud & DevOps
            "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "gitlab", "github",
            "terraform", "ansible", "git", "ci/cd",
            # Data & AI
            "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn",
            "nlp", "computer vision", "data analysis", "pandas", "numpy", "spark",
            # Other Tools
            "git", "jira", "agile", "scrum", "linux", "windows", "unix", "shell", "bash",
            "vim", "emacs", "vscode", "jupyter", "anaconda"
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in skills_keywords:
            if skill in text_lower:
                found_skills.append(skill)
        
        return list(set(found_skills))  # Remove duplicates
