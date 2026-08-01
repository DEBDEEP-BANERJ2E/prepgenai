export const mockCommunityNotes = [
  {
    _id: "mock_001",
    topic: "Introduction to React Hooks",
    category: "Computer Science",
    classLevel: "Undergrad",
    examType: "Midterm",
    visibility: "public",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    collaborators: [],
    content: {
      notes: "# React Hooks 101\n\nHooks are a new addition in React 16.8. They let you use state and other React features without writing a class.\n\n## useState\n`useState` is a Hook that lets you add React state to function components.\n\n```javascript\nimport React, { useState } from 'react';\n\nfunction Example() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\n## useEffect\nThe Effect Hook lets you perform side effects in function components.\n\n```javascript\nuseEffect(() => {\n  document.title = `You clicked ${count} times`;\n}, [count]);\n```",
      revisionPoints: [
        "Hooks allow state in functional components.",
        "useState returns the current state and a function to update it.",
        "useEffect is for side effects (data fetching, subscriptions).",
        "The dependency array in useEffect controls when it runs."
      ],
      isManual: false
    }
  },
  {
    _id: "mock_002",
    topic: "Fundamentals of Neuroscience",
    category: "Biology",
    classLevel: "Masters",
    examType: "Finals",
    visibility: "public",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    collaborators: [],
    content: {
      notes: "# Fundamentals of Neuroscience\n\n## The Neuron\nThe neuron is the fundamental unit of the brain and nervous system, responsible for receiving sensory input, sending motor commands, and transforming and relaying electrical signals.\n\n### Parts of a Neuron\n1. **Dendrites**: Receive signals.\n2. **Soma**: Cell body.\n3. **Axon**: Transmits electrical signals.\n4. **Synapse**: Gap where neurotransmitters are released.\n\n## Action Potential\nAn action potential occurs when a neuron sends information down an axon, away from the cell body. It is created by a depolarizing current.",
      revisionPoints: [
        "Neuron is the fundamental unit of the nervous system.",
        "Dendrites receive, Axons transmit.",
        "Synapse is the gap for neurotransmitter release.",
        "Action potential is an all-or-nothing electrical signal."
      ],
      isManual: false
    }
  },
  {
    _id: "mock_003",
    topic: "Linear Algebra: Eigenvectors & Eigenvalues",
    category: "Mathematics",
    classLevel: "Undergrad",
    examType: "Quiz",
    visibility: "public",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    collaborators: [],
    content: {
      notes: "# Eigenvectors & Eigenvalues\n\nIn linear algebra, an eigenvector or characteristic vector of a linear transformation is a nonzero vector that changes at most by a scalar factor when that linear transformation is applied to it.\n\n## Equation\n$$Ax = \\lambda x$$\nWhere:\n- $A$ is a square matrix\n- $x$ is the eigenvector\n- $\\lambda$ is the eigenvalue\n\n## Applications\n- Principal Component Analysis (PCA) in Machine Learning.\n- Google's PageRank algorithm.\n- Vibrational analysis in engineering.",
      revisionPoints: [
        "Eigenvector changes only by a scalar factor under transformation.",
        "Equation: Ax = lambda x.",
        "Lambda is the eigenvalue (the scalar factor).",
        "Used in PCA and PageRank."
      ],
      isManual: false
    }
  },
  {
    _id: "mock_004",
    topic: "World War II: The Pacific Theater",
    category: "History",
    classLevel: "High School",
    examType: "AP History",
    visibility: "public",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    collaborators: [],
    content: {
      notes: "# WWII: The Pacific Theater\n\nThe Pacific War was a major theater of World War II that covered a large portion of the Pacific Ocean, East Asia, and Southeast Asia.\n\n## Key Events\n- **Attack on Pearl Harbor (1941)**: Brought the US into the war.\n- **Battle of Midway (1942)**: The turning point where the US defeated the Japanese navy.\n- **Island Hopping Strategy**: US strategy to capture key islands while bypassing heavily fortified ones.\n- **Atomic Bombings (1945)**: Hiroshima and Nagasaki, leading to Japan's surrender.",
      revisionPoints: [
        "Pearl Harbor brought the US into WWII in 1941.",
        "Battle of Midway (1942) was the turning point in the Pacific.",
        "Island Hopping was the primary US military strategy.",
        "War ended with the atomic bombings in 1945."
      ],
      isManual: false
    }
  },
  {
    _id: "mock_005",
    topic: "Introduction to Machine Learning",
    category: "Computer Science",
    classLevel: "Undergrad",
    examType: "Finals",
    visibility: "public",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    collaborators: [],
    content: {
      notes: "# Introduction to Machine Learning\n\nMachine learning is a subset of AI that focuses on building systems that learn from data.\n\n## Types of Machine Learning\n1. **Supervised Learning**: Model learns from labeled data (e.g., Classification, Regression).\n2. **Unsupervised Learning**: Model finds patterns in unlabeled data (e.g., Clustering, PCA).\n3. **Reinforcement Learning**: Model learns by interacting with an environment to maximize a reward.\n\n## Overfitting vs Underfitting\n- **Overfitting**: Model memorizes the training data but fails to generalize to new data.\n- **Underfitting**: Model is too simple to capture the underlying structure of the data.",
      revisionPoints: [
        "Supervised learning uses labeled data.",
        "Unsupervised learning uses unlabeled data to find patterns.",
        "Overfitting fails to generalize to new data.",
        "Underfitting fails to capture training data complexity."
      ],
      isManual: false
    }
  },
  {
    _id: "mock_006",
    topic: "Organic Chemistry: SN1 vs SN2 Reactions",
    category: "Chemistry",
    classLevel: "Undergrad",
    examType: "Midterm",
    visibility: "public",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    collaborators: [],
    content: {
      notes: "# SN1 vs SN2 Reactions\n\nNucleophilic substitution reactions are fundamental in organic chemistry.\n\n## SN2 Reaction\n- **Kinetics**: Bimolecular (Rate depends on both substrate and nucleophile).\n- **Mechanism**: 1-step (Concerted).\n- **Stereochemistry**: Inversion of configuration.\n- **Substrate Preference**: Primary > Secondary > Tertiary (due to steric hindrance).\n\n## SN1 Reaction\n- **Kinetics**: Unimolecular (Rate depends only on substrate).\n- **Mechanism**: 2-step (Carbocation intermediate).\n- **Stereochemistry**: Racemization.\n- **Substrate Preference**: Tertiary > Secondary > Primary (due to carbocation stability).",
      revisionPoints: [
        "SN2 is bimolecular and 1-step.",
        "SN2 causes inversion of stereochemistry.",
        "SN1 is unimolecular and 2-step.",
        "SN1 involves a carbocation intermediate leading to racemization."
      ],
      isManual: false
    }
  }
];
