import { Concept, Relationship, KnowledgeMap, CONCEPT_CATEGORIES as C } from '../utils/types.js';

// Built-in demo dataset. This is what powers the "Try Demo" experience and
// also feeds the mock AI provider so the app works with zero configuration.

function concept({
  id, name, category, explanation, keyPoints = [], formula = '', example = '',
  difficulty = 1, tags = [], subject = 'Electrostatics'
}) {
  return new Concept({ id, name, category, explanation, keyPoints, formula, example, difficulty, tags, subject });
}

const concepts = [
  // ── Root ────────────────────────────────────────────────────────────────
  concept({
    id: 'electrostatics',
    name: 'Electrostatics',
    category: C.ROOT,
    difficulty: 1,
    explanation:
      'Electrostatics is the branch of physics that studies electric charges at rest. It explains why a balloon sticks to a wall after you rub it, how lightning forms, and how capacitors store energy. Everything here builds on the idea that there are two kinds of electric charge that attract and repel each other.',
    keyPoints: [
      'Studies electric charges that are stationary (at rest).',
      'Two types of charge: positive and negative.',
      'Like charges repel, opposite charges attract.',
      'The force between charges is described by Coulomb\u2019s law.'
    ],
    example:
      'Rub a balloon on your hair, then hold it near small paper bits — they jump to the balloon. That is electrostatics at work: the balloon gained a charge and now attracts neutral paper.',
    tags: ['foundation', 'chapter']
  }),

  // ── Charge branch ───────────────────────────────────────────────────────
  concept({
    id: 'charge',
    name: 'Electric Charge',
    category: C.MAJOR,
    difficulty: 1,
    explanation:
      'Electric charge is a fundamental property of matter, like mass. It comes in two kinds — positive (protons) and negative (electrons). Charge is measured in coulombs (C) and is always conserved: it can move around but never be created or destroyed.',
    keyPoints: [
      'Charge is quantized: it comes in whole multiples of the elementary charge e = 1.6 × 10⁻¹⁹ C.',
      'Charge is conserved in every process.',
      'Like charges repel; unlike charges attract.',
      'Protons carry +e, electrons carry −e.'
    ],
    formula: 'q = n·e\nwhere n is an integer and e = 1.602 × 10⁻¹⁹ C (elementary charge).',
    example:
      'When you rub a glass rod with silk, electrons move from the glass to the silk. The glass becomes positively charged and the silk negatively — charge was transferred, not created.',
    difficulty: 1,
    tags: ['charge', 'foundation']
  }),
  concept({
    id: 'charge-types',
    name: 'Types of Charge',
    category: C.MINOR,
    difficulty: 1,
    explanation:
      'There are exactly two kinds of electric charge: positive and negative. This two-type model was established by Benjamin Franklin. Charging can happen by friction, conduction, or induction.',
    keyPoints: [
      'Positive charge: deficiency of electrons.',
      'Negative charge: excess of electrons.',
      'Friction: rubbing transfers electrons.',
      'Induction: charge redistributes without direct contact.'
    ],
    example:
      'Pull a wool sweater over your head: crackling sounds and hair standing up happen because rubbing transfers charge by friction.',
    difficulty: 1,
    tags: ['charge', 'basics']
  }),
  concept({
    id: 'charge-quantization',
    name: 'Charge Quantization',
    category: C.DETAIL,
    difficulty: 2,
    explanation:
      'Charge cannot exist in arbitrary amounts — it always appears as integer multiples of the elementary charge e. This idea, confirmed by Millikan\u2019s oil-drop experiment, is called quantization.',
    keyPoints: [
      'q = ne where n = 0, ±1, ±2, …',
      'Any observed charge is a whole-number multiple of e.',
      'Millikan measured the electron charge with oil drops.'
    ],
    formula: 'q = ne,  n ∈ ℤ',
    example:
      'A charged sphere carrying 3.2 × 10⁻¹⁹ C is exactly 2 × e — never a fraction like 1.5e.',
    difficulty: 2,
    tags: ['charge', 'advanced']
  }),

  // ── Electric field branch ───────────────────────────────────────────────
  concept({
    id: 'electric-field',
    name: 'Electric Field',
    category: C.MAJOR,
    difficulty: 2,
    explanation:
      'An electric field is a region around a charge where another charge would feel a force. Instead of "action at a distance", physics says a charge creates a field, and the field pushes other charges. We draw it with field lines.',
    keyPoints: [
      'Field strength E is force per unit charge.',
      'Units: newtons per coulomb (N/C) or volts per metre (V/m).',
      'Field lines point away from positive charge, toward negative.',
      'Density of lines shows field strength.'
    ],
    formula: 'E = F / q₀',
    example:
      'Stand under a power line: the field is strong near it and weakens as you move away. If a small test charge were placed there, the field would show how hard it gets pushed.',
    difficulty: 2,
    tags: ['field', 'core']
  }),
  concept({
    id: 'field-lines',
    name: 'Electric Field Lines',
    category: C.MINOR,
    difficulty: 2,
    explanation:
      'Field lines are a visual tool for mapping an electric field. They start on positive charges and end on negative charges, never cross, and their density indicates field magnitude.',
    keyPoints: [
      'Lines never cross.',
      'Spacing: closer lines = stronger field.',
      'Lines are perpendicular to conductor surfaces.',
      'Number of lines is proportional to charge magnitude.'
    ],
    example:
      'Iron filings sprinkled around a bar magnet line up along field lines — the same idea applies to electric fields around point charges.',
    difficulty: 2,
    tags: ['field', 'visualization']
  }),
  concept({
    id: 'field-point-charge',
    name: 'Field of a Point Charge',
    category: C.DETAIL,
    difficulty: 2,
    explanation:
      'For a single point charge, the field strength depends on the charge and the distance from it. It follows an inverse-square law, so the field drops quickly as you move away.',
    keyPoints: [
      'E = k·q / r² for a point charge.',
      'k ≈ 9 × 10⁹ N·m²/C² (Coulomb\u2019s constant).',
      'Field is radial: out of positive, into negative.',
      'Inverse-square dependence on distance r.'
    ],
    formula: 'E = k·q / r²',
    example:
      'Near a charged Van de Graaff dome, the field is intense; two metres away it has already weakened by a factor of four because of the 1/r² law.',
    difficulty: 3,
    tags: ['field', 'math']
  }),

  // ── Potential branch ────────────────────────────────────────────────────
  concept({
    id: 'electric-potential',
    name: 'Electric Potential',
    category: C.MAJOR,
    difficulty: 2,
    explanation:
      'Electric potential is the electric potential energy per unit charge at a point in a field. It tells you how much work it takes to bring a unit positive charge there. Measured in volts (V).',
    keyPoints: [
      'V = U / q, where U is potential energy.',
      '1 volt = 1 joule per coulomb.',
      'Potential is a scalar — easier to add than field vectors.',
      'Higher potential means "more uphill" for positive charge.'
    ],
    formula: 'V = U / q₀',
    example:
      'A 9 V battery means each coulomb of charge gains 9 joules of energy moving from the − terminal to the + terminal.',
    difficulty: 2,
    tags: ['potential', 'core']
  }),
  concept({
    id: 'voltage',
    name: 'Voltage',
    category: C.MINOR,
    difficulty: 1,
    explanation:
      'Voltage is the difference in electric potential between two points. It is what pushes charge through a circuit — think of it as electric "pressure". Measured in volts (V).',
    keyPoints: [
      'Voltage = potential difference between two points.',
      'Voltage drives current in a circuit.',
      'A battery\u2019s voltage tells how much energy it gives each coulomb.',
      'Voltmeters measure voltage across components.'
    ],
    formula: 'V = W / q  (work per unit charge)',
    example:
      'Water in a raised tank has pressure that pushes it through pipes. Voltage is like that pressure for electric charge.',
    difficulty: 1,
    tags: ['potential', 'circuits']
  }),
  concept({
    id: 'potential-point-charge',
    name: 'Potential of a Point Charge',
    category: C.DETAIL,
    difficulty: 2,
    explanation:
      'The potential due to a point charge falls off with distance (not as the square — just 1/r). It is positive around positive charges and negative around negative charges.',
    keyPoints: [
      'V = k·q / r for a point charge.',
      'Scalar quantity, so potentials add directly.',
      'V → 0 at infinite distance.',
      'Sign depends on the sign of q.'
    ],
    formula: 'V = k·q / r',
    example:
      'Two positive charges create a combined potential at the midpoint that is the sum of each one\u2019s contribution — no vector directions to worry about.',
    difficulty: 3,
    tags: ['potential', 'math']
  }),

  // ── Force & energy ──────────────────────────────────────────────────────
  concept({
    id: 'coulombs-law',
    name: 'Coulomb\u2019s Law',
    category: C.MAJOR,
    difficulty: 2,
    explanation:
      'Coulomb\u2019s law gives the force between two point charges. The force is proportional to the product of the charges and inversely proportional to the square of the distance between them.',
    keyPoints: [
      'F = k·q₁q₂ / r².',
      'Force acts along the line joining the charges.',
      'Attractive for opposite signs, repulsive for like signs.',
      'Analogy: the gravitational law, but with charge instead of mass.'
    ],
    formula: 'F = k · q₁ · q₂ / r²    (k ≈ 8.99 × 10⁹ N·m²/C²)',
    example:
      'Two balloons both rubbed on your hair repel each other because like charges push apart — the force between them is Coulomb\u2019s law in action.',
    difficulty: 2,
    tags: ['force', 'law']
  }),
  concept({
    id: 'potential-energy',
    name: 'Electric Potential Energy',
    category: C.MINOR,
    difficulty: 2,
    explanation:
      'A charge in an electric field stores potential energy, like a ball at the top of a hill. The energy of two charges is U = k·q₁q₂/r, and it converts to kinetic energy as charges move.',
    keyPoints: [
      'U = k·q₁q₂ / r for a pair of charges.',
      'Like charges have positive U (repelling, stored energy).',
      'Opposite charges have negative U (bound, energy released).',
      'Energy is conserved as charges move.'
    ],
    formula: 'U = k·q₁·q₂ / r',
    example:
      'Let a charged particle go in a field and it speeds up — its stored potential energy becomes kinetic energy, exactly like releasing a stretched spring.',
    difficulty: 2,
    tags: ['energy', 'force']
  }),
  concept({
    id: 'work-energy',
    name: 'Work-Energy in Fields',
    category: C.DETAIL,
    difficulty: 3,
    explanation:
      'Moving a charge through a field requires work against the field force. The work done equals the change in potential energy and relates directly to potential difference.',
    keyPoints: [
      'W = q·ΔV — work equals charge times potential change.',
      'Path independent for electrostatic fields (conservative).',
      'Work can be negative when the field does the pushing.'
    ],
    formula: 'W = q · (V_B − V_A)',
    example:
      'Carrying a positive charge from a low to a high potential point takes work — just like carrying a rock uphill takes energy, and it falls back on its own.',
    difficulty: 3,
    tags: ['energy', 'advanced']
  }),

  // ── Capacitance branch ──────────────────────────────────────────────────
  concept({
    id: 'capacitance',
    name: 'Capacitance',
    category: C.MAJOR,
    difficulty: 2,
    explanation:
      'Capacitance is a measure of how much charge a conductor (or capacitor) can store per volt of potential. A bigger capacitor holds more charge at the same voltage. Unit: farad (F).',
    keyPoints: [
      'C = Q / V — charge stored per volt.',
      '1 farad = 1 coulomb per volt.',
      'Capacitance depends on geometry and the dielectric.',
      'Capacitors store energy in their electric field.'
    ],
    formula: 'C = Q / V',
    example:
      'A camera flash stores energy in a capacitor, then dumps it in a bright burst — a big capacitance charges slowly but releases instantly.',
    difficulty: 2,
    tags: ['capacitor', 'core']
  }),
  concept({
    id: 'capacitors',
    name: 'Capacitors',
    category: C.MINOR,
    difficulty: 2,
    explanation:
      'A capacitor is a device that stores charge and energy. The simplest type is two parallel plates separated by an insulator (dielectric). Capacitors smooth power supplies and tune radios.',
    keyPoints: [
      'Parallel-plate capacitance: C = ε₀A/d.',
      'A dielectric increases capacitance by a factor κ.',
      'Capacitors block DC but pass AC.',
      'Energy stored: U = ½CV².'
    ],
    formula: 'C = ε₀·A / d     U = ½·C·V²',
    example:
      'Inside a smartphone, tiny capacitors keep the voltage steady so the processor gets clean power — they charge and discharge thousands of times per second.',
    difficulty: 3,
    tags: ['capacitor', 'devices']
  }),
  concept({
    id: 'dielectrics',
    name: 'Dielectrics',
    category: C.DETAIL,
    difficulty: 3,
    explanation:
      'A dielectric is an insulating material placed between capacitor plates. It reduces the field for a given charge, which raises capacitance by a factor equal to its dielectric constant κ.',
    keyPoints: [
      'κ (kappa) is the dielectric constant, always ≥ 1.',
      'Capacitance with dielectric: C = κ·C₀.',
      'Dielectrics allow higher voltages before breakdown.',
      'Polarization of molecules reduces internal field.'
    ],
    formula: 'C = κ · C₀',
    example:
      'Cable insulation is a dielectric — it does the double job of stopping current flow and increasing capacitance between the conductor and surroundings.',
    difficulty: 3,
    tags: ['capacitor', 'materials']
  }),

  // ── Circuits branch ─────────────────────────────────────────────────────
  concept({
    id: 'circuits',
    name: 'Circuits',
    category: C.MAJOR,
    difficulty: 1,
    explanation:
      'A circuit is a closed path that lets charge flow continuously. It needs a source of potential difference (battery), conductors (wires), and something that uses the energy (load).',
    keyPoints: [
      'Current flows only in a complete, closed loop.',
      'Conventional current flows from + to −.',
      'A switch breaks the loop and stops the current.',
      'Charge is conserved at every junction.'
    ],
    example:
      'Turn off a light switch and the loop opens — electrons stop moving and the bulb goes dark. Close it and the loop is complete again.',
    difficulty: 1,
    tags: ['circuits', 'core']
  }),
  concept({
    id: 'current',
    name: 'Electric Current',
    category: C.MINOR,
    difficulty: 1,
    explanation:
      'Current is the rate at which charge flows through a wire, measured in amperes (A). One ampere is one coulomb per second. It is the "flow" in the circuit.',
    keyPoints: [
      'I = Q / t — charge per time.',
      'Unit: ampere (A) = coulomb per second.',
      'Conventional current direction: + to − (opposite to electrons).',
      'Current is the same at every point in a series circuit.'
    ],
    formula: 'I = Q / t',
    example:
      'Water flowing through a hose is like current — the amount of water per second is the flow rate, just as coulombs per second is current.',
    difficulty: 1,
    tags: ['circuits', 'flow']
  }),
  concept({
    id: 'resistance',
    name: 'Resistance',
    category: C.MINOR,
    difficulty: 2,
    explanation:
      'Resistance is how strongly a material opposes the flow of current, measured in ohms (Ω). It depends on the material, length, cross-section, and temperature.',
    keyPoints: [
      'R = V / I (Ohm\u2019s law).',
      'Unit: ohm (Ω) = volt per ampere.',
      'Longer and thinner wires have more resistance.',
      'Metals have low resistance; insulators have very high.'
    ],
    formula: 'R = V / I    (Ohm\u2019s law)',
    example:
      'A long thin wire glows hot in a toaster because its resistance turns electrical energy into heat — resistors are how we control current.',
    difficulty: 2,
    tags: ['circuits', 'core']
  }),
  concept({
    id: 'ohms-law',
    name: 'Ohm\u2019s Law',
    category: C.MINOR,
    difficulty: 1,
    explanation:
      'Ohm\u2019s law relates voltage, current, and resistance in a circuit: the current through a resistor is directly proportional to the voltage across it, divided by the resistance.',
    keyPoints: [
      'V = I·R.',
      'Holds for ohmic materials (constant resistance).',
      'Three variables: know any two, find the third.',
      'Not every device obeys it (diodes, LEDs do not).'
    ],
    formula: 'V = I · R',
    example:
      'A 9 V battery across a 3 Ω resistor pushes a current of 3 A — larger voltage, more current; larger resistance, less current.',
    difficulty: 1,
    tags: ['circuits', 'law']
  }),
  concept({
    id: 'series-parallel',
    name: 'Series & Parallel',
    category: C.DETAIL,
    difficulty: 2,
    explanation:
      'Components can be wired in series (one path) or parallel (multiple paths). Series adds resistances; parallel reduces total resistance. This shapes how circuits behave.',
    keyPoints: [
      'Series: R_total = R₁ + R₂ + …, same current everywhere.',
      'Parallel: 1/R_total = 1/R₁ + 1/R₂ + …, same voltage across each.',
      'Fault in series stops the whole circuit.',
      'Parallel gives redundancy — Christmas lights stay on.'
    ],
    formula: 'R_series = R₁ + R₂    |    1/R_parallel = 1/R₁ + 1/R₂',
    example:
      'Old string lights went dark when one bulb died (series). Modern ones use parallel wiring so one burnt bulb does not black out the whole string.',
    difficulty: 2,
    tags: ['circuits', 'advanced']
  })
];

const relationships = [
  new Relationship({ id: 'r0', source: 'electrostatics', target: 'charge', label: 'introduces' }),
  new Relationship({ id: 'r1', source: 'electrostatics', target: 'electric-field', label: 'introduces' }),
  new Relationship({ id: 'r2', source: 'electrostatics', target: 'electric-potential', label: 'introduces' }),
  new Relationship({ id: 'r3', source: 'electrostatics', target: 'coulombs-law', label: 'governs' }),

  new Relationship({ id: 'r4', source: 'charge', target: 'charge-types', label: 'includes' }),
  new Relationship({ id: 'r5', source: 'charge', target: 'charge-quantization', label: 'property of' }),

  new Relationship({ id: 'r6', source: 'electric-field', target: 'field-lines', label: 'visualized by' }),
  new Relationship({ id: 'r7', source: 'electric-field', target: 'field-point-charge', label: 'computed as' }),
  new Relationship({ id: 'r8', source: 'charge', target: 'electric-field', label: 'creates' }),
  new Relationship({ id: 'r9', source: 'coulombs-law', target: 'electric-field', label: 'defined via' }),

  new Relationship({ id: 'r10', source: 'electric-potential', target: 'voltage', label: 'difference of' }),
  new Relationship({ id: 'r11', source: 'electric-potential', target: 'potential-point-charge', label: 'computed as' }),
  new Relationship({ id: 'r12', source: 'electric-field', target: 'electric-potential', label: 'related to' }),

  new Relationship({ id: 'r13', source: 'coulombs-law', target: 'potential-energy', label: 'implies' }),
  new Relationship({ id: 'r14', source: 'potential-energy', target: 'work-energy', label: 'enables' }),
  new Relationship({ id: 'r15', source: 'electric-potential', target: 'potential-energy', label: 'per unit charge' }),

  new Relationship({ id: 'r16', source: 'electric-potential', target: 'capacitance', label: 'defines' }),
  new Relationship({ id: 'r17', source: 'capacitance', target: 'capacitors', label: 'applied in' }),
  new Relationship({ id: 'r18', source: 'capacitors', target: 'dielectrics', label: 'uses' }),

  new Relationship({ id: 'r19', source: 'electrostatics', target: 'circuits', label: 'extends to' }),
  new Relationship({ id: 'r20', source: 'circuits', target: 'current', label: 'carries' }),
  new Relationship({ id: 'r21', source: 'circuits', target: 'resistance', label: 'opposed by' }),
  new Relationship({ id: 'r22', source: 'resistance', target: 'ohms-law', label: 'described by' }),
  new Relationship({ id: 'r23', source: 'voltage', target: 'current', label: 'drives' }),
  new Relationship({ id: 'r24', source: 'resistance', target: 'series-parallel', label: 'combines in' })
];

export function buildDemoMap() {
  return new KnowledgeMap({
    id: 'demo-electrostatics',
    title: 'Electrostatics',
    subject: 'Physics',
    source: 'demo',
    concepts,
    relationships,
    createdAt: Date.now(),
    mastery: {}
  });
}

export { concepts, relationships };