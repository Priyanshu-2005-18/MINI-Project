from typing import Optional
import json
from datetime import datetime

class ResumeFormatter:
    """Format and standardize resume data"""
    
    @staticmethod
    def format_resume_for_export(resume_data: dict) -> str:
        """Format resume data as readable text"""
        output = []
        output.append("=" * 60)
        output.append("RESUME")
        output.append("=" * 60)
        
        # Personal Info
        if resume_data.get("personal_info"):
            output.append("\nCONTACT INFORMATION")
            output.append("-" * 40)
            for key, value in resume_data["personal_info"].items():
                output.append(f"{key.replace('_', ' ').title()}: {value}")
        
        # Education
        if resume_data.get("education"):
            output.append("\nEDUCATION")
            output.append("-" * 40)
            for edu in resume_data["education"]:
                output.append(f"• {edu}")
        
        # Experience
        if resume_data.get("experience"):
            output.append("\nEXPERIENCE")
            output.append("-" * 40)
            for exp in resume_data["experience"]:
                output.append(f"• {exp}")
        
        # Skills
        if resume_data.get("technical_skills"):
            output.append("\nTECHNICAL SKILLS")
            output.append("-" * 40)
            skills = ", ".join(resume_data["technical_skills"])
            output.append(skills)
        
        # Projects
        if resume_data.get("projects"):
            output.append("\nPROJECTS")
            output.append("-" * 40)
            for proj in resume_data["projects"]:
                output.append(f"• {proj}")
        
        return "\n".join(output)

class ReportGenerator:
    """Generate analysis reports"""
    
    @staticmethod
    def generate_analysis_report(analysis_data: dict, resume_name: str = None) -> str:
        """Generate detailed analysis report"""
        report = []
        report.append("=" * 70)
        report.append("RESUME ANALYSIS REPORT")
        report.append("=" * 70)
        
        if resume_name:
            report.append(f"\nResume: {resume_name}")
        
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Overall Score
        report.append("\n" + "-" * 70)
        report.append("OVERALL ANALYSIS")
        report.append("-" * 70)
        report.append(f"Overall Score: {analysis_data.get('overall_score', 0):.1f}%")
        report.append(f"Semantic Match: {analysis_data.get('semantic_match', 0):.1f}%")
        report.append(f"Keyword Match: {analysis_data.get('keyword_match', 0):.1f}%")
        
        # Skills Analysis
        report.append("\n" + "-" * 70)
        report.append("SKILLS ANALYSIS")
        report.append("-" * 70)
        
        if analysis_data.get("matched_skills"):
            report.append(f"\nMatched Skills ({len(analysis_data['matched_skills'])})")
            for skill in analysis_data["matched_skills"]:
                report.append(f"  ✓ {skill}")
        
        if analysis_data.get("missing_skills"):
            report.append(f"\nMissing Skills ({len(analysis_data['missing_skills'])})")
            for skill in analysis_data["missing_skills"]:
                report.append(f"  ✗ {skill}")
        
        if analysis_data.get("extra_skills"):
            report.append(f"\nExtra Skills ({len(analysis_data['extra_skills'])})")
            for skill in analysis_data["extra_skills"]:
                report.append(f"  + {skill}")
        
        # Recommendations
        if analysis_data.get("recommendations"):
            report.append("\n" + "-" * 70)
            report.append("RECOMMENDATIONS")
            report.append("-" * 70)
            for i, rec in enumerate(analysis_data["recommendations"], 1):
                report.append(f"{i}. {rec}")
        
        report.append("\n" + "=" * 70)
        
        return "\n".join(report)

class CSVExporter:
    """Export data to CSV format"""
    
    @staticmethod
    def export_analysis_results(results_list: list) -> str:
        """Export multiple analysis results to CSV"""
        csv_lines = []
        csv_lines.append("Resume,Overall Score,Semantic Match,Keyword Match,Matched Skills,Missing Skills")
        
        for result in results_list:
            matched_count = len(result.get("matched_skills", []))
            missing_count = len(result.get("missing_skills", []))
            
            line = f"{result.get('filename', 'N/A')},{result.get('overall_score', 0):.1f},{result.get('semantic_match', 0):.1f},{result.get('keyword_match', 0):.1f},{matched_count},{missing_count}"
            csv_lines.append(line)
        
        return "\n".join(csv_lines)
