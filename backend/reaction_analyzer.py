"""
Reaction Analyzer - Advanced mistake detection and analysis
"""

import json
import logging
from typing import Dict, List, Tuple
from datetime import datetime
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class MistakePattern:
    """Pattern for detecting common chemistry mistakes"""
    pattern_id: str
    category: str
    severity: str
    description: str
    indicators: List[str]
    common_causes: List[str]
    corrections: List[str]
    learning_points: List[str]

class ReactionAnalyzer:
    """
    Advanced reaction analysis and mistake detection system
    Uses pattern matching and chemical logic to identify issues
    """
    
    def __init__(self):
        self.mistake_patterns = self._load_mistake_patterns()
        self.chemical_compatibility = self._load_compatibility_matrix()
        self.safety_rules = self._load_safety_rules()
        
    def _load_mistake_patterns(self) -> Dict[str, MistakePattern]:
        """Load common mistake patterns"""
        
        patterns = {
            "same_chemical": MistakePattern(
                pattern_id="same_chemical",
                category="selection_error",
                severity="low",
                description="Student selected the same chemical for both reactants",
                indicators=["identical_chemicals"],
                common_causes=[
                    "Misunderstanding of reaction requirements",
                    "Interface confusion",
                    "Lack of attention to selection"
                ],
                corrections=[
                    "Select two different chemicals",
                    "Review reaction requirements",
                    "Check chemical labels carefully"
                ],
                learning_points=[
                    "Chemical reactions require at least two different substances",
                    "Always verify your chemical selections",
                    "Read chemical formulas carefully"
                ]
            ),
            
            "incompatible_chemicals": MistakePattern(
                pattern_id="incompatible_chemicals",
                category="chemical_compatibility",
                severity="medium",
                description="Selected chemicals do not react under normal conditions",
                indicators=["no_reaction_expected", "inert_combination"],
                common_causes=[
                    "Insufficient knowledge of reactivity",
                    "Confusion about chemical properties",
                    "Random selection without consideration"
                ],
                corrections=[
                    "Choose chemicals that are known to react",
                    "Consider reactivity series for metals",
                    "Review acid-base combinations"
                ],
                learning_points=[
                    "Not all chemical combinations result in reactions",
                    "Reactivity series determines metal displacement reactions",
                    "Acid-base pairs typically react to form salt and water"
                ]
            ),
            
            "dangerous_combination": MistakePattern(
                pattern_id="dangerous_combination",
                category="safety_violation",
                severity="high",
                description="Selected combination poses significant safety risks",
                indicators=["explosive_potential", "toxic_gas_production", "violent_reaction"],
                common_causes=[
                    "Inadequate safety knowledge",
                    "Curiosity without proper precautions",
                    "Misunderstanding of chemical hazards"
                ],
                corrections=[
                    "Review safety data sheets",
                    "Consult instructor before proceeding",
                    "Use appropriate safety equipment",
                    "Consider safer alternatives"
                ],
                learning_points=[
                    "Safety must always be the top priority",
                    "Some reactions are too dangerous for educational settings",
                    "Always research chemical hazards before mixing",
                    "Professional supervision is required for dangerous reactions"
                ]
            ),
            
            "wrong_conditions": MistakePattern(
                pattern_id="wrong_conditions",
                category="procedural_error",
                severity="medium",
                description="Reaction conditions are inappropriate for the selected chemicals",
                indicators=["temperature_mismatch", "pressure_requirements", "catalyst_needed"],
                common_causes=[
                    "Incomplete understanding of reaction requirements",
                    "Overlooking necessary conditions",
                    "Assuming standard conditions work for all reactions"
                ],
                corrections=[
                    "Research required reaction conditions",
                    "Adjust temperature if necessary",
                    "Add required catalysts",
                    "Consider alternative reaction pathways"
                ],
                learning_points=[
                    "Many reactions require specific conditions to proceed",
                    "Temperature and pressure can dramatically affect reaction rates",
                    "Catalysts can enable reactions that wouldn't otherwise occur",
                    "Standard conditions don't work for all chemical reactions"
                ]
            ),
            
            "stoichiometry_error": MistakePattern(
                pattern_id="stoichiometry_error",
                category="quantitative_error",
                severity="medium",
                description="Incorrect proportions of reactants selected",
                indicators=["excess_reactant", "limiting_reagent_confusion"],
                common_causes=[
                    "Misunderstanding of balanced equations",
                    "Confusion about molar ratios",
                    "Inadequate calculation skills"
                ],
                corrections=[
                    "Balance the chemical equation first",
                    "Calculate required molar ratios",
                    "Identify limiting and excess reagents",
                    "Use stoichiometric calculations"
                ],
                learning_points=[
                    "Chemical equations must be balanced",
                    "Molar ratios determine product yields",
                    "Limiting reagents control reaction completion",
                    "Stoichiometry is fundamental to quantitative chemistry"
                ]
            )
        }
        
        return patterns
    
    def _load_compatibility_matrix(self) -> Dict:
        """Load chemical compatibility matrix"""
        
        return {
            # Acids with bases - generally compatible and reactive
            ("acid", "base"): {
                "compatible": True,
                "reaction_type": "neutralization",
                "safety_level": "safe_to_moderate",
                "products": ["salt", "water"]
            },
            
            # Metals with acids - reactive, hydrogen gas evolution
            ("metal", "acid"): {
                "compatible": True,
                "reaction_type": "single_displacement",
                "safety_level": "moderate",
                "products": ["salt", "hydrogen_gas"],
                "hazards": ["flammable_gas", "heat_generation"]
            },
            
            # Active metals with water - highly reactive
            ("active_metal", "water"): {
                "compatible": True,
                "reaction_type": "metal_water_reaction",
                "safety_level": "dangerous",
                "products": ["metal_hydroxide", "hydrogen_gas"],
                "hazards": ["explosive_reaction", "caustic_products", "fire_risk"]
            },
            
            # Noble metals with acids - generally unreactive
            ("noble_metal", "acid"): {
                "compatible": False,
                "reaction_type": "no_reaction",
                "safety_level": "safe",
                "reason": "Noble metals are unreactive with most acids"
            },
            
            # Incompatible combinations
            ("inert_gas", "any"): {
                "compatible": False,
                "reaction_type": "no_reaction",
                "safety_level": "safe",
                "reason": "Inert gases do not react under normal conditions"
            }
        }
    
    def _load_safety_rules(self) -> List[Dict]:
        """Load safety rules and restrictions"""
        
        return [
            {
                "rule_id": "no_explosive_combinations",
                "description": "Prevent combinations that could cause explosions",
                "forbidden_pairs": [
                    ("Na", "H2O"),  # Sodium + water can explode
                    ("K", "H2O"),   # Potassium + water is even more dangerous
                ],
                "severity": "critical",
                "action": "block_reaction"
            },
            
            {
                "rule_id": "toxic_gas_prevention",
                "description": "Prevent reactions that produce toxic gases",
                "warning_pairs": [
                    ("HCl", "bleach"),  # Produces chlorine gas
                    ("acid", "cyanide"), # Produces hydrogen cyanide
                ],
                "severity": "high",
                "action": "require_supervision"
            },
            
            {
                "rule_id": "corrosive_handling",
                "description": "Special precautions for corrosive substances",
                "chemical_classes": ["strong_acid", "strong_base"],
                "severity": "medium",
                "action": "require_ppe"
            }
        ]
    
    def analyze_mistake(self, mistake_type: str, chemicals: List[str], context: Dict) -> Dict:
        """
        Comprehensive mistake analysis using pattern matching and chemical logic
        """
        
        try:
            logger.info(f"Analyzing mistake: {mistake_type} with chemicals: {chemicals}")
            
            # Initialize analysis result
            analysis = {
                "mistake_type": mistake_type,
                "chemicals": chemicals,
                "category": "unknown",
                "severity": "low",
                "explanation": "",
                "alternatives": [],
                "learning_points": [],
                "safety_concerns": [],
                "corrective_actions": []
            }
            
            # Pattern-based analysis
            if mistake_type in self.mistake_patterns:
                pattern = self.mistake_patterns[mistake_type]
                analysis.update({
                    "category": pattern.category,
                    "severity": pattern.severity,
                    "explanation": pattern.description,
                    "learning_points": pattern.learning_points,
                    "corrective_actions": pattern.corrections
                })
            
            # Chemical-specific analysis
            chemical_analysis = self._analyze_chemical_combination(chemicals)
            analysis.update(chemical_analysis)
            
            # Safety assessment
            safety_analysis = self._assess_mistake_safety(chemicals, mistake_type)
            analysis["safety_concerns"] = safety_analysis["concerns"]
            
            # Generate alternatives
            alternatives = self._suggest_alternatives(chemicals, mistake_type, context)
            analysis["alternatives"] = alternatives
            
            # Context-specific adjustments
            if context.get("user_level") == "beginner":
                analysis["learning_points"] = self._simplify_learning_points(
                    analysis["learning_points"]
                )
            
            analysis["analysis_timestamp"] = datetime.now().isoformat()
            analysis["success"] = True
            
            return analysis
            
        except Exception as e:
            logger.error(f"Mistake analysis failed: {str(e)}")
            return {
                "error": str(e),
                "success": False,
                "mistake_type": mistake_type,
                "chemicals": chemicals
            }
    
    def _analyze_chemical_combination(self, chemicals: List[str]) -> Dict:
        """Analyze the specific chemical combination"""
        
        if len(chemicals) < 2:
            return {
                "combination_analysis": "Insufficient chemicals for reaction",
                "reactivity_assessment": "incomplete"
            }
        
        # Check for same chemical
        if len(set(chemicals)) == 1:
            return {
                "combination_analysis": "Same chemical selected twice - no reaction possible",
                "reactivity_assessment": "no_reaction",
                "specific_issue": "identical_reactants"
            }
        
        # Analyze chemical properties
        chem_a, chem_b = chemicals[0], chemicals[1]
        
        # Simplified chemical classification
        chemical_classes = self._classify_chemicals(chemicals)
        
        # Check compatibility
        compatibility = self._check_compatibility(chemical_classes)
        
        return {
            "combination_analysis": f"Combination of {chem_a} and {chem_b}",
            "chemical_classes": chemical_classes,
            "compatibility": compatibility,
            "reactivity_assessment": compatibility.get("reaction_type", "unknown")
        }
    
    def _classify_chemicals(self, chemicals: List[str]) -> Dict:
        """Classify chemicals into categories"""
        
        # Simplified classification based on common chemicals
        classifications = {
            "HCl": "strong_acid",
            "H2SO4": "strong_acid", 
            "HNO3": "strong_acid",
            "NaOH": "strong_base",
            "KOH": "strong_base",
            "Na": "active_metal",
            "K": "active_metal",
            "Mg": "reactive_metal",
            "Zn": "reactive_metal",
            "Cu": "less_reactive_metal",
            "Ag": "noble_metal",
            "Au": "noble_metal",
            "H2O": "water",
            "NaCl": "salt",
            "CuSO4": "salt"
        }
        
        result = {}
        for chemical in chemicals:
            result[chemical] = classifications.get(chemical, "unknown")
        
        return result
    
    def _check_compatibility(self, chemical_classes: Dict) -> Dict:
        """Check if chemicals are compatible for reaction"""
        
        classes = list(chemical_classes.values())
        
        # Check common compatible combinations
        if "strong_acid" in classes and "strong_base" in classes:
            return {
                "compatible": True,
                "reaction_type": "acid_base_neutralization",
                "safety_level": "safe",
                "expected_products": ["salt", "water"]
            }
        
        if ("active_metal" in classes or "reactive_metal" in classes) and "strong_acid" in classes:
            return {
                "compatible": True,
                "reaction_type": "metal_acid_reaction",
                "safety_level": "moderate",
                "expected_products": ["salt", "hydrogen_gas"],
                "hazards": ["flammable_gas"]
            }
        
        if "active_metal" in classes and "water" in classes:
            return {
                "compatible": True,
                "reaction_type": "metal_water_reaction",
                "safety_level": "dangerous",
                "expected_products": ["metal_hydroxide", "hydrogen_gas"],
                "hazards": ["explosive_reaction", "caustic_products"]
            }
        
        if "noble_metal" in classes:
            return {
                "compatible": False,
                "reaction_type": "no_reaction",
                "safety_level": "safe",
                "reason": "Noble metals are generally unreactive"
            }
        
        # Default case
        return {
            "compatible": False,
            "reaction_type": "unknown",
            "safety_level": "unknown",
            "reason": "Chemical combination not recognized"
        }
    
    def _assess_mistake_safety(self, chemicals: List[str], mistake_type: str) -> Dict:
        """Assess safety implications of the mistake"""
        
        concerns = []
        
        # Check against safety rules
        for rule in self.safety_rules:
            if rule["rule_id"] == "no_explosive_combinations":
                for pair in rule["forbidden_pairs"]:
                    if set(pair).issubset(set(chemicals)):
                        concerns.append({
                            "type": "explosive_risk",
                            "severity": "critical",
                            "description": f"Combination of {pair[0]} and {pair[1]} can cause explosions"
                        })
        
        # Check for toxic gas production
        if any("acid" in self._classify_chemicals([chem]).get(chem, "") for chem in chemicals):
            concerns.append({
                "type": "gas_evolution",
                "severity": "medium",
                "description": "Reaction may produce gases - ensure proper ventilation"
            })
        
        # Check for corrosive materials
        corrosive_chemicals = ["HCl", "H2SO4", "NaOH", "KOH"]
        if any(chem in corrosive_chemicals for chem in chemicals):
            concerns.append({
                "type": "corrosive_hazard",
                "severity": "medium",
                "description": "Corrosive chemicals require proper PPE and handling"
            })
        
        return {"concerns": concerns}
    
    def _suggest_alternatives(self, chemicals: List[str], mistake_type: str, context: Dict) -> List[Dict]:
        """Suggest alternative chemical combinations"""
        
        alternatives = []
        
        if mistake_type == "same_chemical":
            # Suggest different chemicals that react with the selected one
            selected_chem = chemicals[0] if chemicals else None
            
            if selected_chem == "HCl":
                alternatives.extend([
                    {
                        "chemicals": ["HCl", "NaOH"],
                        "reaction_type": "acid_base_neutralization",
                        "safety_level": "safe",
                        "description": "Classic acid-base neutralization"
                    },
                    {
                        "chemicals": ["HCl", "Mg"],
                        "reaction_type": "metal_acid_reaction", 
                        "safety_level": "moderate",
                        "description": "Metal displacement with hydrogen gas evolution"
                    }
                ])
            
            elif selected_chem == "NaOH":
                alternatives.extend([
                    {
                        "chemicals": ["NaOH", "HCl"],
                        "reaction_type": "acid_base_neutralization",
                        "safety_level": "safe",
                        "description": "Neutralization producing salt and water"
                    }
                ])
        
        elif mistake_type == "incompatible_chemicals":
            # Suggest compatible alternatives
            alternatives.extend([
                {
                    "chemicals": ["HCl", "NaOH"],
                    "reaction_type": "acid_base_neutralization",
                    "safety_level": "safe",
                    "description": "Reliable acid-base reaction"
                },
                {
                    "chemicals": ["Mg", "HCl"],
                    "reaction_type": "metal_acid_reaction",
                    "safety_level": "moderate", 
                    "description": "Visible hydrogen gas production"
                }
            ])
        
        elif mistake_type == "dangerous_combination":
            # Suggest safer alternatives with similar educational value
            alternatives.extend([
                {
                    "chemicals": ["Mg", "HCl"],
                    "reaction_type": "metal_acid_reaction",
                    "safety_level": "moderate",
                    "description": "Safer metal-acid reaction with visible effects"
                },
                {
                    "chemicals": ["NaHCO3", "CH3COOH"],
                    "reaction_type": "acid_carbonate_reaction",
                    "safety_level": "safe",
                    "description": "Safe reaction with visible gas evolution"
                }
            ])
        
        return alternatives
    
    def _simplify_learning_points(self, learning_points: List[str]) -> List[str]:
        """Simplify learning points for beginner users"""
        
        simplified = []
        for point in learning_points:
            # Remove complex terminology and focus on basic concepts
            if "stoichiometry" in point.lower():
                simplified.append("Chemical equations must be balanced - equal atoms on both sides")
            elif "thermodynamic" in point.lower():
                simplified.append("Some reactions release heat, others absorb heat")
            elif "kinetic" in point.lower():
                simplified.append("Reactions happen at different speeds")
            else:
                simplified.append(point)
        
        return simplified
    
    def detect_gesture_mistakes(self, gesture_data: Dict) -> List[Dict]:
        """Detect mistakes in hand gestures and movements"""
        
        mistakes = []
        
        # Check for excessive hand speed
        if gesture_data.get("hand_speed", 0) > 0.5:  # Threshold for "too fast"
            mistakes.append({
                "type": "excessive_speed",
                "severity": "medium",
                "description": "Hands moving too quickly - may indicate unsafe handling",
                "recommendation": "Slow down movements for better control and safety"
            })
        
        # Check for hand shaking
        if gesture_data.get("hand_shake", 0) > 0.3:  # Threshold for "shaking"
            mistakes.append({
                "type": "hand_instability",
                "severity": "low",
                "description": "Hand movements appear unsteady",
                "recommendation": "Take a moment to steady your hands before proceeding"
            })
        
        # Check for improper distance
        hand_distance = gesture_data.get("hand_distance", 1.0)
        if hand_distance < 0.1:  # Too close
            mistakes.append({
                "type": "hands_too_close",
                "severity": "medium",
                "description": "Hands are very close together - reaction may trigger accidentally",
                "recommendation": "Maintain safe distance until ready to mix chemicals"
            })
        
        return mistakes
    
    def health_check(self) -> Dict:
        """Health check for reaction analyzer"""
        return {
            "status": "healthy",
            "mistake_patterns_loaded": len(self.mistake_patterns),
            "safety_rules_loaded": len(self.safety_rules),
            "last_check": datetime.now().isoformat()
        }