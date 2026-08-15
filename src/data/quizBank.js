import { QUIZ_TYPES as T } from '../utils/types.js';

// Question bank used by the mock AI provider for quiz generation.
// Each entry targets a concept id so weak-concept detection maps cleanly.

export const quizBank = [
  // Charge
  {
    conceptId: 'charge',
    type: T.MULTIPLE_CHOICE,
    question: 'What are the two kinds of electric charge?',
    options: ['Positive and neutral', 'Positive and negative', 'Negative and neutral', 'North and south'],
    answer: 1,
    explanation: 'There are exactly two kinds of electric charge: positive and negative. Like charges repel, unlike charges attract.'
  },
  {
    conceptId: 'charge',
    type: T.TRUE_FALSE,
    question: 'Electric charge is always conserved in any process.',
    options: ['True', 'False'],
    answer: 0,
    explanation: 'Charge is conserved — it can be transferred from one object to another but never created or destroyed.'
  },
  {
    conceptId: 'charge',
    type: T.SHORT_ANSWER,
    question: 'What unit is electric charge measured in?',
    answer: ['coulomb', 'coulombs', 'C'],
    explanation: 'Electric charge is measured in coulombs (C). One coulomb is the charge carried by about 6.24 × 10¹⁸ electrons.'
  },

  // Charge types
  {
    conceptId: 'charge-types',
    type: T.MULTIPLE_CHOICE,
    question: 'When you rub a glass rod with silk, electrons move from the glass to the silk. What is the final charge of the glass rod?',
    options: ['Negative', 'Positive', 'Neutral', 'It depends on the temperature'],
    answer: 1,
    explanation: 'Losing electrons leaves the glass with more protons, so it becomes positively charged.'
  },
  {
    conceptId: 'charge-types',
    type: T.TRUE_FALSE,
    question: 'Induction charges an object without any direct contact between objects.',
    options: ['True', 'False'],
    answer: 0,
    explanation: 'Induction redistributes charge without contact — a charged object near a conductor pulls opposite charges toward itself.'
  },

  // Quantization
  {
    conceptId: 'charge-quantization',
    type: T.MULTIPLE_CHOICE,
    question: 'What is the value of the elementary charge e?',
    options: ['1.6 × 10⁻¹⁹ C', '9.1 × 10⁻³¹ C', '6.24 × 10¹⁸ C', '1.6 × 10¹⁹ C'],
    answer: 0,
    explanation: 'The elementary charge is e = 1.602 × 10⁻¹⁹ C. Every charge is an integer multiple of e.'
  },
  {
    conceptId: 'charge-quantization',
    type: T.TRUE_FALSE,
    question: 'A charged object can carry exactly 1.5 times the elementary charge.',
    options: ['True', 'False'],
    answer: 1,
    explanation: 'Charge is quantized — it must be a whole-number multiple of e. You can never observe 1.5e.'
  },

  // Coulomb's law
  {
    conceptId: 'coulombs-law',
    type: T.MULTIPLE_CHOICE,
    question: 'If the distance between two charges is doubled, what happens to the electric force between them?',
    options: ['It doubles', 'It halves', 'It becomes one quarter', 'It stays the same'],
    answer: 2,
    explanation: 'Coulomb\u2019s law is inverse-square: F ∝ 1/r². Doubling r makes the force 1/4 as strong.'
  },
  {
    conceptId: 'coulombs-law',
    type: T.MULTIPLE_CHOICE,
    question: 'Two positive charges are placed near each other. What force do they feel?',
    options: ['Attraction', 'Repulsion', 'No force', 'Gravitational pull only'],
    answer: 1,
    explanation: 'Like charges repel. Two positives push each other apart with a force given by Coulomb\u2019s law.'
  },
  {
    conceptId: 'coulombs-law',
    type: T.SHORT_ANSWER,
    question: 'State Coulomb\u2019s law formula for the force between two point charges.',
    answer: ['F = k q1 q2 / r2', 'F = kq1q2/r2', 'F = k·q1·q2 / r²'],
    explanation: 'F = k·q₁q₂/r² where k ≈ 8.99 × 10⁹ N·m²/C². Force is proportional to the product of charges and inversely proportional to the square of distance.'
  },

  // Electric field
  {
    conceptId: 'electric-field',
    type: T.MULTIPLE_CHOICE,
    question: 'What is the direction of electric field lines around a positive charge?',
    options: ['Toward the charge', 'Away from the charge', 'Circular around it', 'Random directions'],
    answer: 1,
    explanation: 'Field lines point away from positive charges and toward negative charges.'
  },
  {
    conceptId: 'electric-field',
    type: T.MULTIPLE_CHOICE,
    question: 'What are the units of electric field strength?',
    options: ['Joules', 'Volts only', 'Newtons per coulomb', 'Watts'],
    answer: 2,
    explanation: 'E = F/q, so units are N/C — equivalently V/m.'
  },
  {
    conceptId: 'electric-field',
    type: T.TRUE_FALSE,
    question: 'The electric field is a vector quantity.',
    options: ['True', 'False'],
    answer: 0,
    explanation: 'The field has both magnitude and direction, so it is a vector. That is why field lines show direction.'
  },
  {
    conceptId: 'field-lines',
    type: T.MULTIPLE_CHOICE,
    question: 'Which statement about electric field lines is correct?',
    options: ['They can cross each other', 'Closer lines mean a weaker field', 'They never cross', 'They only exist inside conductors'],
    answer: 2,
    explanation: 'Field lines never cross, and closer spacing means a stronger field.'
  },
  {
    conceptId: 'field-point-charge',
    type: T.MULTIPLE_CHOICE,
    question: 'What is the electric field at distance r from a point charge q?',
    options: ['E = kq/r', 'E = kq/r²', 'E = kq²/r', 'E = k/r²'],
    answer: 1,
    explanation: 'E = kq/r² for a point charge — an inverse-square relationship.'
  },

  // Potential
  {
    conceptId: 'electric-potential',
    type: T.MULTIPLE_CHOICE,
    question: 'What is electric potential measured in?',
    options: ['Amperes', 'Ohms', 'Volts', 'Coulombs'],
    answer: 2,
    explanation: 'Electric potential is measured in volts (V). One volt is one joule per coulomb.'
  },
  {
    conceptId: 'electric-potential',
    type: T.TRUE_FALSE,
    question: 'Electric potential is a scalar quantity.',
    options: ['True', 'False'],
    answer: 0,
    explanation: 'Unlike the field, potential is a scalar — potentials from multiple charges simply add.'
  },
  {
    conceptId: 'voltage',
    type: T.MULTIPLE_CHOICE,
    question: 'What is voltage?',
    options: ['The flow of charge', 'The opposition to current', 'The difference in electric potential between two points', 'The strength of a magnetic field'],
    answer: 2,
    explanation: 'Voltage is the potential difference between two points — the "pressure" that drives current.'
  },
  {
    conceptId: 'voltage',
    type: T.SHORT_ANSWER,
    question: 'What pushes electric charge through a circuit?',
    answer: ['voltage', 'potential difference', 'voltage difference', 'emf'],
    explanation: 'Voltage (potential difference) acts like pressure and pushes charge through the circuit.'
  },
  {
    conceptId: 'potential-point-charge',
    type: T.MULTIPLE_CHOICE,
    question: 'How does the potential due to a point charge depend on distance?',
    options: ['V ∝ 1/r²', 'V ∝ 1/r', 'V ∝ r²', 'V is constant'],
    answer: 1,
    explanation: 'V = kq/r, so potential falls off as 1/r — slower than the field, which falls as 1/r².'
  },

  // Energy
  {
    conceptId: 'potential-energy',
    type: T.TRUE_FALSE,
    question: 'Like charges have positive electric potential energy.',
    options: ['True', 'False'],
    answer: 0,
    explanation: 'Like charges repel, so U = kq₁q₂/r is positive — energy is stored in the separation.'
  },
  {
    conceptId: 'potential-energy',
    type: T.MULTIPLE_CHOICE,
    question: 'The electric potential energy of two opposite charges is…',
    options: ['Positive', 'Negative', 'Always zero', 'Infinite'],
    answer: 1,
    explanation: 'Opposite charges attract and bind together, so their potential energy is negative.'
  },
  {
    conceptId: 'work-energy',
    type: T.MULTIPLE_CHOICE,
    question: 'The work done moving a charge q through a potential difference ΔV is:',
    options: ['W = q/ΔV', 'W = q·ΔV', 'W = ΔV/q', 'W = q²·ΔV'],
    answer: 1,
    explanation: 'W = q·ΔV — work equals charge times potential difference.'
  },

  // Capacitance
  {
    conceptId: 'capacitance',
    type: T.MULTIPLE_CHOICE,
    question: 'What is capacitance defined as?',
    options: ['C = V/Q', 'C = Q/V', 'C = Q·V', 'C = Q + V'],
    answer: 1,
    explanation: 'C = Q/V — the charge stored per volt of potential difference.'
  },
  {
    conceptId: 'capacitance',
    type: T.MULTIPLE_CHOICE,
    question: 'What is the unit of capacitance?',
    options: ['Ohm', 'Farad', 'Henry', 'Tesla'],
    answer: 1,
    explanation: 'Capacitance is measured in farads (F). One farad = one coulomb per volt.'
  },
  {
    conceptId: 'capacitors',
    type: T.MULTIPLE_CHOICE,
    question: 'Which factor increases the capacitance of a parallel-plate capacitor?',
    options: ['Increasing plate separation d', 'Increasing plate area A', 'Decreasing plate area', 'Adding resistance'],
    answer: 1,
    explanation: 'C = ε₀A/d — larger plate area increases capacitance; larger separation decreases it.'
  },
  {
    conceptId: 'capacitors',
    type: T.MULTIPLE_CHOICE,
    question: 'The energy stored in a charged capacitor is:',
    options: ['U = ½CV²', 'U = CV', 'U = ½CV', 'U = 2CV²'],
    answer: 0,
    explanation: 'Energy stored is U = ½·C·V².'
  },
  {
    conceptId: 'dielectrics',
    type: T.TRUE_FALSE,
    question: 'A dielectric material always increases the capacitance of a capacitor.',
    options: ['True', 'False'],
    answer: 0,
    explanation: 'Inserting a dielectric multiplies capacitance by κ ≥ 1: C = κ·C₀.'
  },

  // Circuits
  {
    conceptId: 'circuits',
    type: T.TRUE_FALSE,
    question: 'Electric current can flow through an open switch.',
    options: ['True', 'False'],
    answer: 1,
    explanation: 'An open switch breaks the loop, so no current flows. The circuit must be complete.'
  },
  {
    conceptId: 'circuits',
    type: T.MULTIPLE_CHOICE,
    question: 'For current to flow, a circuit must be…',
    options: ['Open', 'Closed and complete', 'Very long', 'Made of rubber'],
    answer: 1,
    explanation: 'Current needs a complete, closed loop from one terminal of the source to the other.'
  },
  {
    conceptId: 'current',
    type: T.MULTIPLE_CHOICE,
    question: 'One ampere of current equals:',
    options: ['One ohm per second', 'One coulomb per second', 'One volt per second', 'One joule per coulomb'],
    answer: 1,
    explanation: '1 A = 1 C/s — one coulomb of charge passing per second.'
  },
  {
    conceptId: 'current',
    type: T.SHORT_ANSWER,
    question: 'In which direction does conventional current flow?',
    answer: ['positive to negative', 'from positive to negative', '+ to -', 'plus to minus'],
    explanation: 'Conventional current flows from the positive terminal to the negative terminal — opposite to electron flow.'
  },
  {
    conceptId: 'resistance',
    type: T.MULTIPLE_CHOICE,
    question: 'What is the unit of resistance?',
    options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
    answer: 2,
    explanation: 'Resistance is measured in ohms (Ω). One ohm = one volt per ampere.'
  },
  {
    conceptId: 'ohms-law',
    type: T.MULTIPLE_CHOICE,
    question: 'A 12 V battery is connected across a 4 Ω resistor. What is the current?',
    options: ['48 A', '3 A', '0.33 A', '16 A'],
    answer: 1,
    explanation: 'I = V/R = 12/4 = 3 A.'
  },
  {
    conceptId: 'ohms-law',
    type: T.MULTIPLE_CHOICE,
    question: 'Ohm\u2019s law states that:',
    options: ['V = I/R', 'I = V·R', 'V = I·R', 'R = I·V'],
    answer: 2,
    explanation: 'V = I·R. The voltage across a resistor is the product of current and resistance.'
  },
  {
    conceptId: 'series-parallel',
    type: T.MULTIPLE_CHOICE,
    question: 'Two 6 Ω resistors are connected in series. What is the total resistance?',
    options: ['3 Ω', '6 Ω', '12 Ω', '36 Ω'],
    answer: 2,
    explanation: 'Series resistances add: R = R₁ + R₂ = 6 + 6 = 12 Ω.'
  },
  {
    conceptId: 'series-parallel',
    type: T.MULTIPLE_CHOICE,
    question: 'Two 6 Ω resistors are connected in parallel. What is the total resistance?',
    options: ['12 Ω', '3 Ω', '6 Ω', '36 Ω'],
    answer: 1,
    explanation: 'For parallel: 1/R = 1/6 + 1/6 = 1/3, so R = 3 Ω — less than either resistor alone.'
  }
];

// Detailed concept tutor content enhancements used by mock explanations.
export const conceptDeepDives = {
  'electric-field': {
    analogy: 'Think of a crowd around a celebrity: the celebrity (charge) pushes and pulls people (other charges) around them — that invisible influence zone is the field.',
    commonMistake: 'Students often think the field is "in" the charge. Actually the field exists everywhere around the charge and gets weaker with distance.'
  },
  'voltage': {
    analogy: 'Voltage is water pressure in a pipe. High pressure pushes water fast even through narrow pipes; high voltage pushes charge even through high resistance.',
    commonMistake: 'Voltage is not "how much electricity there is". It is the difference in potential that makes charge move.'
  },
  'capacitance': {
    analogy: 'A capacitor is like a water tank: capacitance is the size of the tank (how much it can hold per unit height), voltage is the water level.',
    commonMistake: 'Capacitance does not change when you change the charge — it depends only on geometry and the dielectric.'
  },
  'current': {
    analogy: 'Current is like the flow rate of a river — how much water passes a point per second, regardless of how wide the river is.',
    commonMistake: 'Current does not get "used up" by components. The same current flows through every part of a series circuit.'
  },
  'electric-potential': {
    analogy: 'Potential is like elevation on a map. A hiker at a higher elevation has more stored energy — a charge at higher potential has more electric potential energy per unit charge.',
    commonMistake: 'Potential is not the same as potential energy. Potential is energy per unit charge (V = U/q).'
  }
};