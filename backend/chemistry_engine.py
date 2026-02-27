"""
Advanced Chemistry Logic Engine
Handles complex chemical calculations, reaction predictions, and property analysis
"""

import json
import math
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import numpy as np
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class ChemicalProperties:
    """Chemical properties data structure"""
    formula: str
    molar_mass: float
    density: Optional[float]
    melting_point: Optional[float]
    boiling_point: Optional[float]
    ph: Optional[float]
    solubility: str
    reactivity_series_position: Optional[int]
    electron_configuration: str
    oxidation_states: List[int]
    hazard_level: str

@dataclass
class ReactionData:
    """Reaction analysis results"""
    reactants: List[str]
    products: List[str]
    balanced_equation: str
    reaction_type: str
    enthalpy_change: Optional[float]
    entropy_change: Optional[float]
    gibbs_free_energy: Optional[float]
    equilibrium_constant: Optional[float]
    rate_constant: Optional[float]
    activation_energy: Optional[float]
    ph_change: Optional[float]
    gas_evolution: bool
    precipitate_formation: bool
    color_change: Optional[str]
    temperature_change: str
    safety_level: str

class ChemistryEngine:
    """
    Advanced chemistry computation engine with thermodynamics,
    kinetics, and reaction prediction capabilities
    """
    
    def __init__(self):
        self.chemical_database = self._load_chemical_database()
        self.reaction_patterns = self._load_reaction_patterns()
        self.thermodynamic_data = self._load_thermodynamic_data()
        self.kinetic_data = self._load_kinetic_data()
        
    def _load_chemical_database(self) -> Dict:
        """Load enhanced chemical database with computed properties"""
        return {
            "HCl": ChemicalProperties(
                formula="HCl",
                molar_mass=36.458,
                density=1.18,
                melting_point=-114.22,
                boiling_point=-85.05,
                ph=1.0,
                solubility="highly_soluble",
                reactivity_series_position=None,
                electron_configuration="1s² 2s² 2p⁶ 3s² 3p⁵",
                oxidation_states=[-1, +1],
                hazard_level="corrosive"
            ),
            "NaOH": ChemicalProperties(
                formula="NaOH",
                molar_mass=39.997,
                density=2.13,
                melting_point=318,
                boiling_point=1388,
                ph=14.0,
                solubility="highly_soluble",
                reactivity_series_position=None,
                electron_configuration="[Ne] 3s¹",
                oxidation_states=[+1],
                hazard_level="corrosive"
            ),
            "Na": ChemicalProperties(
                formula="Na",
                molar_mass=22.990,
                density=0.968,
                melting_point=97.72,
                boiling_point=883,
                ph=None,
                solubility="reacts_violently",
                reactivity_series_position=1,
                electron_configuration="[Ne] 3s¹",
                oxidation_states=[+1],
                hazard_level="dangerous"
            ),
            "H2O": ChemicalProperties(
                formula="H₂O",
                molar_mass=18.015,
                density=1.0,
                melting_point=0,
                boiling_point=100,
                ph=7.0,
                solubility="universal_solvent",
                reactivity_series_position=None,
                electron_configuration="1s² (H), 1s² 2s² 2p⁴ (O)",
                oxidation_states=[-2, +1],
                hazard_level="safe"
            ),
            # Add more chemicals as needed
        }
    
    def _load_reaction_patterns(self) -> Dict:
        """Load reaction pattern recognition rules"""
        return {
            "acid_base": {
                "pattern": "acid + base → salt + water",
                "indicators": ["ph_neutralization", "salt_formation", "water_formation"],
                "energy_profile": "exothermic",
                "typical_enthalpy": -57.3  # kJ/mol for strong acid + strong base
            },
            "single_displacement": {
                "pattern": "A + BC → AC + B",
                "indicators": ["metal_displacement", "reactivity_series"],
                "energy_profile": "variable",
                "typical_enthalpy": None
            },
            "double_displacement": {
                "pattern": "AB + CD → AD + CB",
                "indicators": ["precipitation", "gas_evolution", "neutralization"],
                "energy_profile": "variable",
                "typical_enthalpy": None
            },
            "decomposition": {
                "pattern": "AB → A + B",
                "indicators": ["catalyst_required", "heat_required", "gas_evolution"],
                "energy_profile": "endothermic",
                "typical_enthalpy": None
            }
        }
    
    def _load_thermodynamic_data(self) -> Dict:
        """Load thermodynamic constants and data"""
        return {
            "standard_conditions": {"temperature": 298.15, "pressure": 101325},
            "gas_constant": 8.314,  # J/(mol·K)
            "avogadro_number": 6.022e23,
            "formation_enthalpies": {
                "HCl(aq)": -167.2,  # kJ/mol
                "NaOH(aq)": -469.15,
                "NaCl(aq)": -407.27,
                "H2O(l)": -285.83,
                "Na(s)": 0,
                "H2(g)": 0
            },
            "entropies": {
                "HCl(aq)": 56.5,  # J/(mol·K)
                "NaOH(aq)": 48.1,
                "NaCl(aq)": 115.5,
                "H2O(l)": 69.91
            }
        }
    
    def _load_kinetic_data(self) -> Dict:
        """Load kinetic parameters and rate constants"""
        return {
            "activation_energies": {
                "acid_base_neutralization": 0,  # Very fast, no significant barrier
                "metal_water_reaction": 50,  # kJ/mol
                "metal_acid_reaction": 30
            },
            "rate_constants": {
                "HCl_NaOH": 1e11,  # Very fast reaction
                "Na_H2O": 1e8,     # Fast but dangerous
                "Mg_HCl": 1e5      # Moderate speed
            }
        }
    
    def analyze_reaction(self, chem_a: str, chem_b: str, conditions: Dict = None) -> Dict:
        """
        Comprehensive reaction analysis using advanced chemistry principles
        """
        if conditions is None:
            conditions = {}
            
        try:
            # Get chemical properties
            props_a = self.chemical_database.get(chem_a)
            props_b = self.chemical_database.get(chem_b)
            
            if not props_a or not props_b:
                return self._handle_unknown_chemicals(chem_a, chem_b)
            
            # Determine reaction type
            reaction_type = self._determine_reaction_type(props_a, props_b)
            
            # Calculate thermodynamics
            thermodynamics = self._calculate_thermodynamics(chem_a, chem_b, reaction_type)
            
            # Calculate kinetics
            kinetics = self._calculate_kinetics(chem_a, chem_b, reaction_type, conditions)
            
            # Predict products
            products = self._predict_products(chem_a, chem_b, reaction_type)
            
            # Balance equation
            balanced_equation = self._balance_equation(chem_a, chem_b, products)
            
            # Assess safety
            safety_assessment = self._assess_reaction_safety(props_a, props_b, thermodynamics)
            
            # Calculate pH changes
            ph_analysis = self._calculate_ph_changes(chem_a, chem_b, products)
            
            return {
                "reactants": [chem_a, chem_b],
                "products": products,
                "balanced_equation": balanced_equation,
                "reaction_type": reaction_type,
                "thermodynamics": thermodynamics,
                "kinetics": kinetics,
                "safety_assessment": safety_assessment,
                "ph_analysis": ph_analysis,
                "visual_indicators": self._predict_visual_changes(chem_a, chem_b, products),
                "educational_notes": self._generate_educational_notes(reaction_type, thermodynamics),
                "computed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Reaction analysis failed: {str(e)}")
            return {"error": str(e), "success": False}
    
    def _determine_reaction_type(self, props_a: ChemicalProperties, props_b: ChemicalProperties) -> str:
        """Determine reaction type based on chemical properties"""
        
        # Acid-Base reactions
        if (props_a.ph is not None and props_a.ph < 7) and (props_b.ph is not None and props_b.ph > 7):
            return "acid_base_neutralization"
        if (props_a.ph is not None and props_a.ph > 7) and (props_b.ph is not None and props_b.ph < 7):
            return "acid_base_neutralization"
        
        # Metal-Water reactions
        if props_a.reactivity_series_position is not None and props_b.formula == "H₂O":
            return "metal_water_reaction"
        if props_b.reactivity_series_position is not None and props_a.formula == "H₂O":
            return "metal_water_reaction"
        
        # Metal-Acid reactions
        if (props_a.reactivity_series_position is not None and 
            props_b.ph is not None and props_b.ph < 7):
            return "metal_acid_reaction"
        if (props_b.reactivity_series_position is not None and 
            props_a.ph is not None and props_a.ph < 7):
            return "metal_acid_reaction"
        
        # Default to general combination
        return "combination_reaction"
    
    def _calculate_thermodynamics(self, chem_a: str, chem_b: str, reaction_type: str) -> Dict:
        """Calculate thermodynamic properties of the reaction"""
        
        formation_enthalpies = self.thermodynamic_data["formation_enthalpies"]
        
        # Simplified calculation for demonstration
        if reaction_type == "acid_base_neutralization":
            delta_h = -57.3  # Standard neutralization enthalpy
            delta_s = -80.0  # Typical entropy change
        elif reaction_type == "metal_water_reaction":
            delta_h = -200.0  # Highly exothermic
            delta_s = 50.0   # Gas evolution increases entropy
        else:
            delta_h = -50.0  # Default exothermic
            delta_s = 0.0
        
        # Calculate Gibbs free energy: ΔG = ΔH - TΔS
        temperature = 298.15  # Standard temperature
        delta_g = delta_h - (temperature * delta_s / 1000)
        
        # Calculate equilibrium constant: K = exp(-ΔG/RT)
        R = 8.314e-3  # kJ/(mol·K)
        K_eq = math.exp(-delta_g / (R * temperature)) if delta_g != 0 else 1e10
        
        return {
            "enthalpy_change": delta_h,
            "entropy_change": delta_s,
            "gibbs_free_energy": delta_g,
            "equilibrium_constant": K_eq,
            "spontaneous": delta_g < 0,
            "temperature_effect": "exothermic" if delta_h < 0 else "endothermic"
        }
    
    def _calculate_kinetics(self, chem_a: str, chem_b: str, reaction_type: str, conditions: Dict) -> Dict:
        """Calculate reaction kinetics and rate information"""
        
        # Get activation energy
        activation_energies = self.kinetic_data["activation_energies"]
        Ea = activation_energies.get(reaction_type, 50.0)  # Default 50 kJ/mol
        
        # Temperature effect on rate (Arrhenius equation)
        temperature = conditions.get("temperature", 298.15)
        R = 8.314e-3  # kJ/(mol·K)
        
        # Rate constant calculation: k = A * exp(-Ea/RT)
        A = 1e12  # Pre-exponential factor (assumed)
        k = A * math.exp(-Ea / (R * temperature))
        
        # Reaction rate categories
        if k > 1e8:
            rate_category = "very_fast"
        elif k > 1e5:
            rate_category = "fast"
        elif k > 1e2:
            rate_category = "moderate"
        else:
            rate_category = "slow"
        
        return {
            "activation_energy": Ea,
            "rate_constant": k,
            "rate_category": rate_category,
            "temperature_dependence": "increases_with_temperature" if Ea > 0 else "temperature_independent",
            "half_life": math.log(2) / k if k > 0 else float('inf')
        }
    
    def _predict_products(self, chem_a: str, chem_b: str, reaction_type: str) -> List[str]:
        """Predict reaction products based on reaction type"""
        
        product_rules = {
            "acid_base_neutralization": {
                ("HCl", "NaOH"): ["NaCl", "H₂O"],
                ("H₂SO₄", "NaOH"): ["Na₂SO₄", "H₂O"],
            },
            "metal_water_reaction": {
                ("Na", "H₂O"): ["NaOH", "H₂"],
                ("Mg", "H₂O"): ["Mg(OH)₂", "H₂"],
            },
            "metal_acid_reaction": {
                ("Mg", "HCl"): ["MgCl₂", "H₂"],
                ("Zn", "HCl"): ["ZnCl₂", "H₂"],
            }
        }
        
        # Try both orders of reactants
        key1 = (chem_a, chem_b)
        key2 = (chem_b, chem_a)
        
        if reaction_type in product_rules:
            if key1 in product_rules[reaction_type]:
                return product_rules[reaction_type][key1]
            elif key2 in product_rules[reaction_type]:
                return product_rules[reaction_type][key2]
        
        # Default prediction
        return ["Product_A", "Product_B"]
    
    def _balance_equation(self, chem_a: str, chem_b: str, products: List[str]) -> str:
        """Generate balanced chemical equation"""
        
        # Simplified balancing - in practice, this would use matrix algebra
        equation_map = {
            ("HCl", "NaOH", ["NaCl", "H₂O"]): "HCl + NaOH → NaCl + H₂O",
            ("Na", "H₂O", ["NaOH", "H₂"]): "2Na + 2H₂O → 2NaOH + H₂",
            ("Mg", "HCl", ["MgCl₂", "H₂"]): "Mg + 2HCl → MgCl₂ + H₂",
        }
        
        # Try to find exact match
        key = (chem_a, chem_b, products)
        if key in equation_map:
            return equation_map[key]
        
        # Try reverse order
        key_reverse = (chem_b, chem_a, products)
        if key_reverse in equation_map:
            return equation_map[key_reverse]
        
        # Default format
        return f"{chem_a} + {chem_b} → {' + '.join(products)}"
    
    def _assess_reaction_safety(self, props_a: ChemicalProperties, props_b: ChemicalProperties, thermodynamics: Dict) -> Dict:
        """Comprehensive safety assessment"""
        
        hazard_levels = {"safe": 1, "moderate": 2, "corrosive": 3, "dangerous": 4}
        
        # Base hazard from chemicals
        hazard_a = hazard_levels.get(props_a.hazard_level, 2)
        hazard_b = hazard_levels.get(props_b.hazard_level, 2)
        base_hazard = max(hazard_a, hazard_b)
        
        # Thermodynamic contribution
        enthalpy = thermodynamics.get("enthalpy_change", 0)
        if enthalpy < -100:  # Highly exothermic
            thermal_hazard = 2
        elif enthalpy < -50:
            thermal_hazard = 1
        else:
            thermal_hazard = 0
        
        total_hazard = base_hazard + thermal_hazard
        
        if total_hazard <= 2:
            safety_level = "safe"
            risk_color = "green"
        elif total_hazard <= 4:
            safety_level = "moderate"
            risk_color = "yellow"
        else:
            safety_level = "dangerous"
            risk_color = "red"
        
        return {
            "safety_level": safety_level,
            "risk_color": risk_color,
            "hazard_score": total_hazard,
            "thermal_hazard": thermal_hazard > 0,
            "chemical_hazards": [props_a.hazard_level, props_b.hazard_level],
            "required_ppe": self._determine_ppe(safety_level),
            "precautions": self._generate_precautions(safety_level, thermodynamics)
        }
    
    def _calculate_ph_changes(self, chem_a: str, chem_b: str, products: List[str]) -> Dict:
        """Calculate pH changes during reaction"""
        
        props_a = self.chemical_database.get(chem_a)
        props_b = self.chemical_database.get(chem_b)
        
        if not props_a or not props_b:
            return {"initial_ph": 7.0, "final_ph": 7.0, "ph_change": 0.0}
        
        # Simplified pH calculation
        initial_ph = 7.0
        if props_a.ph is not None and props_b.ph is not None:
            # Rough average for mixed solution
            initial_ph = (props_a.ph + props_b.ph) / 2
        elif props_a.ph is not None:
            initial_ph = props_a.ph
        elif props_b.ph is not None:
            initial_ph = props_b.ph
        
        # Final pH depends on products
        final_ph = 7.0  # Assume neutralization for simplicity
        
        return {
            "initial_ph": initial_ph,
            "final_ph": final_ph,
            "ph_change": final_ph - initial_ph,
            "litmus_color": self._get_litmus_color(final_ph)
        }
    
    def _get_litmus_color(self, ph: float) -> str:
        """Determine litmus paper color based on pH"""
        if ph < 5:
            return "red"
        elif ph < 7:
            return "orange"
        elif ph == 7:
            return "purple"
        elif ph < 10:
            return "light_blue"
        else:
            return "blue"
    
    def _predict_visual_changes(self, chem_a: str, chem_b: str, products: List[str]) -> Dict:
        """Predict visual changes during reaction"""
        return {
            "color_change": "solution_turns_clear",
            "gas_evolution": "H₂" in products,
            "precipitate_formation": any("Cl" in p and p != "HCl" for p in products),
            "temperature_change": "increases",
            "bubbling": "H₂" in products,
            "smoke_formation": False
        }
    
    def _generate_educational_notes(self, reaction_type: str, thermodynamics: Dict) -> List[str]:
        """Generate educational content about the reaction"""
        notes = []
        
        if reaction_type == "acid_base_neutralization":
            notes.append("This is a neutralization reaction between an acid and a base.")
            notes.append("The products are always a salt and water.")
            notes.append("The reaction is typically exothermic, releasing heat.")
        
        if thermodynamics.get("spontaneous", False):
            notes.append("This reaction is thermodynamically favorable and will proceed spontaneously.")
        
        enthalpy = thermodynamics.get("enthalpy_change", 0)
        if enthalpy < 0:
            notes.append(f"The reaction releases {abs(enthalpy):.1f} kJ/mol of energy as heat.")
        
        return notes
    
    def _determine_ppe(self, safety_level: str) -> List[str]:
        """Determine required personal protective equipment"""
        ppe_requirements = {
            "safe": ["safety_glasses"],
            "moderate": ["safety_glasses", "gloves", "lab_coat"],
            "dangerous": ["safety_glasses", "gloves", "lab_coat", "fume_hood", "face_shield"]
        }
        return ppe_requirements.get(safety_level, ["safety_glasses"])
    
    def _generate_precautions(self, safety_level: str, thermodynamics: Dict) -> List[str]:
        """Generate safety precautions"""
        precautions = []
        
        if safety_level in ["moderate", "dangerous"]:
            precautions.append("Ensure adequate ventilation")
            precautions.append("Have emergency shower and eyewash station accessible")
        
        if thermodynamics.get("enthalpy_change", 0) < -100:
            precautions.append("Reaction may generate significant heat - use cooling bath if necessary")
        
        if safety_level == "dangerous":
            precautions.append("Never perform this reaction without supervision")
            precautions.append("Have fire extinguisher readily available")
        
        return precautions
    
    def _handle_unknown_chemicals(self, chem_a: str, chem_b: str) -> Dict:
        """Handle cases where chemicals are not in database"""
        return {
            "error": f"Unknown chemicals: {chem_a}, {chem_b}",
            "suggestion": "Please check chemical formulas and try again",
            "success": False
        }
    
    def predict_reaction_outcome(self, chem_a: str, chem_b: str, conditions: Dict) -> Dict:
        """Use ML-like prediction for unknown reactions"""
        # This would integrate with actual ML models in production
        confidence = 0.75  # Simulated confidence
        
        return {
            "predicted_products": ["Unknown_Product_1", "Unknown_Product_2"],
            "confidence": confidence,
            "prediction_method": "pattern_matching",
            "similar_reactions": [],
            "uncertainties": ["Product stoichiometry", "Reaction conditions"]
        }
    
    def generate_educational_content(self, reaction_data: Dict, user_level: str) -> Dict:
        """Generate level-appropriate educational content"""
        
        if user_level == "student":
            return {
                "key_concepts": ["Chemical equations", "Conservation of mass", "Safety"],
                "learning_objectives": [
                    "Understand how chemicals react",
                    "Recognize safety hazards",
                    "Balance chemical equations"
                ],
                "real_world_applications": [
                    "Industrial processes",
                    "Environmental chemistry",
                    "Everyday chemical reactions"
                ]
            }
        elif user_level == "advanced":
            return {
                "thermodynamic_analysis": reaction_data.get("thermodynamics", {}),
                "kinetic_analysis": reaction_data.get("kinetics", {}),
                "mechanism_details": "Detailed reaction mechanism would be provided",
                "research_applications": "Current research applications in this area"
            }
        
        return {"content": "Basic reaction information"}
    
    def get_enhanced_database(self) -> Dict:
        """Return enhanced chemical database with computed properties"""
        return {
            "chemicals": {k: v.__dict__ for k, v in self.chemical_database.items()},
            "reactions": self.reaction_patterns,
            "computed_properties": {
                "thermodynamic_data": self.thermodynamic_data,
                "kinetic_data": self.kinetic_data
            },
            "last_updated": datetime.now().isoformat()
        }
    
    def health_check(self) -> Dict:
        """Health check for chemistry engine"""
        return {
            "status": "healthy",
            "chemicals_loaded": len(self.chemical_database),
            "reaction_patterns": len(self.reaction_patterns),
            "last_check": datetime.now().isoformat()
        }