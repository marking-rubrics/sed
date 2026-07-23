import type { Rubric } from "@/types";

export const mockEngineeringRubric: Rubric = {
  id: "rub-eng-proj-001",
  title: "Capstone Design Project Evaluation",
  levels: [
    { range: "80-100", descriptor: "Excellent" },
    { range: "60-79", descriptor: "Proficient" },
    { range: "40-59", descriptor: "Developing" },
    { range: "0-39", descriptor: "Novice" }
  ],
  maxScore: 100,
  components: [
    {
      id: "comp-tech-impl",
      name: "Technical Implementation & Execution",
      weightage: 50,
      commentable: true,
      subcomponents: [
        {
          id: "sub-system-design",
          name: "System Architecture & Design",
          weightage: 25,
          commentable: true,
          levelDescriptions: [
            {
              levelDescriptor: "Excellent",
              description: "System architecture is exceptionally robust, highly optimized, and exhibits strong modular design choices with clear separation of concerns."
            },
            {
              levelDescriptor: "Proficient",
              description: "System architecture is functional and mostly modular, meeting all core requirements with minor optimization oversights."
            },
            {
              levelDescriptor: "Developing",
              description: "System architecture works but lacks modularity; heavy coupling presents severe scalability or maintenance bottlenecks."
            },
            {
              levelDescriptor: "Novice",
              description: "System design is non-functional, disorganized, or lacks clear architectural logic entirely."
            }
          ]
        },
        {
          id: "sub-testing-valid",
          name: "Testing & Validation",
          weightage: 25,
          commentable: true,
          levelDescriptions: [
            {
              levelDescriptor: "Excellent",
              description: "Comprehensive automated test suites cover edge cases flawlessly. System validation aligns perfectly with performance constraints."
            },
            {
              levelDescriptor: "Proficient",
              description: "Core test suites cover standard operations successfully, but edge cases are largely tested manually or ignored."
            },
            {
              levelDescriptor: "Developing",
              description: "Minimal verification steps provided; testing documentation lacks structure or fails to prove validation parameters."
            },
            {
              levelDescriptor: "Novice",
              description: "No evidence of functional system testing or validation methods."
            }
          ]
        }
      ]
    }
  ]
};
