// Minimal syllabus + sample content. Extend this file to add the full syllabus.
window.DUO_DATA = {
  syllabus: [
    { id: "chem1", title: "Chemical Reactions & Equations", crownTarget: 3, units: [
      { id: "chem1-u1", title: "Basics & Types", items: [
        { type: "mcq", q: "Which law balances chemical equations?", options: ["Law of Constant Proportions", "Law of Conservation of Mass", "Boyle's Law", "Avogadro's Law"], answer: 1, explain: "Mass is conserved; atoms are neither created nor destroyed." },
        { type: "fill", q: "Magnesium burns in air to form ____ oxide.", answer: "magnesium", explain: "Burning Mg forms magnesium oxide (MgO)." },
        { type: "tf", q: "Aqueous solutions are always acidic.", answer: false, explain: "They can be acidic, basic, or neutral." },
        { type: "match", q: "Match reaction type to example", pairs: [
          ["Combination", "2H2 + O2 → 2H2O"],
          ["Decomposition", "CaCO3 → CaO + CO2"],
          ["Displacement", "Zn + CuSO4 → ZnSO4 + Cu"]
        ], explain: "Identify patterns in reaction types." }
      ]},
      { id: "chem1-u2", title: "Balancing Equations", items: [
        { type: "mcq", q: "Balance: Fe + O2 → Fe2O3. Coefficient of O2?", options: ["1", "2", "3", "4"], answer: 2, explain: "4Fe + 3O2 → 2Fe2O3 (O2 coefficient is 3)." },
        { type: "fill", q: "Na + Cl2 → ____ (balanced product formula)", answer: "2NaCl", explain: "2Na + Cl2 → 2NaCl." },
        { type: "tf", q: "Balancing changes the chemical formulas.", answer: false, explain: "You change only coefficients, not formulas." }
      ]}
    ]},
    { id: "bio1", title: "Life Processes", crownTarget: 3, units: [
      { id: "bio1-u1", title: "Nutrition", items: [
        { type: "mcq", q: "Site of photosynthesis?", options: ["Mitochondria", "Ribosome", "Chloroplast", "Golgi body"], answer: 2, explain: "Chloroplast contains chlorophyll." },
        { type: "fill", q: "The functional unit of kidney is ____.", answer: "nephron", explain: "Nephron filters blood and forms urine." },
        { type: "tf", q: "Amylase digests starch.", answer: true, explain: "Salivary amylase breaks down starch." }
      ]},
      { id: "bio1-u2", title: "Respiration & Transport", items: [
        { type: "mcq", q: "Main respiratory pigment in humans?", options: ["Chlorophyll", "Hemoglobin", "Myoglobin", "Keratin"], answer: 1, explain: "Hemoglobin carries O2 in RBCs." },
        { type: "match", q: "Match part to function", pairs: [
          ["Alveoli", "Gas exchange"],
          ["Xylem", "Water transport in plants"],
          ["Vena cava", "Returns blood to heart"]
        ], explain: "Structure relates to function." }
      ]}
    ]},
    { id: "phys1", title: "Light: Reflection & Refraction", crownTarget: 3, units: [
      { id: "phys1-u1", title: "Mirror basics", items: [
        { type: "mcq", q: "Mirror with inward curved reflecting surface?", options: ["Plane", "Convex", "Concave", "Cylindrical"], answer: 2, explain: "Concave mirrors converge light." },
        { type: "fill", q: "Refractive index n = c/____.", answer: "v", explain: "n = speed of light in vacuum (c) divided by speed in medium (v)." }
      ]}
    ]}
  ]
};
