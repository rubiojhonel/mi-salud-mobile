const config = {
  "api": "https://mi-salud.herokuapp.com",
  "deploymentTypes": {
    "pre": "Pre-deployment",
    "during": "During deployment",
    "post": "Post deployment"
  },
  "severityColors": ["#5cb85c", "#f0ad4e", "#bf0e08"],
  "categoryIcons": {
    "sleep": { "type": "MaterialCommunityIcons", "name": "sleep" },
    "eat": { "type": "MaterialCommunityIcons", "name": "food" },
    "family": { "type": "MaterialCommunityIcons", "name": "heart-multiple" },
    "exposure": { "type": "MaterialCommunityIcons", "name": "eye-settings" },
    "support": { "type": "MaterialCommunityIcons", "name": "account-group" }
  },
  "advice": [
    // Severity 0 (GREEN)
    {
      "preAndDuring": "You are set and ready to do response work.",
      "post": "You managed to be well-conditioned throughout your response work.",
      "general": `
        To maintain wellness, keep these in mind:\n
        - Get at least 7 hours of sleep\n
        - Eat enough food and fill your body with nutrients\n
        - Drink water frequently\n
        - Exercise when able\n
        - Practice breathing and relaxation techniques\n
        - Always communicate with your teammates and team leaders
      `
    },
    // Severity 1 (YELLOW)
    {
      "preAndDuring": "It may benefit you to do these to be set and ready for your response work:",
      "post": "It may benefit you to do these to maintain wellness for your next response work:",
      "sleep": `
        - Get more sleep (at least 7 hours is recommended)
      `,
      "eat": `
        - Eat a full and nutritious meal 
      `,
      "exposure": `
        - Ask for rotation of tasks from team leader if possible\n
        - Talk to a trusted person about your feelings and experiences\n
        - Practice breathing and relaxation techniques
      `,
      "family": {
        "pre": `
          - Contact your family, loved ones, and/or friends to make sure they are safe
        `,
        "during": `
          - Request for family welfare check from your organization 
        `,
        "post": `
          - Contact your family, loved ones, and/or friends to make sure they are safe
        `
      },
      "support": `
        - Inform your team leader and/or teammates of the support you need
      `
    },
    // Severity 2 (RED)
    {
      "preAndDuring": "It is best for you to do these to be set and ready for your response work:",
      "post": "It is best for you to do these to maintain wellness for your next response work:",
      "sleep": `
        - Get enough sleep (at least 7 hours is recommended)
      `,
      "eat": `
        - Eat full and nutritious meals
      `,
      "exposure": `
        - Ask for rotation of tasks from team leader if possible\n
        - Talk to a trusted person about your feelings and experiences\n
        - Practice breathing and relaxation techniques\n
        - Seek help from a psychosocial support service provider if needed
      `,
      "family": {
        "pre": `
          - Contact your family, loved ones, and/or friends to make sure they are safe
        `,
        "during": `
          - Request for family welfare check from your organization 
        `,
        "post": `
          - Contact your family, loved ones, and/or friends to make sure they are safe
        `
      },
      "support": `
        - Inform your team leader and/or teammates of the support you need
      `
    }
  ],
  "summary": [
    // Severity 0 (GREEN)
    {
      "preAndDuring": "This responder is set and ready to do response work.",
      "post": "This responder managed to be well-conditioned throughout their response work.",
      "general": "The responder has no problem in this category."
    },
    // Severity 1 (YELLOW)
    {
      "preAndDuring": "It may benefit this responder to do these to be set and ready for their response work:",
      "post": "It may benefit this responder to do these to maintain wellness for their next response work:",
      "sleep": "It may benefit this responder to get more sleep.",
      "eat": "It may benefit this responder to have a full and nutritious meal.",
      "exposure": "It may benefit this responder to be assigned to a different task, talk to a trusted person about his/her feelings and experiences, or practice breathing and relaxation techniques.",
      "family": {
        "pre": "It may benefit this responder to contact his/her family, loved ones, and/or friends.",
        "during": "It may benefit this responder to have a family welfare check by the organization.",
        "post": "It may benefit this responder to contact his/her family, loved ones, and/or friends."
      },
      "support": "It may benefit this responder to receive team and team leader support."
    },
    // Severity 2 (RED)
    {
      "preAndDuring": "It is best for this responder to do these to be set and ready in their response work: ",
      "post": "It is best for this responder to do these to maintain wellness for their next response work:",
      "sleep": "It is best for this responder to get enough sleep.",
      "eat": "It is best for this responder to eat full and nutritious meals.",
      "exposure": "It is best for this responder to be assigned to a different task, talk to a trusted person about his/her feelings and experiences, practice breathing and relaxation techniques, or seek help from psychosocial support service provider.",
      "family": {
        "pre": "It is best for this responder to contact his/her family, loved ones, and/or friends.",
        "during": "It is best for this responder to have a family welfare check by the organization.",
        "post": "It is best for this responder to contact his/her family, loved ones, and/or friends."
      },
      "support": "It is best for this responder to receive team and team leader support."
    }
  ]
}

export default config
