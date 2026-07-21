import type { Rubric } from "@/types";

export const mockPresentationRubric: Rubric = {
  id: "rub-pres-v1",
  title: "Oral Presentation & Q&A Defense",
  levels: [
    { range: "5", descriptor: "Exemplary" },
    { range: "3-4", descriptor: "Competent" },
    { range: "1-2", descriptor: "Unsatisfactory" }
  ],
  components: [
    {
      id: "comp-delivery",
      name: "Delivery and Engagement",
      weightage: 60,
      commentable: true,
      levelDescriptions: [
        {
          levelDescriptor: "Exemplary",
          description: "Speaker maintains exceptional pacing, excellent eye contact, and utilizes visual aids perfectly to enhance complex concepts."
        },
        {
          levelDescriptor: "Competent",
          description: "Clear articulation with steady pacing; relies somewhat on presentation slides for cues but manages flow effectively."
        },
        {
          levelDescriptor: "Unsatisfactory",
          description: "Monotone or rushed presentation delivery; reads directly from notes or slides, causing severe audibility and audience disconnect."
        }
      ]
    },
    {
      id: "comp-qa-defense",
      name: "Response to Technical Questions",
      weightage: 40,
      commentable: true,
      levelDescriptions: [
        {
          levelDescriptor: "Exemplary",
          description: "Demonstrates authoritative mastery of the topic, handling domain questions with depth, critical accuracy, and confidence."
        },
        {
          levelDescriptor: "Competent",
          description: "Answers core questions accurately but struggles to articulate solutions clearly when pushed on complex edge scenarios."
        },
        {
          levelDescriptor: "Unsatisfactory",
          description: "Unable to answer basic theoretical questions correctly or displays defensive reactions to technical critique."
        }
      ]
    }
  ]
};
