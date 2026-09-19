import {
  TopicSummary,
  QuizQuestion,
  WeakTopic,
  CoverageGap,
  WeightedTopic
} from './types';

export const INITIAL_TOPICS: TopicSummary[] = [
  {
    topic_id: 't1',
    name: 'Virtual Memory Paging & Multi-Level Page Tables',
    summary: 'Virtual memory separates user logical memory from physical memory. **Multi-level paging** avoids allocating large contiguous page tables in main memory by organizing them into hierarchical levels ($L_1, L_2$). A Translation Lookaside Buffer (**TLB**) caches recent translations; TLB misses incur high memory traversal overhead. In 64-bit architectures, inverted page tables or hashed page tables reduce physical storage overhead.'
  },
  {
    topic_id: 't2',
    name: 'Carbonyl Nucleophilic Additions & Grignard Reagents',
    summary: 'Nucleophilic addition to carbonyls ($C=O$) proceeds via attack on the electrophilic carbonyl carbon, forming a tetrahedral alkoxide intermediate. Grignard reagents ($R-MgX$) act as powerful carbon nucleophiles, converting aldehydes to secondary alcohols and ketones to tertiary alcohols. The addition is irreversible under anhydrous ether conditions and must be protected against protic solvents.'
  },
  {
    topic_id: 't3',
    name: 'IS-LM General Equilibrium & Mundell-Fleming Model',
    summary: 'The **IS curve** represents equilibrium in the goods market ($Y = C(Y-T) + I(r) + G$), sloping downward as interest rates depress investment. The **LM curve** represents money market equilibrium ($M/P = L(r, Y)$). Under the Mundell-Fleming open-economy model with flexible exchange rates, monetary policy is highly effective while fiscal policy suffers complete crowding out via currency appreciation.'
  },
  {
    topic_id: 't4',
    name: 'Second Law of Thermodynamics & Entropy Proofs',
    summary: 'The Second Law dictates that the total entropy $S$ of an isolated system never decreases: $\\Delta S_{univ} \\ge 0$. Reversible Carnot engines provide the theoretical upper limit of thermodynamic efficiency: $\\eta = 1 - T_C/T_H$. Proof of Clausius inequality $\\oint \\frac{\\delta Q}{T} \\le 0$ demonstrates the state function property of entropy.'
  }
];

export const INITIAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    topic_id: 't1',
    question: 'In a 2-level 32-bit paging system with 4KB pages and 4-byte PTEs, how many page table entries are in the outer page table if the virtual address is split 10-10-12?',
    options: [
      '1,024 entries (4 KB)',
      '4,096 entries (16 KB)',
      '512 entries (2 KB)',
      '256 entries (1 KB)'
    ],
    correct_answer_index: 0
  },
  {
    id: 'q2',
    topic_id: 't1',
    question: 'What is the primary performance penalty of a TLB miss in a system with 4-level page tables without hardware page walkers?',
    options: [
      '4 sequential main memory accesses to retrieve the physical frame address',
      'Immediate page fault triggering an OS disk swap interrupt',
      'Flushing the entire L1 data cache to guarantee coherency',
      'A hardware trap requiring CPU microcode reboot'
    ],
    correct_answer_index: 0
  },
  {
    id: 'q3',
    topic_id: 't2',
    question: 'Why does adding a Grignard reagent (CH3MgBr) to acetone yield a tertiary alcohol after aqueous workup?',
    options: [
      'The methyl carbanion attacks the carbonyl carbon, forming a magnesium alkoxide that protonates to 2-methylpropan-2-ol',
      'The reagent acts as a Bronsted-Lowry base to abstract the alpha-hydrogen',
      'Acetone undergoes keto-enol tautomerization before nucleophilic substitution',
      'The Grignard reagent reduces the carbonyl via hydride transfer'
    ],
    correct_answer_index: 0
  },
  {
    id: 'q4',
    topic_id: 't3',
    question: 'In a small open economy with perfect capital mobility and floating exchange rates (Mundell-Fleming), what happens when the central bank increases money supply?',
    options: [
      'Domestic interest rate tries to fall, currency depreciates, net exports increase, raising income Y',
      'Domestic interest rate rises, attracting capital inflows and appreciating the currency',
      'Fiscal policy completely crowds out monetary policy, leaving output unchanged',
      'The IS curve shifts left due to inflation expectations'
    ],
    correct_answer_index: 0
  },
  {
    id: 'q5',
    topic_id: 't4',
    question: 'According to the Clausius inequality, for any spontaneous (irreversible) cyclic thermodynamic process, what is the value of the cyclic integral of δQ/T?',
    options: [
      'Strictly less than 0 (∮ δQ/T < 0)',
      'Exactly equal to 0 (∮ δQ/T = 0)',
      'Strictly greater than 0 (∮ δQ/T > 0)',
      'Equal to the total boundary work W_net'
    ],
    correct_answer_index: 0
  }
];

export const INITIAL_WEAK_TOPICS: WeakTopic[] = [
  {
    topic_id: 't1',
    name: 'Virtual Memory Multi-Level Page Tables & TLB Penalties',
    reason: 'Missed 2/3 quiz drill questions; appeared in 35% of past Tripos papers (2020–2024)',
    severity: 'high'
  },
  {
    topic_id: 't4',
    name: 'Second Law Entropy Proofs & Clausius Inequality',
    reason: 'Zero student notes uploaded; flagged in syllabus audit as mandatory 20-mark derivation',
    severity: 'high'
  },
  {
    topic_id: 't3',
    name: 'Mundell-Fleming Floating Exchange Rate Equilibria',
    reason: 'Missed quantitative derivation question on monetary expansion transmission mechanism',
    severity: 'medium'
  },
  {
    topic_id: 't2',
    name: 'Carbonyl Grignard Reagent Synthetic Pathways',
    reason: 'Answered correctly on second attempt; high recurrence rate in past Part II papers',
    severity: 'low'
  }
];

export const INITIAL_COVERAGE_GAPS: CoverageGap[] = [
  {
    name: 'Second Law Clausius Inequality & Entropy Proofs',
    reason: 'Topic listed in Syllabus Section 4.2 but absent in all uploaded student lecture slides'
  },
  {
    name: 'Inverted Page Table Hashing & Translation Algorithms',
    reason: 'Covered only superficially (1 paragraph) in OS notes, expected as full 15-mark essay'
  },
  {
    name: 'Open Economy IS-LM-BP Fiscal Policy Crowding-out Derivations',
    reason: 'Mathematical proofs missing; only qualitative lecture summary provided in candidate notes'
  }
];

export const INITIAL_WEIGHTED_TOPICS: WeightedTopic[] = [
  {
    topic_id: 't1',
    name: 'Virtual Memory Paging & Multi-Level Page Tables',
    frequency: 6,
    years_seen: ['2019', '2020', '2021', '2022', '2023', '2024'],
    weight: 'high'
  },
  {
    topic_id: 't4',
    name: 'Second Law of Thermodynamics & Entropy Proofs',
    frequency: 5,
    years_seen: ['2018', '2020', '2022', '2023', '2024'],
    weight: 'high'
  },
  {
    topic_id: 't3',
    name: 'IS-LM General Equilibrium & Mundell-Fleming Model',
    frequency: 4,
    years_seen: ['2019', '2021', '2023', '2024'],
    weight: 'medium'
  },
  {
    topic_id: 't2',
    name: 'Carbonyl Nucleophilic Additions & Grignard Reagents',
    frequency: 3,
    years_seen: ['2020', '2022', '2024'],
    weight: 'medium'
  },
  {
    topic_id: 't5',
    name: 'Fourier Series & Orthogonal Wavelet Transforms',
    frequency: 2,
    years_seen: ['2021', '2023'],
    weight: 'low'
  }
];
